# Endpoint Security Monitoring System

NOTE: Initially developed as a university software engineering group project: https://github.com/nowickit-umich/CIS376TermProject

### This project is INCOMPLETE: please see the Limitations Section below.

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

# LIMITATIONS
This project was developed with tight time constraints. The focus of the project is developing a strong and scalable architecture and to demonstrate system call interception.

### Current State:
The management server is designed using a Docker-based container architecture, which supports modularity, portability, and ease of deployment. The system is composed of several core components: a frontend built with Next.js that provides the user interface; a backend implemented using a Flask API that serves as a bridge between the frontend and backend services; a MySQL database responsible for storing agent logs and alert data; and an analysis engine, developed in Python, which performs security detection and event analysis.

Docker Compose is utilized to orchestrate these components, simplifying local development, testing, and providing consistent deployment across multiple environments. This containerized setup ensures that the system remains maintainable and scalable as it evolves.

The dashboard offers real-time visibility into system events, allowing administrators to monitor security activity as it happens. The current architecture follows a client-server model, but its design is flexible and can be extended into a microservices architecture through Docker, offering further scalability and modular service management. 

The project falls short with the implementation of anomaly detection lacking its intended strategy, the dashboard missing https encryption and inefficient authentication, system call tracing is only partially implemented and process modeling is not expanded upon due to kernel-space data encoding issues. More details below:


### Neccessary Future Work:

Event Analysis

The system’s anomaly detection and alert mechanism is currently incomplete. The initial design aimed to incorporate a layered approach that includes predefined rules, statistical baselines, and machine learning algorithms to identify deviations from normal system behavior. This proved to be more complex than our initial estimates. More details about the analysis system limitations are included below in the "System Call decoding and Process Modeling" section. 

Dashboard and API Encryption

The web application and backend API are not currently encrypted with https. A reverse proxy service should be added to the docker system to ensure all connections are secure. One option the team explored was a service known as caddy. This service should make the addition of https simple to configure and deploy. The failure to enforce HTTPS with TLS can expose data in transit, including alerts, logs, and credentials, to interception or tampering by malicious actors. This exposure can lead to data breaches and compromise the confidentiality and integrity of sensitive endpoint and alert information.

Dashboard Authentication

The dashboard's current authentication implementation is incomplete and introduces several critical vulnerabilities. The use of default credentials is inherently insecure and exposes the system to unauthorized access during deployment. Additionally, storing passwords in plaintext, the absence of password complexity requirements, and the lack of session management significantly increase the risk of compromise. To improve security, several measures should be implemented. Passwords must be stored using secure hashing algorithms such as bcrypt, and account lockout mechanisms should be introduced to limit the number of failed login attempts. The session management functionality also needs improvement. The current system allows the login page to be bypassed by navigating directly to the dashboard URL. 

System Call Collection and Log Submission

The system call interception system was complex to build and several different technologies were tried during development. Auditd plugins, Kprobes, and eBPF based system call logging systems were implemented and tested. Each option has several limitations and ultimately eBPF was selected. eBPF allows for kernel code to be inserted into a running kernel and provides some stability and safety guarantees. It also defines an interface for accessing internal kernel tracepoints which are not directly accessible via normal kernel modules. Due to the multiple approaches tried, all the system call tracing specified in the requirements were not completed. Currently, only partial information is collected for most system calls. 

System Call decoding and Process Modeling

The system also needs significant work to improve the endpoint system modeling. The analysis system requires information such as the parent process program name, which is non-trivial to obtain in kernel space. The kernel data structures often only contain references that can only be decoded with information from user space. Many issues such as this were encountered, slowing development. Once the system call tracing system is fully complete with decoded values, a model of the endpoint system can be constructed within the analysis service. This model can be used to detect anomalous and potentially malicious behavior. One aspect of this model is a process tree, which is a representation of all processes and the relation to other processes on the endpoint. Significantly more work is required to complete this. 





