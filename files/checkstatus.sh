#!/bin/bash

nextip(){
    IP=$1
    IP_HEX=$(printf '%.2X%.2X%.2X%.2X\n' `echo $IP | sed -e 's/\./ /g'`)
    NEXT_IP_HEX=$(printf %.8X `echo $(( 0x$IP_HEX + 1 ))`)
    NEXT_IP=$(printf '%d.%d.%d.%d\n' `echo $NEXT_IP_HEX | sed -r 's/(..)/0x\1 /g'`)
    echo "$NEXT_IP"
}

for fint in $(docker ps --format '{{ .Names }}' |  grep "^swarmlabwg-"); do
    v=$(docker inspect --format '{{.HostConfig.NetworkMode}}' $fint)
    ip=$(docker exec $fint /bin/sh -c "wg show $v allowed-ips | cut  -f2 | cut -d'/' -f1")
    IP=$(nextip $ip)
    #echo " -- $fint --- $v -- $ip -- $IP"
    if $(docker exec $fint /bin/sh -c "ping -q -w 2 $IP > /dev/null"); then
      echo "ok:$fint"
    else                                                                               
      docker stop $fint > /dev/null
      docker container rm $fint > /dev/null
      echo "stop:$fint"
    fi                                                                                                 
done
