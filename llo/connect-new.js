
var fs        = require('fs');

var express   = require('express');
var http      = require('http');
var app       = express();
const cors    = require('cors')
const helmet  = require('helmet');
var MongoClient = require('mongodb').MongoClient;

var allowedOrigins = [ 
      'http://localhost:3080',
      'http://localhost:3088',
      'http://localhost:8085'
      ];

app.use(cors({
origin: function(origin, callback){    // allow requests with no origin 
      if(!origin) 
        return callback(null, true);    
        if(allowedOrigins.indexOf(origin) === -1){
          var msg = 'The CORS policy for this site does not ';
          return callback(new Error(msg), false);
         }
      return callback(null, true);
    }
}));

app.use(
    helmet({
          frameguard: false,
          contentSecurityPolicy: false
        })
);

app.use(express.json());

var serverPort = 8085;
var server = http.createServer(app);

const io = require("socket.io")(server, {
   cors: {
         origin: allowedOrigins,
         //origin: [ "http://localhost:3088", "http://localhost:8085" ],
         methods: ["GET", "POST"]
   }
});

const { spawn, exec, execSync } = require('child_process')

var static_options = {
    dotfiles: 'ignore',
    etag: false,
    extensions: ['html'],
    index: false,
    redirect: false,
    setHeaders: function (res, path, stat) {
          res.set('x-timestamp', Date.now())
        }
}

app.use('/', express.static('client', static_options))


function myexec(res) {
     var mypath = process.cwd()
     var RES = new Object();

     try {
         var showexec = `${res}`
         console.error('execi 1 ' + JSON.stringify(res));
         const stdout = execSync(res, {
              env: {
                  NODE_ENV: "production",
              },
         });
          var datajson = stdout.toString()
              //var datajson = JSON.parse(string);
              RES.error = false
              RES.error_msg = "ok"
              RES.data = datajson;
              console.error('exec ' + JSON.stringify(RES.data));
              return RES
     } catch (error) {
          var datajson = error.toString()
              return datajson
     }

}

/* 
 * **********************************************************
 *    create  basic wg file server
 * **********************************************************
 */

async function wg_save_clientconf(res) {

  /*
  res.publickey     
  res.endpoint      
  res.serverip      
  res.bootstrapstackid
  res.netmask       
  res.privatekey    
  res.allowedips    
  res.interfaceip   
  res.endpointfpath 
*/

const apptest = require('express')();
const servertest =  apptest.listen(0, () => {
  var newport = servertest.address().port
  servertest.close();
(async function main() {
  fs.mkdir(`./hybrid/connect/${res.bootstrapstackid}`, { recursive: true }, (err) => {
			if (err){
				var RES = new Object();
				RES.error = true
				RES.error_msg = "error"
				RES.validator_msg = 'write error'
				RES.error_statuscode = "500"
				RES.data = err
				return RES
			}else{

  var endpointfpath = `${res.serverip}:${res.endpoint}`
var peerconfig =`
[Interface]
  PrivateKey = ${res.privatekey}
  ListenPort = ${newport}

[Peer]
  PublicKey = ${res.publickey}
  Endpoint = ${endpointfpath}
  AllowedIPs = ${res.allowedips}
  #AllowedIPs = 10.1.0.0/24, 0.0.0.0/0, ::/0
  PersistentKeepalive = 30
`
				 try {
						fs.writeFileSync(`./hybrid/connect/${res.bootstrapstackid}/wg0.conf`, peerconfig);
						var RES1 = new Object();
						RES1.error = false
						RES1.error_msg = "ok"
						RES1.validator_msg = 'ok'
						RES1.error_statuscode = "200"
						RES1.data = 'created'
						return RES1
				 } catch (error) {
							var datajson = error.toString()
							var RES1 = new Object();
							RES1.error = true
							RES1.error_msg = "error"
							RES1.validator_msg = 'write error'
							RES1.error_statuscode = "500"
							RES1.data = datajson
							return RES1
				 }
		}
	});
})();
 }) 
}

/* 
 * **********************************************************
 *    create  basic ifup linux
 * **********************************************************
 */

