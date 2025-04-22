// define all tracepoint handlers
//

#include "vmlinux.h"
#include <bpf/bpf_helpers.h>
#include <bpf/bpf_core_read.h>
#include "common_data.h"

//license is required or there is an error when loading
char LICENSE[] SEC("license") = "GPL";

// ringbuffer is used to pass logs to userspace
struct {
    __uint(type, BPF_MAP_TYPE_RINGBUF);
    __uint(max_entries, 1 << 24); // 16 MB
} rb SEC(".maps");


/* ************************************************************
 *	TRACE SYSCALL SENDTO
 * ************************************************************
 * */
// format obtained from /sys/kernel/tracing/events/syscalls/
struct trace_event_raw_sys_enter_sendto {
    uint16_t common_type;
    uint8_t common_flags;
    uint8_t common_preempt_count;
    int32_t common_pid;

    int32_t __syscall_nr;
    int32_t __pad;
    
	void* fd;
    uint64_t buff;  // contains the data to send
    uint64_t len;   // len of buff
    uint64_t flags;
	struct sockaddr* addr;
    uint64_t addr_len;	
};

// syscall sendto logger
SEC("tracepoint/syscalls/sys_enter_sendto")
int handle_sendto(const struct trace_event_raw_sys_enter_sendto *ctx){
	struct event *e;
	
	// open ring buffer	
    e = bpf_ringbuf_reserve(&rb, sizeof(*e), 0);
    if (!e){
		return 0;
	}

	e->timestamp = bpf_ktime_get_ns();	
	//ignore ppid for this syscall
	e->ppid = 0;	
	e->call = SENDTO;	
    e->pid = bpf_get_current_pid_tgid() >> 32;
	e->argc = 3;
	//strcpy(e->argv[0], );
	//TODO

    bpf_ringbuf_submit(e, 0);
	return 0;
}

/* ************************************************************
 *	TRACE SYSCALL SOCKET
 * ************************************************************
 * */
// format obtained from /sys/kernel/tracing/events/syscalls/
struct trace_event_raw_sys_enter_socket {
    uint16_t common_type;
    uint8_t common_flags;
    uint8_t common_preempt_count;
    int32_t common_pid;

    int32_t __syscall_nr;
    int32_t __pad;
    
    uint64_t family;
    uint64_t type;
    uint64_t protocol;
};

// syscall openat logger
SEC("tracepoint/syscalls/sys_enter_socket")
int handle_socket(const struct trace_event_raw_sys_enter_socket *ctx){
	struct event *e;
	
	// open ring buffer	
    e = bpf_ringbuf_reserve(&rb, sizeof(*e), 0);
    if (!e){
		return 0;
	}

	e->timestamp = bpf_ktime_get_ns();	
	//ignore ppid for this syscall
	e->ppid = 0;	
	e->call = SOCKET;	
    e->pid = bpf_get_current_pid_tgid() >> 32;
	e->argc = 3;
	//TODO

    bpf_ringbuf_submit(e, 0);
	return 0;
}

/* ************************************************************
 *	TRACE SYSCALL OPENAT
 * ************************************************************
 * */
// format obtained from /sys/kernel/tracing/events/syscalls/
struct trace_event_raw_sys_enter_openat {
    unsigned short common_type;
    unsigned char  common_flags;
    unsigned char  common_preempt_count;
    int common_pid;

    int __syscall_nr;
    int __pad;
    
    unsigned long long dfd;
    const char *filename;
    unsigned long long flags;
    unsigned long long mode;
};

// syscall openat logger
SEC("tracepoint/syscalls/sys_enter_openat")
int handle_open(const struct trace_event_raw_sys_enter_openat *ctx){
	struct event *e;
	
	// open ring buffer	
    e = bpf_ringbuf_reserve(&rb, sizeof(*e), 0);
    if (!e){
		return 0;
	}

	e->timestamp = bpf_ktime_get_ns();	
	//ignore ppid for this syscall
	e->ppid = 0;	
	e->call = OPENAT;	
    e->pid = bpf_get_current_pid_tgid() >> 32;
    bpf_probe_read_user_str(e->filename, sizeof(e->filename), ctx->filename);
	e->argc = 1;
	e->argv[0][0] = 'X';

    //bpf_ringbuf_submit(e, 0);
	bpf_ringbuf_discard(e, 0);
	return 0;
}


/* ************************************************************
 *	TRACE SYSCALL EXECVE
 * ************************************************************
 * */
// format obtained from /sys/kernel/tracing/events/syscalls/
struct trace_event_raw_sys_enter_execve {
    unsigned short common_type;
    unsigned char  common_flags;
    unsigned char  common_preempt_count;
    int            common_pid;

    int            __syscall_nr;
    int            __pad;

    const char *   filename;
    const char **  argv;
    const char **  envp;
};

SEC("tracepoint/syscalls/sys_enter_execve")
int handle_execve(const struct trace_event_raw_sys_enter_execve *ctx) {
    struct event *e;
    struct task_struct *task = NULL;
    struct task_struct *parent_task = NULL;
    int i;
    __u32 ppid = 0;
		
    //debug
    bpf_printk("EXECVE HOOKED\n");

    // get the task struct of the calling process
    task = (struct task_struct*) bpf_get_current_task();
    
    if(!task){
        bpf_printk("Invalid Task Struct!\n");
        return -1; 
    }
    //get the task struct of the calling processes parent process
    
    BPF_CORE_READ_INTO(&parent_task, task, real_parent);

    //get the pid of the parent process
    if(parent_task){
		BPF_CORE_READ_INTO(&ppid, parent_task, tgid);
    }

    e = bpf_ringbuf_reserve(&rb, sizeof(*e), 0);
    if (!e) return 0;
		
	e->timestamp = bpf_ktime_get_ns();	
	e->call = EXECVE;
    e->pid = bpf_get_current_pid_tgid() >> 32;
    //BPF_CORE_READ_INTO(&e->syscall_nr, ctx, __syscall_nr);
    //e->syscall_nr = ctx->__syscall_nr;
    e->ppid = ppid;

    // Copy filename
    //BPF_CORE_READ_INTO(&e->filename, ctx, filename);
    bpf_probe_read_user_str(e->filename, sizeof(e->filename), ctx->filename);

    // Copy argv
#pragma unroll
    for (i = 0; i < MAX_ARGS; i++) {
        const char *arg = NULL;
	// read the argv pointer from userspace
        if (bpf_probe_read_user(&arg, sizeof(arg), &ctx->argv[i]) < 0)
            break;
	// stop when null, argv is null terminated
	if(!arg)
	    break;
	// copy the contents of the arg to the event 
        if (bpf_probe_read_user_str(e->argv[i], ARG_LEN, arg) < 0)
            break;
        e->argc++;
    }

    bpf_ringbuf_submit(e, 0);
    return 0;
}




