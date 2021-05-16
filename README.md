

<img align="center" width="300" height="300" src="https://git.swarmlab.io:3000/swarmlab/venus-client/raw/branch/master/images/globe1.png">



# **Welcome to Swarmlab VEnus Network Unification Service** 

### on-demand network environments using any cloud over any network

## 

## Build the network you require on demand and without effort.

<img align="right" width="300" height="300" src="https://git.swarmlab.io:3000/swarmlab/venus-client/raw/branch/master/images/venus-net.png">
### You can  Create and manage 

  * on-demand sandbox environments
  *  Virtual Labrooms
  *  Virtual Classrooms
  * Proof-of-Concept (POC)
  * anything else you that might suit your needs in a dynamic and Scalable Distributed Architecture  

:information_source: <b>All the above are available in private, public and hybrid format, satisfying all possible needs.</b>

#### Swarmlab-Venus provides

* Secure and state-of-the-art cryptography (like the Noise protocol framework, Curve25519, ChaCha20, Poly1305, BLAKE2, SipHash24, HKDF) - integrated across all connections
* Manage the entire network as a service
* Architecture/Platform Agnostic
* Manage user network access
* Network traffic analysis


<br>


### Table of contents
  
1. [Features](#introduction)
2. [System requirements ](#systemrequirements)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [More info](#moreinfo)

<br>

### <a name="introduction"></a>
## <b>Swarmlab Venus</b> is Swarmlabs hybrids syblin, diagnosed with the VPN disease.  

Swarmlab venus provides the user with the unique abillity to create **virtual networks** and use them to project for a  Virtual Classroom, an app of your own making or proof of concept. An all of that <b>using only a browser</b> of their choice.
  
## Why?

Ever imagined having a network environment to tryout stuff with your coworkers/costudents for work or just for fun?  

Ever created a service that you would like to test on a real-world network?  

Ever designed an Labroom/application you would like to distribute to your students/coworkers/potential clients?  

Swarmlab venus comes to bridge the gap between you, your network/computer, the coder/developer of a service and the end user while at the same time meeting the needs for a real-world testing environment.   

With venus you can now as part of the cloud work <b>independantly</b> but also stay <b>connected</b>.  

The venus service allows us to utilize the power of Swarmlab itself but also combine it with the practiacally unlimited computing of our own machines.

## Another Swarmlab app. Why?

How does Swarmlab Venus differ from Swarmlab Hybrid? 

Well swarmlab-hybrid forces server-client/containerized applications while venus allows for peer-to-peer connection! You can create and connect directly to a network with your coworkers, whithout needing a server.

Ofcourse you can use venus independantly or alongside swarmlab and all of its powerful features.
  
To sum up, you can now design, develop and test apps using swarlab-hybrid but you can also connect directly to other interested parties for testing or work purposes.

## System requirements<a name="systemrequirements"></a>
  
  
**Before** you create and configure a venus deployment using the swarmlab-agent client, your Local Machines need to meet certain requirements.
  

> If you don't meet those requirements, you won't be able to complete the steps within the swarmlab-agent client and you won't be able to configure a network deployment between your Local Enviroment and Swarmlab Online Enviroment.
   

- A Linux Server (Virtual or Physical) 	
 - You must have super user privileges (root/sudo)
- Docker Engine- Community version 18 or later is required. 	
 -  Docker Engine is supported on x86_64 (or amd64), armhf, and arm64 architectures.
- RAM
 - Absolute minimum to run the daemon and some very light containers - 512MB
 - Minimum for “comfortable” usage – 2GB
- CPU
 - Minimum: 2
 - Recommended 4+
- Disk Space
 - 5 GB for internal requirements.
 - The amount of additional disk space soloemnly depends on you intended use.

:warning: Since Docker uses hypervisor the host NEEDS TO HAVE VIRTUALIZATION ENABLED!


 

## Prerequisites<a name="prerequisites"></a>

* node version >15

  ```sh
  curl -sL https://deb.nodesource.com/setup_15.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```
* docker 

  ```sh
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
  sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
  sudo apt update
  sudo apt install -y docker-ce
  sudo usermod -aG docker [USERNAME] # Please replace [USERNAME] with the user you want to run docker on
  ```

:information_source: for kali specifically please visit the following link to install docker. 

https://linuxhint.com/install_docker_kali_linux/


* docker-compose

  ```sh
  sudo curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
  ```
* pm2

  ```sh
  sudo npm install -g pm2
  ```
* wireguard

  ```sh
  sudo apt install wireguard jq

  ```
<br>
###  **MORE Installation info here**


[install docker](http://docs.swarmlab.io/SwarmLab-HowTos/labs/Howtos/docker/install-docker.adoc.html)

[Install Wireguard](http://docs.swarmlab.io/SwarmLab-HowTos/labs/Howtos/wg/install-wg.adoc.html)

[Install Node](http://docs.swarmlab.io/SwarmLab-HowTos/labs/Howtos/nodejs/install-nodejs.adoc.html)


<br>
## Installation<a name="installation"></a>
  
### for *nix
  

- Clone the repo

   ```sh
   git clone --recurse-submodules https://git.swarmlab.io:3000/swarmlab/venus-client.git
   ```

- Install it!

   ```sh
   cd venus-client
   ./install.sh  <-- run it without root privileges
   ```

- Open URL __http://localhost:8085/index.html__ in browser 
 - Get a Swarmlab account. 



### for windows or if you wish to keep the environment contained

You can find ready to run VM images <a href="https://uniwagr-my.sharepoint.com/:u:/g/personal/ice19390012_uniwa_gr/EbhjQIeiDeNFkfkSBWczRggBcJq2Pv6lAJs-NKkT4hXg-g?e=0VC0xa" target="_blank">here</a>.

And instructions on how to use them <a href="https://git.swarmlab.io:3000/zeus/swarmlab-hybrid/src/branch/master/docs/windows_use_vm.md">here</a>.

:information_source: Default password: swarmlab

PLEASE CHANGE PASSWORD IMEDIATELLY AFTER FIRST LAUNCH!!!