async function wg_save_ifup_linux(res) {
   var mypath             = process.cwd()
   var DEV_NAME           = res.dev_name                
   var INTERFACE_IP       = res.INTERFACE_IP           
   var INTERFACE_IProute  = res.INTERFACE_IProute    

  /*
  res.publickey     
  res.endpoint      
  res.serverip      
  res.bootstrapstackid
  res.netmask       
  res.privatekey    
  res.allowedips    
  res.interfaceip   
  res.endpointfpath 
*/
   try {
    const myExec = `
          ip link set ${DEV_NAME} down
          ip link del ${DEV_NAME}
          sleep 1
          ip link add ${DEV_NAME} type wireguard
          wg setconf ${DEV_NAME} /settingsclient/wg0.conf
          sleep 1
          ip addr add ${INTERFACE_IP} dev ${DEV_NAME}
          sysctl -w net.ipv4.conf.all.rp_filter=2 
          ip link set mtu 1420 up dev ${DEV_NAME}
          ip link set up dev ${DEV_NAME}
          ip route add default via ${INTERFACE_IProute} metric 2 table 200
          ip route show table 200 | grep -w ${INTERFACE_IProute}
          ip rule add table main suppress_prefixlength 0
    `
        fs.writeFileSync(`./hybrid/connect/${res.bootstrapstackid}/ifup_linux`, myExec);

    const myExec1 = `
          ip link set ${DEV_NAME} down
          ip link del ${DEV_NAME}
     `
        fs.writeFileSync(`./hybrid/connect/${res.bootstrapstackid}/ifdown_linux`, myExec1);

        return 'ok'
     } catch (error) {
          var datajson = error.toString()
        return datajson
     }
}

/* 
 * **********************************************************
 *    create  basic run docker
 * **********************************************************
 */

