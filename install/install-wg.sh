#!/bin/bash

OS=$(cat /proc/version);

if [[ $OS =~ "Ubuntu" ]]; then
	echo ""
	echo "sudo apt update; sudo apt install wireguard"
	echo ""

elif [[ $OS =~ "Debian" ]]; then
	echo ""
	echo "sudo apt update; sudo apt install wireguard"
	echo ""

elif [[ $OS =~ "Red Hat" ]]; then
	echo ""
	echo "Red Hat 8"
	echo ""
	echo "*Method 1: the easiest way is via ELRepo's pre-built module:"
	echo ""
	echo "sudo yum install https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm https://www.elrepo.org/elrepo-release-8.el8.elrepo.noarch.rpm"
	echo "sudo yum install kmod-wireguard wireguard-tools"
	echo ""
	echo "*Method 2: users running non-standard kernels may wish to use the DKMS package instead:"
	echo ""
	echo "sudo yum install https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm"
	echo "sudo subscription-manager repos --enable codeready-builder-for-rhel-8-$(arch)-rpms"
	echo "sudo yum copr enable jdoss/wireguard"
	echo "sudo yum install wireguard-dkms wireguard-tools"
	echo ""
	echo ""
	echo "Red Hat 7"
	echo ""
	echo "Method 1: the easiest way is via ELRepo's pre-built module:"
	echo ""
	echo "sudo yum install https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm https://www.elrepo.org/elrepo-release-7.el7.elrepo.noarch.rpm"
	echo "sudo yum install kmod-wireguard wireguard-tools"
	echo ""
	echo "Method 2: users running non-standard kernels may wish to use the DKMS package instead:"
	echo ""
	echo "sudo yum install https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm"
	echo "sudo curl -o /etc/yum.repos.d/jdoss-wireguard-epel-7.repo https://copr.fedorainfracloud.org/coprs/jdoss/wireguard/repo/epel-7/jdoss-wireguard-epel-7.repo"
	echo "sudo yum install wireguard-dkms wireguard-tools"
	echo ""

elif [[ $OS =~ "CentOS" ]]; then
	echo ""
	echo "CentOS 8"
	echo ""
	echo "*Method 1: a signed module is available as built-in to CentOS's kernel-plus:"
	echo ""
	echo "sudo yum install yum-utils epel-release"
	echo "sudo yum-config-manager --setopt=centosplus.includepkgs="kernel-plus, kernel-plus-*" --setopt=centosplus.enabled=1 --save"
	echo "sudo sed -e 's/^DEFAULTKERNEL=kernel-core$/DEFAULTKERNEL=kernel-plus-core/' -i /etc/sysconfig/kernel"
	echo "sudo yum install kernel-plus wireguard-tools"
	echo "sudo reboot"
	echo ""
	echo "*Method 2: the easiest way is via ELRepo's pre-built module:"
	echo ""
	echo "sudo yum install elrepo-release epel-release"
	echo "sudo yum install kmod-wireguard wireguard-tools"
	echo ""
	echo "*Method 3: users running non-standard kernels may wish to use the DKMS package instead:"
	echo ""
	echo "sudo yum install epel-release"
	echo "sudo yum config-manager --set-enabled PowerTools"
	echo "sudo yum copr enable jdoss/wireguard"
	echo "sudo yum install wireguard-dkms wireguard-tools"
	echo ""
	echo "CentOS 7"
	echo ""
	echo " Method 1: a signed module is available as built-in to CentOS's kernel-plus:"
	echo ""
	echo " sudo yum install yum-utils epel-release"
	echo " sudo yum-config-manager --setopt=centosplus.includepkgs=kernel-plus --enablerepo=centosplus --save"
	echo " sudo sed -e 's/^DEFAULTKERNEL=kernel$/DEFAULTKERNEL=kernel-plus/' -i /etc/sysconfig/kernel"
	echo " sudo yum install kernel-plus wireguard-tools"
	echo " sudo reboot"
	echo ""
	echo "Method 2: users wishing to stick with the standard kernel may use ELRepo's pre-built module:"
	echo ""
	echo " sudo yum install epel-release elrepo-release"
	echo " sudo yum install yum-plugin-elrepo"
	echo " sudo yum install kmod-wireguard wireguard-tools"
	echo ""
	echo "Method 3: users running non-standard kernels may wish to use the DKMS package instead:"
	echo ""
	echo " sudo yum install https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm"
	echo " sudo curl -o /etc/yum.repos.d/jdoss-wireguard-epel-7.repo https://copr.fedorainfracloud.org/coprs/jdoss/wireguard/repo/epel-7/jdoss-wireguard-epel-7.repo"
	echo " sudo yum install wireguard-dkms wireguard-tools"
	echo ""

elif [[ $OS =~ "Fedora" ]]; then
	echo ""
	echo "sudo dnf install wireguard-tools"
	echo ""

elif [[ $OS =~ "Mageia" ]]; then
	echo ""
	echo "sudo urpmi wireguard-tools"
	echo ""

elif [[ $OS =~ "SUSE" ]]; then
	echo ""
	echo "sudo zypper install wireguard-tools"
	echo ""

elif [[ $OS =~ "Arch" ]]; then
	echo ""
	echo "sudo pacman -S wireguard-tools"
	echo ""
	echo "Users of kernels < 5.6 may also choose wireguard-lts or wireguard-dkms+linux-headers, depending on which kernel is used."
	echo ""

elif [[ $OS =~ "Alpine" ]]; then
	echo ""
	echo "apk add -U wireguard-tools"
	echo ""

elif [[ $OS =~ "Gentoo" ]]; then
	echo ""
	echo "emerge wireguard-tools"
	echo ""

elif [[ $OS =~ "Oracle" ]]; then
	echo ""
	echo "Oracle 8"
	echo ""
	echo "sudo dnf install oraclelinux-developer-release-el8"
	echo "sudo dnf config-manager --disable ol8_developer"
	echo "sudo dnf config-manager --enable ol8_developer_UEKR6"
	echo "sudo dnf config-manager --save --setopt=ol8_developer_UEKR6.includepkgs='wireguard-tools*'"
	echo "sudo dnf install wireguard-tools"
	echo ""
	echo "Oracle 7"
	echo ""
	echo "sudo yum install oraclelinux-developer-release-el7"
	echo "sudo yum-config-manager --disable ol7_developer"
	echo "sudo yum-config-manager --enable ol7_developer_UEKR6"
	echo "sudo yum-config-manager --save --setopt=ol7_developer_UEKR6.includepkgs='wireguard-tools*'"
	echo "sudo yum install wireguard-tools"
	echo ""

elif [[ $OS =~ "Slackware" ]]; then
	echo ""
	echo " Run with root privileges"
	echo ""
	echo "for i in wireguard-linux-compat wireguard-tools; "
	echo "do "
	echo '    wget https://slackbuilds.org/slackbuilds/14.2/network/$i.tar.gz && tar -xzf $i.tar.gz && cd $i && OUTPUT=$(pwd) ./$i.SlackBuild && sudo upgradepkg --install-new ./$i*.tgz && cd ..; '
	echo "done"
	echo ""

else
	echo ""
	echo "Can't  find  what distribution of linux your running!"
	echo " see https://www.wireguard.com/install/"
	echo ""
fi
