#!/bin/bash

declare -a wgint
#for fint in $(docker inspect --format '{{.HostConfig.NetworkMode}}' $(docker ps --format '{{ .Names }}') |  grep "^swlab"); do
#	#echo $fint
#	ff=$fint
#	ff="${ff#"${ff%%[![:space:]]*}"}"
#	ff="${ff%"${ff##*[![:space:]]}"}"
#	ff=${ff:5}
#	#echo $ff
#	wgint+=($ff)
#done
for f in /sys/class/net/swlab*; do
    if [ -L "$f" ]; then
	f=$(basename $f)
	f="${f#"${f%%[![:space:]]*}"}"
	f="${f%"${f##*[![:space:]]}"}"
	f=${f:5}
	f=$(basename $f)
	#echo $f
	wgint+=($f)
    fi
done


#echo "---------------"
for f in "${wgint[@]}"; do 
	#for fdir in ./hybrid/connect/$f*; do
	for fdir in /config/$f*; do
	    if [[ -d "$fdir" && ! -L "$fdir" ]]; then
		fdirfull=$fdir
		fdirdir=$(basename $fdir)
		fdir=$(basename $fdir)
		fdir="${fdir#"${fdir%%[![:space:]]*}"}"
		fdir="${fdir%"${fdir##*[![:space:]]}"}"
		fdir=${fdir::10} 
		fdir="${fdir#"${fdir%%[![:space:]]*}"}"
		#echo "$fdir = $f"
		    if [ "$fdir" = "$f" ]; then
			#echo "----------------------"
			wg=''
			S="="
			while read -r name value
			do
			if [ "$name" = "AllowedIPs" ]; then
				var=${value//\"/}
				# remove leading whitespace characters
				var="${var#"${var%%[![:space:]]*}"}"
				# remove trailing whitespace characters
				var="${var%"${var##*[![:space:]]}"}"
				var=${var:1} 
				AllowedIPs="${var#"${var%%[![:space:]]*}"}"
				#echo $privateKey
			fi
			if [ "$name" = "PublicKey" ]; then
				var1=${value//\"/}
				# remove leading whitespace characters
				var1="${var1#"${var1%%[![:space:]]*}"}"
				# remove trailing whitespace characters
				var1="${var1%"${var1##*[![:space:]]}"}"
				var1=${var1:1} 
				publickey="${var1#"${var1%%[![:space:]]*}"}"
				#echo $publickey
			fi
			done < $fdirfull/wg0.conf
			if [ ! -z $AllowedIPs ] && [ ! -z $publickey ]; then
				#echo "$AllowedIPs = $publickey"


				nextip(){
				    IP=$1
				    IP_HEX=$(printf '%.2X%.2X%.2X%.2X\n' `echo $IP | sed -e 's/\./ /g'`)
				    NEXT_IP_HEX=$(printf %.8X `echo $(( 0x$IP_HEX + 1 ))`)
				    NEXT_IP=$(printf '%d.%d.%d.%d\n' `echo $NEXT_IP_HEX | sed -r 's/(..)/0x\1 /g'`)
				    echo "$NEXT_IP"
				}

				IP=$(echo $AllowedIPs | cut -d'/' -f1)
				IP=$(nextip $IP)
				#echo $IP
				if ping -q -w 1 $IP > /dev/null; then
					setconfig=$(jq  -c \
					--arg key0   'ip' 	  --arg ip         "${AllowedIPs}" \
					--arg key1   'publickey'  --arg publickey  $publickey \
					--arg key2   'stackid'    --arg stackid    $fdirdir \
					--arg key3   'connection' --arg connection 'yes'  \
					'. | .[$key0]=$ip | .[$key1]=$publickey | .[$key2]=$stackid | .[$key3]=$connection' <<<'{}'
					)
				else  
					setconfig=$(jq  -c \
					--arg key0   'ip' 	  --arg ip         "${AllowedIPs}" \
					--arg key1   'publickey'  --arg publickey  $publickey \
					--arg key2   'stackid'    --arg stackid    $fdirdir \
					--arg key3   'connection' --arg connection 'no'  \
					'. | .[$key0]=$ip | .[$key1]=$publickey | .[$key2]=$stackid | .[$key3]=$connection' <<<'{}'
					)
				fi

				if [ -z "$JSON" ]; then
					JSON=$setconfig
				else
					JSON=$JSON,$setconfig
				fi
			fi
		    fi
	    fi
	done
done

echo [$JSON] 

#setconfig1=$(jq -c --arg key0 'interfaces' --arg interfaces "$JSON"  \
#'. | .[$key0]=$interfaces' <<<'{}'
#)
#echo $setconfig1