async function wg_save_connect_linux(res) {
   var mypath             = process.cwd()
   var DEV_NAME           = res.dev_name                
   var INTERFACE_IP       = res.INTERFACE_IP           
   var INTERFACE_IProute  = res.INTERFACE_IProute    

  /*
  res.publickey     
  res.endpoint      
  res.serverip      
  res.bootstrapstackid
  res.netmask       
  res.privatekey    
  res.allowedips    
  res.network_mode   
  res.interfaceip   
  res.endpointfpath 
mongoconfig
{ "mongo_user": "swarmlab", "mongo_pass": "ukuGJTBJSfoDI", "mongo_db": "venus", "mongo_ip": "127.0.0.1", "mongo_port": "56623", "mongo_coll": "logs" }
export NODE_PATH=$(npm root --quiet -g)
*/
   try {
    var mongoserver = JSON.parse(fs.readFileSync('./hybrid/venus-stats/config.json', 'utf8'))

     var NETWORK_MODE=''
     if(res.network_mode){
        var WGNETWORK_NAME=''
        NETWORK_MODE=' --net=host '
        NETWORK_MODE_CREATE='no'
     }else{
        var WGNETWORK_NAME=`swlab${res.bootstrapstackid.slice(0, 10)}`
        NETWORK_MODE=` --net=${WGNETWORK_NAME}`
        NETWORK_MODE_CREATE='yes'
     }


    const myExec = `

     NETWORK_MODE_CREATE=${NETWORK_MODE_CREATE}
     if [ "\$NETWORK_MODE_CREATE" = 'yes' ]; then
       NETWORK_NAME=${WGNETWORK_NAME}
       docker network ls --filter name=^\${NETWORK_NAME}$ --format="{{ .Name }}"
       if [ -z \$(docker network ls --filter name=^\${NETWORK_NAME}$ --format="{{ .Name }}") ] ; then 
            docker network create \${NETWORK_NAME} ; 
       fi
     fi

     docker exec  swarmlabwg-${res.bootstrapstackid} /bin/bash -c "ip link set ${DEV_NAME} down; ip link del ${DEV_NAME}"
sleep 1
docker stop swarmlabwg-${res.bootstrapstackid}; docker container rm swarmlabwg-${res.bootstrapstackid}
sleep 1
docker pull hub.swarmlab.io:5480/venusclient:latest
sleep 1
docker run -d \
  ${NETWORK_MODE} \
  --name=swarmlabwg-${res.bootstrapstackid} \
  --cap-add=NET_ADMIN \
  --cap-add=SYS_MODULE \
  -e PUID=1000 \
  -e PGID=1000 \
  -e NODE_PATH=/usr/local/lib/node_modules \
  -e stackid=${res.bootstrapstackid} \
  -e stackname=swarmlabwg-${res.bootstrapstackid} \
  -e stackinterface=${res.privatekey} \
  -e stackpeer=${res.publickey} \
  -e mongo_user=${mongoserver.mongo_user} \
  -e mongo_pass=${mongoserver.mongo_pass} \
  -e mongo_db=${mongoserver.mongo_db} \
  -e mongo_ip=${mongoserver.mongo_ip} \
  -e mongo_port=${mongoserver.mongo_port} \
  -e mongo_coll=${mongoserver.mongo_coll} \
  -e TZ=Europe/Athens \
  -v ${mypath}/hybrid/connect/${res.bootstrapstackid}:/settingsclient \
  -v /lib/modules:/lib/modules \
  --restart unless-stopped \
  hub.swarmlab.io:5480/venus-alpine:latest
    `
  //-p 51820:51820/udp \
  //docker exec -it swarmlabwg /bin/bash -c "pm2-runtime start /app/swarmlab-venus/client_ecosystem.config.js"
  //hub.swarmlab.io:5480/venusclient:latest
	fs.writeFileSync(`./hybrid/connect/${res.bootstrapstackid}/swarmlabwg`, myExec);
	fs.writeFileSync(`./hybrid/connect/${res.bootstrapstackid}/swarmlabstatus`, 'wgstatusclient=off');

  const myExecLog = `#!/bin/sh

date=\`date '+%Y-%m-%d-%H:%M'\`
NETWORK_MODE_CREATE=${NETWORK_MODE_CREATE}
if [ "\$NETWORK_MODE_CREATE" = 'no' ]; then
  node /usr/local/bin/venus-stats.js --insert=yes --port=${mongoserver.mongo_port} --ip='127.0.0.1' --user=swarmlab --password=${mongoserver.mongo_pass} --db=${mongoserver.mongo_db} --coll=${mongoserver.mongo_coll} --json=$date --stackid=${res.bootstrapstackid} --stackinterface=${res.privatekey} --stackpeer=${res.publickey} --devname=${DEV_NAME}
else
  IPmongo=$(/sbin/ip route|awk '/default/ { print \$3 }')
  node /usr/local/bin/venus-stats.js --insert=yes --port=${mongoserver.mongo_port} --ip=\$IPmongo --user=swarmlab --password=${mongoserver.mongo_pass} --db=${mongoserver.mongo_db} --coll=${mongoserver.mongo_coll} --json=$date --stackid=${res.bootstrapstackid} --stackinterface=${res.privatekey} --stackpeer=${res.publickey} --devname=${DEV_NAME}
fi
	`

   fs.writeFileSync(`./hybrid/connect/${res.bootstrapstackid}/scripts/1/logs`, myExecLog);
   fs.chmodSync(`./hybrid/connect/${res.bootstrapstackid}/scripts/1/logs`, 0o755); 

    const myExec1 = `
     docker exec  swarmlabwg-${res.bootstrapstackid} /bin/bash -c "ip link set ${DEV_NAME} down; ip link del ${DEV_NAME}"
     sleep 1
     docker stop swarmlabwg-${res.bootstrapstackid}; docker container rm swarmlabwg-${res.bootstrapstackid}
     sleep 1
    `
        fs.writeFileSync(`./hybrid/connect/${res.bootstrapstackid}/swarmlabwgdown`, myExec1);


        return 'ok'
     } catch (error) {
          var datajson = error.toString()
        return datajson
     }
}

