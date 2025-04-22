#ifndef COMMON_DATA_H
#define COMMON_DATA_H

#define MAX_ARGS 25
#define ARG_LEN 128
#define PATH_LEN 256

enum syscalls : int {
	EXECVE   = 0,
	OPENAT   = 1,
	SOCKET   = 2,
	SENDTO    = 3
};

// structure of events placed into the shared ring buffer
// needed in both eBPF and userspace logger
struct event {
    uint64_t timestamp;
	__u32 pid;
    enum syscalls call;
	__u32 ppid;
    char filename[PATH_LEN];
    __u32 argc;
    char argv[MAX_ARGS][ARG_LEN];
};

#endif

