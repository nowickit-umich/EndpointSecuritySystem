# Endpoint Security Monitoring System

This project consists of two main components: the Monitoring Agent and the Management Server. The Monitoring Agent is deployed on the devices to be monitored, while the Management Server is integrated within your organization's network infrastructure. Both cloud-based and on-premises server deployment options are supported. 

The system identifies anomalous and potentially malicious activity by monitoring and intercepting all system calls and modeling process state. System calls for each process are compared against a designated baseline profile for the respective program to detect any abnormal behavior (WIP). Additionally, certain system calls, such as open/openat, are analyzed in greater detail by comparing their arguments to a program-specific file access baseline. Similar analysis is applied to execve/execveat and network-related system calls (WIP).

# System Architecture Overview
![archoverview](https://github.com/user-attachments/assets/6fccf3f0-63c6-41b9-86ce-6437a337d67f)




# Monitoring Agent Overview
The Monitoring Agent currently supports Fedora-40 systems. This can easily be extended to any linux kernel version greater than 5.8 in the future. The monitoring agent can be easily managed via systemd. 

### Install:
To install the monitoring agent simply run the install.sh script located in `./MonitoringAgent/install.sh`

Note: the install script must be run as root

### Configuration: 
The Monitoring Agent reads configuration settings from `/etc/monitoringAgent.conf`
The  configuration file is generated when an endpoint is added and can be downloaded from within the endpoint management dashboard. It is not necessary to modify the defualt configuration.

It is intended that the "Add Endpoint" feature of the deashboard is used to generate the agent configuration file. The options listed below are only for advanced usage.  

There are 6 required configuration options that must be defined:
> `api=http://<server address\>:5001/submit_logs`

The `api` key must be set to the backend submit logs api

> key=<authentication key\>

The `key` must be set to the authentication key generated when the endpoint was added in the dashboard

> name=<name\>

`name` may be set to any string.

> id=<endpoint id\>

The `id` must be set to the id associated with the authentication key.

> buffer_size=<int\>

The `buffer_size` is used internally. The configuration option is not currently implemented, leave this value at 100.

> batch_size=<int\>

The `batch_size` defines the number of logs sent in a single submission. Smaller values will improve the response time at the cost of more api calls.

Configuration Format: All options must be defined. There must not be spaces around the '=' character. Comments can be included in the configuration file by starting a line with the '#' character.

### Network: 
Requires outgoing network access on port `5001`


### Service control

Start/Stop/Status of the Monitoring Agent:

> systemctl start monitoringAgent.service

> systemctl stop monitoringAgent.service

> systemctl status monitoringAgent.service


# Management Server Overview
The Management server consists of a set of docker containers managed by docker-compose. The server can be installed on any system with docker and docker compose installed. An install script is included for Fedora-40 systems. 

Install Dependencies (Fedora-40 only):
Run the install script located in `./ManagementServer/install.sh`

Start Server:
docker compose up --build

Network: Requires full access on ports `3000` and `5001`