app.post('/hybrid_join_start', (req, res, next) => {

  var RES = new Object();
  RES.publickey   = req.body["publickey"]
  RES.endpoint    = req.body["endpointport"]
  RES.serverip    = req.body["serverip"]
  RES.bootstrapstackid    = req.body["bootstrapstackid"]
  RES.netmask    = req.body["netmask"]
  RES.privatekey  = req.body["privatekey"]
  RES.allowedips  = req.body["allowedips"]
  RES.network_mode  = req.body["network_mode"]
  RES.interfaceip  = req.body["peer_ip"]
  RES.endpointfpath = `${RES.serverip}:${RES.endpoint}`
  RES.dev_name    = `swlab${RES.bootstrapstackid.slice(0, 10)}`
console.log(RES.dev_name)
  RES.INTERFACE_IP = `${RES.interfaceip}/${RES.netmask}`
  RES.INTERFACE_IProute = `${RES.interfaceip}`

  try {
  // *****************************************
  // *** save  wg config file wg0.conf
  // *****************************************
	//fs.mkdirSync(`./hybrid/connect/${res.bootstrapstackid}`, { recursive: true });
  fs.mkdirSync(`./hybrid/connect/${RES.bootstrapstackid}/scripts/1`, { recursive: true });
  //fs.mkdirSync(`./hybrid/connect/${res.bootstrapstackid}/scripts/5`, { recursive: true });
 (async() => {
  RES.serverconf    = await wg_save_clientconf(RES)
  RES.serverrun     = await wg_save_ifup_linux(RES)
  RES.serverconnect = await wg_save_connect_linux(RES)
 })()
  // *****************************************
  // *** save  wg ifup linux
  // *****************************************
  
  RES.error = false
  RES.error_msg = "ok"
  RES.action = "ok"

  console.error('socket get from client' + JSON.stringify(RES))
  res.json(RES)
     } catch (error) {
          var datajson = error.toString()
        RES.error = true
        RES.error_msg = datajson
        RES.action = "no"
        res.json(RES)
     }

});

app.post('/hybrid_join_connect', (req, res, next) => {

  var RES = new Object();
  RES.action   = req.body["action"]
  RES.bootstrapstackid   = req.body["bootstrapstackid"]

  try {
      if(RES.action == "connect"){

        fs.writeFileSync(`./hybrid/connect/${RES.bootstrapstackid}/swarmlabstatus`, 'wgstatusclient=on');
        var showexecrm = `/bin/sh ./hybrid/connect/${RES.bootstrapstackid}/swarmlabwg`
        execSync(showexecrm);
        var showexec = `docker ps --format '{"ID":"{{ .ID }}", "Image": "{{ .Image }}", "Names":"{{ .Names }}", "Ports":"{{.Ports}}", "Networks":"{{.Networks}}", "Status":"{{.Status}}","RunningFor":"{{.RunningFor}}","CreatedAt":"{{.CreatedAt}}"}' | jq . -s `
  exec(showexec, (err, stdout, stderr) => {
        if (err) {
              console.error(`exec error: ${err}`);
              return;
            }

            var nn = []
            var string = stdout.toString()
            var datajson = JSON.parse(string);

          var results = []
          var filter = `swarmlabwg-${RES.bootstrapstackid}`
            var grep = new RegExp(filter);
            var datalenth = datajson.length
            for (var i=0 ; i < datalenth ; i++)
            {
                  if(grep.test(datajson[i]['Names'])){
                    results.push(datajson[i]);
                  }
            }

              RES.debug = datajson
            if(results){
              RES.error = false
              RES.error_msg = "ok"
              RES.action = "execok"

              console.error('socket get from client ' + JSON.stringify(RES))
              res.json(RES)
            }else{
              RES.error = false
              RES.error_msg = "ok"
              RES.action = "execno"

              console.error('socket get from client ' + JSON.stringify(RES))
              res.json(RES)
            }
        });
      }else if( RES.action == "disconnect" ){
        fs.writeFileSync(`./hybrid/connect/${RES.bootstrapstackid}/swarmlabstatus`, 'wgstatusclient=off');

        var showexecrm1 = `/bin/sh ./hybrid/connect/${RES.bootstrapstackid}/swarmlabwgdown`
        execSync(showexecrm1);

        var showexec = `docker ps --format '{"ID":"{{ .ID }}", "Image": "{{ .Image }}", "Names":"{{ .Names }}", "Ports":"{{.Ports}}", "Networks":"{{.Networks}}", "Status":"{{.Status}}","RunningFor":"{{.RunningFor}}","CreatedAt":"{{.CreatedAt}}"}' | jq . -s `
  exec(showexec, (err, stdout, stderr) => {
        if (err) {
              console.error(`exec error: ${err}`);
              return;
            }

            var nn = []
            var string = stdout.toString()
            var datajson = JSON.parse(string);

          var results = []
          var filter = `swarmlabwg-${RES.bootstrapstackid}`
            var grep = new RegExp(filter);
            var datalenth = datajson.length
            for (var i=0 ; i < datalenth ; i++)
            {
                  if(grep.test(datajson[i]['Names'])){
                    results.push(datajson[i]);
                  }
            }

              RES.debug = datajson

            if(results){
              RES.error = false
              RES.error_msg = "ok"
              RES.action = "execok"

              console.error('socket get from client ' + JSON.stringify(RES))
              res.json(RES)
            }else{
              RES.error = false
              RES.error_msg = "ok"
              RES.action = "execno"

              console.error('socket get from client ' + JSON.stringify(RES))
              res.json(RES)
            }
        });
      }
     } catch (error) {
          var datajson = error.toString()
        RES.error = true
        RES.error_msg = datajson
        RES.action = "no"
        res.json(RES)
     }

});


