#!/bin/bash


if [[ $EUID -ne 0 ]]; then

wdir=$PWD

wdir_connect="$wdir/hybrid/connect"


toolsok='ok'

# create wdir connect dir
if [ ! -d $wdir_connect ];then
	mkdir -p $wdir_connect
fi

#check for jq
if ! command -v jq &> /dev/null
then
	    toolsok='no'
	    echo "jq could not be found"
	        exit
fi

# check version >15
if ! command -v node &> /dev/null
then 
		toolsok='no'
		echo ""
		echo "No node found"
		echo ""
		echo "Install: https://github.com/nodesource/distributions"
		echo "Install it and try again!"
		echo ""
		echo "-----------USING UBUNTU------------"
		echo "curl -sL https://deb.nodesource.com/setup_15.x | sudo -E bash -"
		echo "sudo apt-get install -y nodejs"
		echo ""
	        exit
else
	nodeversion=$(node -v | cut -d'.' -f1)
	nodeversion="${nodeversion#v}"
	if [ $nodeversion -lt 15  ];then
		echo ""
		echo "node version < 15"
		echo ""
		echo "Update: https://github.com/nodesource/distributions"
		echo "Update it and try again!"
		echo ""
		echo "-----------USING UBUNTU------------"
		echo "curl -sL https://deb.nodesource.com/setup_15.x | sudo -E bash -"
		echo "sudo apt-get install -y nodejs"
		echo ""
		toolsok='no'
	        exit
	fi
fi

#check for docker
if ! command -v docker &> /dev/null
then 
		echo ""
		echo "Cannot find docker"
		echo ""
		echo "Install it and try again!"
		echo "http://docs.swarmlab.io/SwarmLab-HowTos/labs/Howtos/docker/install.adoc.html"
		echo ""
		echo "-----------USING UBUNTU------------"
		echo "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -"
		echo "sudo add-apt-repository \"deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable\""
		echo "sudo apt update"
		echo "sudo apt install -y docker-ce"
		echo "sudo usermod -aG docker [USERNAME]"
		echo ""
		toolsok='no'
	        exit
else

	#check if docker UP
	dockerserverdown=$(docker info --format "{{json .}}" | jq .ServerErrors)
	if [[ $dockerversion == *denied* ]]; then
		echo ""
		echo "docker server is down"
		echo ""
		docker info --format "{{json .}}" | jq .ServerErrors
		echo ""
		echo "-----------USING UBUNTU------------"
		echo ""
		echo "Using the following commands you can enable and run docker server";
		echo "sudo systemctl enable docker"
		echo "sudo systemctl start docker"
		echo "sudo systemctl status docker"
		echo ""
		echo "After adding to the group (usermod command) your shell needs to be restarted. If you dont know what this means please just logout and log in again.";
		echo ""
		toolsok='no'
	        exit
	fi

	#check docker version
	dockerversion=$(docker info --format "{{json .}}" | jq .ServerVersion | cut -d'.' -f1)
	if [[ ! -z $dockerversion && $dockerversion != 'null' ]] ;then
		dockerversion="${dockerversion#\"}"
		if [ $dockerversion -lt 19 ];then
			echo ""
			echo "docker version < 19"
			echo ""
			echo "Update docker and try again!"
			echo "http://docs.swarmlab.io/SwarmLab-HowTos/labs/Howtos/docker/install.adoc.html"
			echo ""
			echo "-----------USING UBUNTU------------"
			echo "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -"
			echo "sudo add-apt-repository \"deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable\""
			echo "sudo apt update"
			echo "sudo apt install -y docker-ce"
			echo "sudo usermod -aG docker [USERNAME]"
			echo ""
			toolsok='no'
			exit
		fi
	else
		echo ""
		echo "-----------USING UBUNTU------------"
		echo ""
		echo "Using the following commands you can enable and run docker server";
		echo "sudo systemctl enable docker"
		echo "sudo systemctl start docker"
		echo "sudo systemctl status docker"
		echo ""
		echo "After adding to the group (usermod command) your shell needs to be restarted. If you dont know what this means please just logout and log in again.";
		echo ""
		toolsok='no'
	        exit
	fi
fi

