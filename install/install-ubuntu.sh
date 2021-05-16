#!/bin/bash

################################# 
# 	set USERNAME 		#
################################# 

USERNAME=

if [ -z "$USERNAME" ]; then 

	# ------------------------
	# install wireguard jq
	# ------------------------

	sudo apt update
	sudo apt install wireguard jq


	# ------------------------
	# install node version 15
	# ------------------------

	curl -sL https://deb.nodesource.com/setup_15.x | sudo -E bash -
	sudo apt-get install -y nodejs

	# ------------------------
	# install docker
	# ------------------------

	curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
	sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
	sudo apt update
	sudo apt install -y docker-ce
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
