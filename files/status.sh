#!/bin/bash


if [ -z ${1} ] ; then
	echo "usage: status.sh interface "
	exit
fi

CHECK="off";
ACTIVITY="off";

net=${1} 
ping_c=2				# stop after sending packets
ping_i=1				# set interval in seconds
ping_w=2				# timeout in seconds

ping_iptmp=$(ip addr show $net | grep -o "inet [0-9]*\.[0-9]*\.[0-9]*" | grep -o "[0-9]*\.[0-9]*\.[0-9]*")
ping_ip="$ping_iptmp.1"
#ping_ip=10.13.13.1

if [[ -d /sys/class/net/$net ]]; then
	CHECK="on";
	T1=$(cat /sys/class/net/$net/statistics/tx_bytes)
	ping -I $net -c $ping_c -i $ping_i -w $ping_w $ping_ip &> /dev/null
	T2=$(cat /sys/class/net/$net/statistics/tx_bytes)

	tot=$(( (T2 - T1)))
	if [ $tot -ne 0 ]; then
		ACTIVITY="on";
	fi
fi

#echo "check $CHECK activity $ACTIVITY"

if [ "$CHECK" == "on" ] && [ "$ACTIVITY" == "on" ] ; then
	hybridswarm='Online'
else
	hybridswarm='NotOnline'
fi

dockerswarm=$(docker info --format "{{json .}}" | jq .Swarm.LocalNodeState)
tempswarm="${dockerswarm%\"}"
tempswarm="${tempswarm#\"}"
dockerswarm=$tempswarm


if [ "$dockerswarm" == "active" ] ; then
	dockerswarmid=$(docker info --format "{{json .}}" | jq .Swarm.NodeID)
	tempswarm1="${dockerswarmid%\"}"
	tempswarm1="${tempswarm1#\"}"
	swarmlabid=$tempswarm1
else
	swarmlabid="-1";
fi

if [ -z "$dockerswarm"  ] ; then
	dockerswarm=none
fi

jq  \
	--arg key0   'swarmlab' --arg swarmlab $dockerswarm  \
	--arg key1   'hybrid' --arg hybrid $hybridswarm \
	--arg key2   'swarmlabid' --arg swarmlabid $swarmlabid \
	'. | .[$key0]=$swarmlab | .[$key1]=$hybrid | .[$key2]=$swarmlabid' <<<'{}' 