app.get('/getserviceshybridstatus', (req, res, next) => {

        var RES = new Object();
        RES.bootstrapnameid    = req.query["bootstrapnameid"]
        RES.bootstrapstackname    = req.query["bootstrapstackname"]
        var showexec = `docker ps --format '{"Names":"{{ .Names }}", "Status":"{{.Status}}", "Networks":"{{.Networks}}" }' | jq . -s `
        exec(showexec, (err, stdout, stderr) => {
           if (err) {
              console.error(`exec error: ${err}`);
              return;
            }
           if (stdout) {
              var string = stdout.toString()
              var datajson = JSON.parse(string);
             
              var search = RES.bootstrapstackname
              var extenderror = new RegExp(search);
              var found = 'no';
              for(var i = 0; i < datajson.length; i++) {
                 var servicename = datajson[i].Names
                 //console.log(JSON.stringify(search+' '+servicename))
                  if(extenderror.test(servicename)){
                     found = 'yes';
                  }
              }
              
                      RES.error = false
                      RES.error_msg = "ok"
                      RES.test = datajson;
                      RES.data = found;
                      res.json(RES)

            }else{
                    var found = 'no'
                      RES.error = false
                      RES.error_msg = "ok"
                      RES.data = found;
                      res.json(RES)
            }
         });

});

app.get('/getwginterfaces', (req, res, next) => {

    var mypath = process.cwd()
    //var mongoserver = JSON.parse(fs.readFileSync('./hybrid/venus-stats/config.json', 'utf8'))
		//var showexec = `docker exec  swlabadminvenus /bin/bash -c "/usr/local/bin/check-wg-connection.sh"`
		var showexec = `/bin/bash ./hybrid/scripts/linux-check-wg-connection.sh`
    var RES = new Object();
    const page    	= req.query["page"]
    const per_page  = req.query["per_page"]
    var sort    	= req.query["sort"]
    var filter    = req.query["filter"]
    var type    	= req.query["type"]
    var sort    	= req.query["sort"]
    var sorttmp1 = sort.split('|');
    var sortname = sorttmp1[0];
    var sortorder = sorttmp1[1];
    log = spawn(showexec, {
      shell: true,
      cwd: mypath,
      detached: false,
      stdio: 'pipe'
    });

    log.stderr.on('data', function (data) {
        RES.code  = req.query["action"]
        RES.token = req.query["token"]
        RES.error = true
        RES.error_msg = "no"
        RES.data = data.toString();
      console.log('error '+JSON.stringify(RES));
      //res.json(RES.data)
    });

    log.stdout.on('data', function (data) {
      var n = {}
      n.data = data.toString()
      n.data = n.data.replace(/(\r\n|\n|\r|\t)/g,"");
      var interfaces = JSON.parse(n.data);
      var total = interfaces.length;
      var perpage = per_page
      var lastpage = total/perpage;

      if(lastpage <= 1) {
        lastpage=1
      }else{
        lastpage++
      }
      lastpage = Math.trunc(lastpage);

      var next=(page+1);
      if(next >= lastpage){
        next=lastpage;
      }
      var prev=(page-1);
      if(prev == 0){
        prev=1;
      }
      var from=((page-1)*perpage)+1;
      var to=(perpage*page)

      var mywgint = new Object();
  var links = `
    {
          "pagination": {
                  "total": ${total},
                  "per_page": ${perpage},
                  "current_page": ${page},
                  "last_page": ${lastpage},
                  "next_page_url": "?page=${next}",
                  "prev_page_url": "?page=${prev}",
                  "from": ${from},
                  "to": ${to},
                  "frommongo": ${from},
                  "tomongo": ${to}
                }
        }
      `
        mywgint.links = JSON.parse(links);
        from--
        mywgint.data = interfaces.slice(from,to);

        RES.code  = req.query["action"]
        RES.token = req.query["token"]
        RES.error = false
        RES.error_msg = "ok"
        RES.data = mywgint;
        res.json(RES.data)
    });

});

