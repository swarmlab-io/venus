
#!/bin/bash
net=wg0
test_time=2
T1=$(cat /sys/class/net/$net/statistics/tx_bytes)
sleep $test_time
T2=$(cat /sys/class/net/$net/statistics/tx_bytes)

#echo "t2=$T2 t1=$T1"
tot=$(( (T2 - T1)))

if [ $tot -eq 0 ]; then
	echo "1"
fi


