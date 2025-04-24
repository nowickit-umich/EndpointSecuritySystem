//
// eBPF loader program
// loads the eBPF skeleton 
//
// reads events from shared ringbuffer and submits to log API

#include <stdlib.h>
#include <string.h>
#include <pthread.h>
#include <stdio.h>
#include <unistd.h>
#include <signal.h>
#include <curl/curl.h>
#include <semaphore.h>
#include "cJSON.h"

#include "monitoringAgent.skel.h"
#include "common_data.h"

// path of config file
#define CONFIG_PATH "/etc/monitoringAgent.conf"

// signal to stop all threads
static volatile sig_atomic_t exit_flag = 0;
// signal handler
static void handle_sigint(int sig) {
    exit_flag = 1;
}

// buffer to collect events
static struct event* event_buffer;
static int event_count = 0;

// Global config options, read from config file
struct config{
	char api[256];   // api endpoint
	char key[128];   // api key
	char name[64];   // endpoint name
	char id[64];     // endpoint id
	int buffer_size; // max size of event buffer, the max number of events sent in each API call
	int batch_size;  // minimum number of events to post per API call
} config;

// helper function to remove whitespace from config lines
void trim(char **str){
	char *end = *str + strlen(*str) - 1;
	while(*end == ' ' || *end == '\n' || *end == '\t' || *end == '\r'){
		end--;
	}
	*(end + 1) = '\0';
}

// return -1 if the config is invalid
int validate_config(){
	if (strlen(config.api) == 0) {
        fprintf(stderr, "Config Error: API endpoint is not set.\n");
        return -1;
    }
    if (strlen(config.key) == 0) {
        fprintf(stderr, "Config Error: API key is not set.\n");
        return -1;
    }
    if (strlen(config.name) == 0) {
        fprintf(stderr, "Config Error: Endpoint name is not set.\n");
        return -1;
    }
    if (strlen(config.id) == 0) {
        fprintf(stderr, "Config Error: Endpoint ID is not set.\n");
        return -1;
    }
    if (config.buffer_size <= 16) {
        fprintf(stderr, "Config Error: Invalid buffer size.\n");
        return -1;
    }
    if (config.batch_size <= 1) {
        fprintf(stderr, "Config Error: Invalid batch size.\n");
        return -1;
    }
    return 0;
}

// read config file and populate the global config struct
int load_config(){

	// open config file
	FILE *file;
	file = fopen(CONFIG_PATH, "r");
	if(file == NULL){
		fprintf(stderr, "Error: Unable to open config file!\n");
		return -1;
	}
	
	char *line = malloc(320);
	size_t len = 320;
	
	// read all config lines
	while (getline(&line, &len, file) != -1) {
        trim(&line);

        // Skip empty lines, comments, whitespace
        if (line[0] == '#' || line[0] == '\0' || line[0] == ' ' || line[0] == '\t' || line[0] == '\r' || line[0] == '\n'){
            continue;
		}

        char *eq = strchr(line, '=');
        if (!eq) { 
			continue;
		}
		
		// split line
        *eq = '\0'; 
        char *key = line;
        char *value = eq + 1;

        if (strcmp(key, "api") == 0) {
            strncpy(config.api, value, sizeof(config.api) - 1);
            config.api[sizeof(config.api) - 1] = '\0';
        } 
		else if (strcmp(key, "key") == 0) {
            strncpy(config.key, value, sizeof(config.key) - 1);
            config.key[sizeof(config.key) - 1] = '\0';
        } 
		else if (strcmp(key, "name") == 0) {
            strncpy(config.name, value, sizeof(config.name) - 1);
            config.key[sizeof(config.key) - 1] = '\0';
        } 
		else if (strcmp(key, "id") == 0) {
            strncpy(config.id, value, sizeof(config.id) - 1);
            config.key[sizeof(config.key) - 1] = '\0';
        } 
		else if (strcmp(key, "buffer_size") == 0) {
            int s = atoi(value);
			if (s < 32){
				s = 32;
			}
			config.buffer_size = s;
        } 
		else if (strcmp(key, "batch_size") == 0) {
            int s = atoi(value);
			if (s < 1){
				s = 1;
			}
			config.batch_size = s;
        }
    }
	
	free(line);
	fclose(file);

	//ensure the buffer is large enough
	if (config.buffer_size < config.batch_size * 2){
		config.buffer_size = config.batch_size * 2;
	}

	if(validate_config() < 0){
		return -1;
	}

	return 0;
}

// helper function to convert nanoseconds since boot to Unix timestamp
time_t convert_ns_to_unix(uint64_t nanoseconds_since_boot) {
    struct timespec ts;
    clock_gettime(CLOCK_REALTIME, &ts);
    uint64_t current_unix_nanoseconds = (uint64_t)ts.tv_sec * 1000000000ULL + (uint64_t)ts.tv_nsec;
    
    // Subtract the boot time nanoseconds from the current time nanoseconds
    uint64_t unix_nanoseconds = current_unix_nanoseconds - nanoseconds_since_boot;

    // Convert back to time_t (seconds)
    time_t unix_seconds = (time_t)(unix_nanoseconds / 1000000000ULL);
    return unix_seconds;
}