app.get('/getwginterfacesstats', (req, res, next) => {
    var mypath = process.cwd()
    var mongoserver = JSON.parse(fs.readFileSync('./hybrid/venus-stats/config.json', 'utf8'))
    const bootstrapstackid    	= req.query["stackid"]
    const respublickey    	= req.query["publickey"]
    try {
        var mongourl = `mongodb://${mongoserver.mongo_user}:${mongoserver.mongo_pass}@${mongoserver.mongo_ip}:${mongoserver.mongo_port}`;
        const OPTS = {
          useNewUrlParser: true,
          useUnifiedTopology: true
        };
        MongoClient.connect(mongourl, OPTS, function(err, db) {
            if(err){
                console.log(err);
            } else {
              console.log(mongoserver)
              var dbo = db.db(mongoserver.mongo_db);
              var limit = 10
              dbo.collection(mongoserver.mongo_coll).find({"stackid":bootstrapstackid},{sort:{_id:-1}}).limit(limit).toArray(function(err, result) {
              try {
                if(err){
                    console.log(err);
                      //res.json(err)
                } else {
                    //console.log(result);
                    //console.log(` ----------${bootstrapstackid}---------------`);
                        if(result[0].log[0].peers[respublickey].transferTx){
                            var datalenth = result.length
                            var labels = []
                            var datain = []
                            var dataout = []
                            for (var i=0 ; i < datalenth ; i++)
                            {
                              labels.push(result[i].date)
                              datain.push(result[i].log[0].peers[respublickey].transferTx)
                              dataout.push(result[i].log[0].peers[respublickey].transferRx)
                            }
                        }
                         var chartdata = {
                                     labels: labels,
                                     datasets: [
                                         {
                                           label: "In",
                                           backgroundColor: "#f87979",
                                           data: datain,
                                           borderColor: '#249EBF',
                                           pointBackgroundColor: 'white',
                                           borderWidth: 1,
                                           fill: false,
                                           lineTension: 0,
                                           steppedLine: true,
                                           pointBorderColor: '#249EBF'
                                         },
                                         {
                                           label: "Out",
                                           backgroundColor: "#A5CC82",
                                           data: dataout,
                                           borderColor: '#A5CC82',
                                           pointBackgroundColor: 'white',
                                           fill: false,
                                           borderWidth: 1,
                                           steppedLine: true,
                                           pointBorderColor: '#A5CC82'
                                         }
                                       ],
                                   }
                          //console.log(JSON.stringify(chartdata));
                          //console.log(JSON.stringify('-------- '+JSON.stringify(result[0].log[0].peers[respublickey].transferTx)));
                      db.close();
                      res.json(chartdata)
                     }
                   } catch (err) {
                      console.error(err);
                      res.json(err)
                   }
              });
            }
        });
     } catch (err) {
        console.error(err);
     }

});

