# Management Server

### Services Overview
The Management Server is a set of docker service containers:

`frontend` This service contains the management dashboard web application.

`backend` This service runs the api which collects logs from endpoints and provides data to the frontend.

`analysis` This service analyzes the events in the database for suspicious behavior and generates alerts.

`databse` This service contains the mySQL databse which stores all of the data for the system.


### Configuration
The server can be assigned a hostname and options such as network ports can be configured in the `.env` file. The following options are available:

`HOSTNAME` defines the hostname of the server. 

`FRONTEND_PORT` defines the port used to access the management dashboard web application.

`BACKEND_PORT` defines the port used to access the backend api.

`DB_PORT` defines the port used to access the databse. This port is only exposed within the docker container group and is not accessible externally. 

`DB_HOST` defines the name of the database container. This value should not be changed.

`DB_USER` defines the username used by mySQL server. 

`DB_PASS` defines the passwrd for the mySQL user.

`MYSQL_ROOT_PASS` defines the root password for the mySQL server.



### Useful Docker Commands
Start all services: `docker compose up --build`

Shutdown all containers: `docker compose down`

Show database volume: `docker volume ls`

Delete database volume `docker volume rm <name>`

