#!/bin/bash

################################# 
#       set USERNAME            #
################################# 

USERNAME=

if [ -z "$USERNAME" ]; then


	# ------------------------
	# Not Tested
	# ------------------------

	# ------------------------
	# install wireguard jq
	# ------------------------

	sudo yum install -y yum-utils
	sudo yum install elrepo-release epel-release
	sudo yum install kmod-wireguard wireguard-tools


	# ------------------------
	# install node version 15
	# ------------------------

	curl -sL https://deb.nodesource.com/setup_15.x | sudo -E bash -
	yum install -y nodejs

	# ------------------------
	# install docker
	# ------------------------

	sudo yum-config-manager \
		--add-repo \
		https://download.docker.com/linux/centos/docker-ce.repo

	sudo yum install docker-ce docker-ce-cli containerd.io
	sudo systemctl start docker

	sudo usermod -aG docker $USERNAME

	# ------------------------
	# install docker-compose
	# ------------------------

	sudo curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
	sudo chmod +x /usr/local/bin/docker-compose
	sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

	# ------------------------
	# install pm2
	# ------------------------

	sudo npm install -g pm2

	echo ""
	echo "run ./install.sh"
	echo ""
else
	echo ""
	echo "set USERNAME first"
	echo ""
fi
