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
# SELinux could be configured to allow docker in the future
setenforce 0
if [ $? -ne 0 ]; then 
	echo " - Failed to configure SELinux!"
	exit -1
fi

#

# install dependencies
echo " + Installing Build Dependencies..."
dnf install docker docker-compose -y 
if [ $? -ne 0 ]; then 
	echo " - Failed to Install Dependencies!"
	exit -1
fi


echo " + Done!"