async function mywgStatus(){
    //var mongoserver = JSON.parse(fs.readFileSync('./hybrid/venus-stats/config.json', 'utf8'))
     var mypath = process.cwd()

				var showexec = `docker exec  swlabadminvenus /bin/bash -c "/usr/local/bin/check-wg-connection.sh"`
             log = spawn(showexec, {
                shell: true,
                cwd: mypath,
                detached: false,
                stdio: 'pipe'
              });

              log.stdout.on('data', function (data) {
                var n = {}
                n.data = data.toString()
                n.data = n.data.replace(/(\r\n|\n|\r|\t)/g,"");
								var interfaces = JSON.parse(n.data);
								var datalenth = interfaces.length
								for (var i=0 ; i < datalenth ; i++)
								{
											var nn = {}
											nn.connection 			= interfaces[i].connection;
											nn.AllowedIPs 			= interfaces[i].ip;
											nn.publickey 				= interfaces[i].publickey;
											nn.bootstrapstackid = interfaces[i].stackid;
								}
                console.log(interfaces)
                return interfaces
              });

              log.stderr.on('data', function (data) {
                var n = {}
                n.data = data.toString()
								console.log('error '+JSON.stringify(n));
                return n
              });

              log.on('close', function (code) {
										console.log('close '+JSON.stringify(code));
                var n = {}
                n.data = code
                return interfaces
              });

}

