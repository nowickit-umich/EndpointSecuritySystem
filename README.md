# Endpoint Security Monitoring System

NOTE: Initially developed as a university software engineering group project: https://github.com/nowickit-umich/CIS376TermProject

This project provides a scalable, modular, and easy-to-deploy solution for monitoring endpoint activity and identifying anomalous or potentially malicious behavior. It is designed with flexibility in mind, supporting both cloud-based and on-premises deployment. The system consists of two primary components:

 - Monitoring Agent - Installed on endpoints to capture system activity. Currently suports Linux systems running kernel version 5.8 and higher.

 - Management Services - Operates within the organization's infrastructure, providing centralized visibility, analysis, and control.

By monitoring and intercepting system calls, the system constructs a behavioral model of process activity. Each process is evaluated against a baseline profile to detect deviations indicative of abnormal behavior (WIP). Enhanced analysis is performed for specific system calls, such as:

 - open/openat - Assessed against program-specific file access baselines.

 - execve/execveat and network-related calls - Further analysis under development (WIP).

# System Architecture Overview
![archoverview](https://github.com/user-attachments/assets/90573a24-020b-4fec-bbf7-1f622f1e1ca5)


Each service is deployed in a separate Docker container to support future scalability. Despite this modular design, all services can be easily deployed on a single server using Docker Compose, which enables simplified orchestration and management through a single command.

### Services:
 - **Reverse Proxy**: Ensures secure and encrypted connections to all services. Capable of performing load balancing if the system is scaled across multiple servers.
 - **Log Ingress**: Receives and parses raw logs from endpoints, then writes the processed data to the database.
 - **Dashboard Web App**: Provides a management UI for adding new endpoints and viewing alerts.
 - **Backend**: Provides data to the Dashboard.
 - **Database**: Stores all persistent data, including endpoint identifiers, event logs, alert data, and user information.
 - **Analysis**: Consumes event data from the database and performs analytical processing. Running analysis in a dedicated container allows multiple analysis services of varying complexity to be executed in parallel without degrading overall system performance.


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

