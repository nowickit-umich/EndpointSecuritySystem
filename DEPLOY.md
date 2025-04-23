# Local Deployment

This deployment document provides step-by-step instructions for deploying the Monitoring Agent and Management Server locally.

A virtual machine running Fedora Linux 42 is required: `https://fedoraproject.org/server/download`

The virtual machine must have access to the host machine network. A bridged adapter is needed.


### Management Server Setup

1. The management server can be run on the local system. It requires docker and docker-compose to be installed and running. Docker desktop for windows includes all needed components by default: `https://www.docker.com/products/docker-desktop/`

2. Clone the GitHub repository:

`git clone https://github.com/nowickit-umich/EndpointSecuritySystem.git`

3. Move into the ManagementServer Directory:

`cd ./EndpointSecuritySystem/ManagementServer/`

4. Start the services:

`docker-compose up --build`

5. Once the services are started, the web app should be accessible at `http://localhost:3000`

6. Navigate to the login page. The default credentials are:

username: `Admin` 

password `Admin`

You will be prompted to change you credentials. Enter any values and complete the login.

8. Navigate to the dashboard page, and select add Endpoint from the sidebar.

9. Enter any name and click the "Add Endpoint button" and **download the agent configuration file**


### Monitoring Agent Setup

Once the fedora Linux virtual machine is running, **switch to the root user** and install git with the following commands:

`dnf install git -y`

1. Use the following command to download the code:

`git clone https://github.com/nowickit-umich/EndpointSecuritySystem.git`

2. Move to the MonitoringAgent directory:

`cd ./EndpointSecuritySystem/MonitoringAgent/`

3. Copy the agent configuration file which was previously downloaded in step 9 of the "Management Server Setup" to the `src` directory

4. Install the Monitoring Agent:

`chmod +x install.sh`

`./install.sh`

5. Verify the Monitoring Agent is running:

`systemctl status monitoringAgent.service`

6. Execute several commands to quickly generate events. `ls` or `env` are recommended, but any command will work.

7. Events should be posted to the dashboard 
