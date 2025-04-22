#!/bin/sh

# run as root
if [[ $EUID -eq 0 ]]; then
  echo " + Script is running as root."
else
  echo " - Error: This script must be run as root!"
  exit -1
fi

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# config system
echo " + Configuring System..."
# set SElinux to permissive mode
# SELinux could be configured to allow the agent in the future
setenforce 0
if [ $? -ne 0 ]; then 
	echo " - Failed to configure SELinux!"
	exit -1
fi

#

# install dependencies
echo " + Installing Build Dependencies..."
dnf install gcc libcurl-devel bpftool clang libbpf-devel -y 
if [ $? -ne 0 ]; then 
	echo " - Failed to Install Dependencies!"
	exit -1
fi

# build 
echo " + Building..."
(cd $SCRIPT_DIR/src && make clean)
(cd $SCRIPT_DIR/src && make)
if [ $? -ne 0 ]; then 
	echo " - Failed to Build!"
	exit -1
fi

# install
echo " + Installing..."
cp $SCRIPT_DIR/src/monitoringAgent /usr/bin/monitoringAgent
cp $SCRIPT_DIR/src/monitoringAgent.conf /etc/monitoringAgent.conf
status1=$?
chmod 700 /usr/bin/monitoringAgent
if [ $? -ne 0 ] || [ $status1 -ne 0 ]; then 
	echo " - Failed to Install!"
	echo " - - Ensure the monitoringAgent service is stopped!"
	exit -1
fi


# add service
cp $SCRIPT_DIR/monitoringAgent.service /etc/systemd/system/
if [ $? -ne 0 ]; then 
	echo " - Failed to add SystemD Service!"
	exit -1
fi

# enable service
echo " + Starting Service..."
systemctl enable monitoringAgent
status1=$?
systemctl start monitoringAgent
if [ $? -ne 0 ] || [ $status1 -ne 0 ]; then 
	echo " - Failed to start SystemD Service!"
	exit -1
fi

echo " + Done!"