#check for docker-compose
if ! command -v docker-compose &> /dev/null
then 
		echo ""
		echo "Cannot find docker-compose"
		echo "Install it and try again!"
		echo "http://docs.swarmlab.io/SwarmLab-HowTos/labs/Howtos/docker/install.adoc.html"
		echo ""
		echo "-----------USING UBUNTU------------"
		echo ""
		echo "sudo curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose"
		echo "sudo chmod +x /usr/local/bin/docker-compose"
		echo "sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose"
		echo ""
		toolsok='no'
	        exit
else
	dockercomposeversion=$(docker-compose -f $wdir/test/run.yml config --services)
	if [ "$dockercomposeversion" != 'swarmlabclient' ];then
		echo ""
		echo "Cannot find docker-compose"
		echo "Install it and try again!"
		echo "http://docs.swarmlab.io/SwarmLab-HowTos/labs/Howtos/docker/install.adoc.html"
		echo ""
		echo "-----------USING UBUNTU------------"
		echo ""
		echo "sudo curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose"
		echo "sudo chmod +x /usr/local/bin/docker-compose"
		echo "sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose"
		echo ""
		toolsok='no'
	        exit
	fi
fi

#check for wireguard
if ! command -v wg &> /dev/null
then
	echo ""
	/bin/bash ./install/install-wg.sh
	echo ""
#	echo "Cannot find wg"
#	echo "Install it and try again!"
#        echo "https://www.wireguard.com/install/"
#	echo ""
#	echo "-----------USING UBUNTU------------"
#	echo ""
#	echo "sudo apt install wireguard"
#	echo ""
	toolsok='no'
	        exit
fi

#check for pm2
if ! command -v pm2 &> /dev/null
then
	    toolsok='no'
	    echo "pm2 could not be found"
	    echo "sudo npm install -g pm2"
	        exit
fi


# npm install 

#if [ $toolsok == 'ok' ];then
#	npm install 
#	npm audit fix
#fi

if [ $toolsok == 'ok' ];then
	npm install 
	npm audit fix
	cd $wdir
fi

if [ "$toolsok" == 'ok' ];then
	#cp -f $wdir/files/VuetableCssConfig.js	$wdir/node_modules/vuetable-2/src/components/VuetableCssConfig.js
	#cp -f $wdir/files/serve.js		$wdir/node_modules/@vue/cli-service/lib/commands/serve.js
	cp -f $wdir/files/status.sh		$wdir/hybrid/connect/status.sh
	cp -f $wdir/files/get-swarmlab-ca	$wdir/hybrid/connect/get-swarmlab-ca
	cp -f $wdir/files/get-base-ca		$wdir/hybrid/connect/get-base-ca
	mkdir -p $wdir/venuslog/logs
	mkdir -p $wdir/logs

cat << FOE > $wdir/ecosystem.config.js
module.exports = {
  "apps": [
{
    "name"        : "venusclient",
    "autorestart" : true,
    "watch"       : true,
    "cwd"         : "$wdir",
    "script"      : "./llo/connect-new.js",
    "run_as_user" : "node",
    "args"        : "start",
    "pid_file"    : "$wdir/venuslog/pid.pid",
    "log_type"    : "json",
    "log_file"    : "$wdir/venuslog/logs/logfile",
    "error_file"  : "$wdir/venuslog/logs/errorfile",
    "out_file"    : "$wdir/venuslog/logs/outfile",
    "log_date_format": "YYYY-MM-DD HH:mm Z",
    "merge_logs"  : true,
    "exec_mode"   : "fork",
    "max_restarts": 10,
    "max_memory_restart": "500M",
    "restart_delay": 1000
  },
]
}
FOE

fi

sudo bash ./hybrid/connect/get-base-ca
sudo bash ./hybrid/connect/get-swarmlab-ca
docker pull hub.swarmlab.io:5480/venus-alpine:latest


#echo $nodeversion
#echo $dockerversion
#echo $dockercomposeversion

#echo $wdir
#echo $wdir_connect
echo "-------------------------"
echo "   --------READY-------  "
echo "-------------------------"
echo " Start Server: ./start "
echo ""
echo " Stop Server: ./stop "
echo ""

else

	echo ""
	echo "-------------------------"
	echo "Run ./install.sh as Non-Root User" 
	echo "-------------------------"
	echo ""
fi