// Function to submit events to the API
int submit_events(struct event *events, int count) {
    CURL *curl;
    CURLcode res;

    // Set up curl for POST request
    curl = curl_easy_init();
    if (!curl) {
        fprintf(stderr, "Failed to initialize curl\n");
        return -1;
    }

    // Prepare data for POST (this can be JSON or any suitable format)
	// Create the root object
    cJSON *root = cJSON_CreateObject();
    
    // Create the "events" array
    cJSON *events_array = cJSON_CreateArray();
    
    // Loop over each event and build its JSON object
    for (int i = 0; i < count; i++) {
        // Create a new event object
        cJSON *event = cJSON_CreateObject();

        // Add fields to the event object
        cJSON_AddNumberToObject(event, "timestamp", convert_ns_to_unix(events[i].timestamp));
        cJSON_AddNumberToObject(event, "type", events[i].call);
        cJSON_AddNumberToObject(event, "pid", events[i].pid);
        cJSON_AddNumberToObject(event, "ppid", events[i].ppid);
        cJSON_AddStringToObject(event, "filename", events[i].filename);
        cJSON_AddNumberToObject(event, "argc", events[i].argc);

        // Create the "argv" array for the event
        cJSON *argv_array = cJSON_CreateArray();
        for (int j = 0; j < events[i].argc; j++) {
            cJSON_AddItemToArray(argv_array, cJSON_CreateString(events[i].argv[j]));
        }
        cJSON_AddItemToObject(event, "argv", argv_array);

        // Add the event to the "events" array
        cJSON_AddItemToArray(events_array, event);
    }

	// add the id to the root
	cJSON_AddStringToObject(root, "id", config.id);

    // Add the "events" array to the root object
    cJSON_AddItemToObject(root, "events", events_array);

    // Convert the root object to a string
    char *post_data = cJSON_PrintUnformatted(root);
   

    //debug
    printf("%s\n", post_data);

    // Set up the curl options
    curl_easy_setopt(curl, CURLOPT_URL, config.api);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, post_data);
	
	// Set the Content-Type header to application/json
	struct curl_slist *headers = NULL;
	headers = curl_slist_append(headers, "Content-Type: application/json");
	
	// Add the API key
	char auth_header[256];
	snprintf(auth_header, sizeof(auth_header), "Authorization: Bearer %s", config.key);
	headers = curl_slist_append(headers, auth_header);
	
	curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);


    // Perform the request
    res = curl_easy_perform(curl);
    if (res != CURLE_OK) {
        fprintf(stderr, "Curl request failed: %s\n", curl_easy_strerror(res));
        curl_easy_cleanup(curl);
        return 0;
    }

    curl_easy_cleanup(curl);
    return 0;
}

// Event handler function called by BPF ring buffer
static int handle_event(void *ctx, void *data, size_t len) {
    struct event *e = (struct event*) data;
    // Add event to buffer
    if (event_count > config.buffer_size){
		fprintf(stderr, "Error: event buffer full! Dropping Events!\n");
	}
	else {
        event_buffer[event_count++] = *e;
    }

    // submit the events and reset the buffer
    if (event_count >= config.batch_size) {
        if (submit_events(event_buffer, event_count) == 0) {
            // Reset buffer after successful submission
            // drops logs in buffer if API call fails
			event_count = 0;
        }
    }
    return 0;
}

int main() {
    
	// try and load config from file
	if(load_config() < 0){
		fprintf(stderr, "Error: Failed to load config file!\n");
		return -1;
	}	
	
	event_buffer = malloc(config.buffer_size * sizeof(struct event));
    if (event_buffer == NULL){
        fprintf(stderr, "Error: Unable to allocate event buffer!\n");
        return -1;
    }

	struct monitoringAgent_bpf *skel;
    struct ring_buffer *rb = NULL;
    int err;

    signal(SIGINT, handle_sigint);
    signal(SIGTERM, handle_sigint);

    skel = monitoringAgent_bpf__open_and_load();
    if (!skel) {
        fprintf(stderr, "Failed to open/load BPF skeleton\n");
        return -1;
    }

    err = monitoringAgent_bpf__attach(skel);
    if (err) {
        fprintf(stderr, "Failed to attach BPF program\n");
        monitoringAgent_bpf__destroy(skel);
        return -1;
    }

    rb = ring_buffer__new(bpf_map__fd(skel->maps.rb), handle_event, NULL, NULL);
    if (!rb) {
        fprintf(stderr, "Failed to create ring buffer\n");
        monitoringAgent_bpf__destroy(skel);
        return -1;
    }

    printf("Tracing system calls.\n");
    while (!exit_flag) {

        err = ring_buffer__poll(rb, 1000);
        if (err < 0) {
            fprintf(stderr, "Error: Ring buffer poll error: %d\n", err);
            break;
        }
    }

    ring_buffer__free(rb);
    monitoringAgent_bpf__destroy(skel);
    free(event_buffer);
    return 0;
}