function mywgRemoveClosedConnection(){
    //var mongoserver = JSON.parse(fs.readFileSync('./hybrid/venus-stats/config.json', 'utf8'))
     var mypath = process.cwd()

				var showexec = `docker exec  swlabadminvenus /bin/bash -c "/usr/local/bin/check-wg-connection.sh"`
             log = spawn(showexec, {
                shell: true,
                cwd: mypath,
                detached: false,
                stdio: 'pipe'
              });

              log.stdout.on('data', function (data) {
                var n = {}
                n.data = data.toString()
                n.data = n.data.replace(/(\r\n|\n|\r|\t)/g,"");
								//console.log(n);
								//console.log(n.data);
								var interfaces = JSON.parse(n.data);
								var datalenth = interfaces.length
                // interfaces found with connection=yes or no
								for (var i=0 ; i < datalenth ; i++)
								{
                                      //console.log(i)
                                      //console.log(interfaces)

									var intconnection = interfaces[i].connection;
									var resprivatekey = interfaces[i].ip;
									var respublickey = interfaces[i].publickey;
									var bootstrapstackid = interfaces[i].stackid;

											var nn = {}
											nn.connection 			= interfaces[i].connection;
											nn.AllowedIPs 			= interfaces[i].ip;
											nn.publickey 				= interfaces[i].publickey;
											nn.bootstrapstackid = interfaces[i].stackid;
										if(intconnection == 'no'){
											//console.log('no connection '+JSON.stringify(nn));
											var wgdown = `/bin/bash /config/${nn.bootstrapstackid}/ifdown_linux`
                      var showexecrm1 = `/bin/sh ./hybrid/connect/${bootstrapstackid}/swarmlabwgdown`
											var showexec1 = `docker exec swlabadminvenus /bin/bash -c "${wgdown}"; ${showexecrm1}`
												 log1 = spawn(showexec1, {
														shell: true,
														cwd: mypath,
														detached: false,
														stdio: 'pipe'
													});
													log1.on('close', function (code) {
																//console.log('close1 '+JSON.stringify(code));
															var n = {}
															n.data = code
															io.emit('message_close', n);
													});
										}else if(intconnection == 'yes'){
                      //connection is ok 
                      // check if container is ok

                            var showexeccheck = `docker ps --format '{"Names":"{{ .Names }}", "Status":"{{.Status}}"}' | jq . -s `
                            exec(showexeccheck, (err, stdout, stderr) => {
                               if (err) {
                                  console.error(`exec error: ${err}`);
                                  return;
                                }
                               if (stdout) {
                                  var string = stdout.toString()
                                  var datajson = JSON.parse(string);
                                 
                                  var search = `swarmlabwg-${bootstrapstackid}`
                                  var extenderror = new RegExp(search);
                                  var found = 'no';
                                  for(var ia = 0; ia < datajson.length; ia++) {
                                     var servicename = datajson[ia].Names
                                     //console.log(JSON.stringify(search+' '+servicename))
                                      if(extenderror.test(servicename)){
                                         found = 'yes';
                                      }
                                  }
                                 // container is down
                                 // exec interface to down 
                                 if( found == 'no'){
                                      //console.log(interfaces)
                                      //console.log('no connection '+JSON.stringify(nn));
                                      var wgdown = `/bin/bash /config/${nn.bootstrapstackid}/ifdown_linux`
                                      var showexecrm1 = `/bin/sh ./hybrid/connect/${bootstrapstackid}/swarmlabwgdown`

                                      //console.log('fount '+found + ' ' + search )
                                      var showexec1 = `docker exec swlabadminvenus /bin/bash -c "${wgdown}"; ${showexecrm1}`
                                         log1 = spawn(showexec1, {
                                            shell: true,
                                            cwd: mypath,
                                            detached: false,
                                            stdio: 'pipe'
                                          });
                                          log1.on('close', function (code) {
                                                //console.log('close1 '+JSON.stringify(code));
                                              var n = {}
                                              n.data = code
                                              io.emit('message_close', n);
                                          });
                                 }else{
                                    console.log('fount '+found + ' ' + search )
                                 }
                               }
                            })











                    }
								}
              });

              log.stderr.on('data', function (data) {
                var n = {}
                n.data = data.toString()
								console.log('error '+JSON.stringify(n));
                io.emit('message_err', n);
              });

              log.on('close', function (code) {
										console.log('close '+JSON.stringify(code));
                var n = {}
                n.data = code
                io.emit('message_close', n);
              });

                var n1 = {}
                n1.data = 'hello'
								console.log('errorhello '+JSON.stringify(n1));
                io.emit('message_err', n1);

/*
									 try {
											var mongourl = `mongodb://${mongoserver.mongo_user}:${mongoserver.mongo_pass}@${mongoserver.mongo_ip}:${mongoserver.mongo_port}`;
											const OPTS = {
												useNewUrlParser: true,
												useUnifiedTopology: true
											};
											MongoClient.connect(mongourl, OPTS, function(err, db) {
													if(err){
															console.log(err);
													} else {
														var dbo = db.db(mongoserver.mongo_db);
														var limit = 2
														dbo.collection(mongoserver.mongo_coll).find({"stackid":bootstrapstackid},{sort:{_id:-1}}).limit(limit).toArray(function(err, result) {
															if(err){
																	console.log(err);
															} else {
																console.log(JSON.stringify(result));
																//if("transferTx" in result[0]){ 
																	if(result[0].log[0].peers[respublickey].transferTx && result.length == 2){
																		if(result[0].log[0].peers[respublickey].transferTx == result[1].log[0].peers[respublickey].transferTx){
																			console.log(JSON.stringify(result.length));
																			console.log(JSON.stringify('-------- '+JSON.stringify(result[0].log[0].peers[respublickey].transferTx)));
																			console.log(JSON.stringify('-------- '+JSON.stringify(result[1].log[0].peers[respublickey].transferTx)));
																		}
																	}
																db.close();
															}
														});
													}
											});
									 } catch (err) {
											console.error(err);
									 }


			 try {
					var mongourl = `mongodb://${mongoserver.mongo_user}:${mongoserver.mongo_pass}@${mongoserver.mongo_ip}:${mongoserver.mongo_port}`;
					const OPTS = {
						useNewUrlParser: true,
						useUnifiedTopology: true
					};
					MongoClient.connect(mongourl, OPTS, function(err, db) {
							if(err){
									console.log(err);
							} else {
								var dbo = db.db(mongoserver.mongo_db);
							  var limit = 2
							  dbo.collection(mongoserver.mongo_coll).find({"stackid":res.bootstrapstackid},{sort:{_id:-1}}).limit(limit).toArray(function(err, result) {
									if(err){
											console.log(err);
									} else {
										console.log(JSON.stringify(result));
										//if("transferTx" in result[0]){ 
											if(result[0].log[0].peers[res.publickey].transferTx && result.length == 2){
										console.log(JSON.stringify(result.length));
													console.log(JSON.stringify('-------- '+JSON.stringify(result[0].log[0].peers[res.publickey].transferTx)));
													console.log(JSON.stringify('-------- '+JSON.stringify(result[1].log[0].peers[res.publickey].transferTx)));
											}
										db.close();
									}
								});
							}
					});
			 } catch (err) {
					console.error(err);
			 }
*/
}
mywgRemoveClosedConnection();

setInterval(function(){
      mywgRemoveClosedConnection()
}, 45000)

io.on('connection', function(socket) {
  console.log('new connection');
    socket.on('start', (value) => {
  			console.log('start'+ value);
    });
});

server.listen(serverPort, function() {
  console.log('server up and running at %s port', serverPort);
});
