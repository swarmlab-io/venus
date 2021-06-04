
var fs        = require('fs');

var express   = require('express');
var http      = require('http');
var app       = express();
const cors    = require('cors')
const helmet  = require('helmet');
var MongoClient = require('mongodb').MongoClient;
const yaml = require('js-yaml');
var mpath = require("path");

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
  fs.mkdirSync(`./hybrid/connect/${RES.bootstrapstackid}/volumes`, { recursive: true });
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




app.get('/dockerservices', (req, res, next) => {
          var RES = new Object();
          const page      = req.query["page"]
          const per_page  = req.query["per_page"]
          var sort      = req.query["sort"]
          var filter    = req.query["filter"]
          var type      = req.query["type"]
      var sort      = req.query["sort"]
      var sorttmp1 = sort.split('|');
      var sortname = sorttmp1[0];
      var sortorder = sorttmp1[1];
    var showexec = `docker ps --format '{"ID":"{{ .ID }}", "Image": "{{ .Image }}", "Names":"{{ .Names }}", "Ports":"{{.Ports}}", "Networks":"{{.Networks}}", "Status":"{{.Status}}","RunningFor":"{{.RunningFor}}","CreatedAt":"{{.CreatedAt}}"}' | jq . -s `
    exec(showexec, (err, stdout, stderr) => {
              if (err) {
                              console.error(`exec error: ${err}`);
                              return;
                            }
            var nn = []
            var string = stdout.toString()
            var datajson = JSON.parse(string);

            var results1 = []
                    var grep1 = new RegExp('swlabadminvenus');
                    var datalenth = datajson.length
                    for (var i=0 ; i < datalenth ; i++)
                      {
                          if(!grep1.test(datajson[i]['Names'])){
                               results1.push(datajson[i]);
                          }
                      }
                    datajson=results1
            var results2 = []
                    var grep2 = new RegExp('swlabmongovenus');
                    datalenth = datajson.length
                    for (var i=0 ; i < datalenth ; i++)
                      {
                          if(!grep2.test(datajson[i]['Names'])){
                               results2.push(datajson[i]);
                          }
                      }
                    datajson=results2

            var results3 = []
                    var grep3 = new RegExp('swarmlabwg-');
                    datalenth = datajson.length
                    for (var i=0 ; i < datalenth ; i++)
                      {
                          if(!grep3.test(datajson[i]['Names'])){
                               results3.push(datajson[i]);
                          }
                      }
                    datajson=results3

            var results4 = []
                    var grep4 = new RegExp('swarmlab-hybrid-agent');
                    datalenth = datajson.length
                    for (var i=0 ; i < datalenth ; i++)
                      {
                          if(!grep4.test(datajson[i]['Names'])){
                               results4.push(datajson[i]);
                          }
                      }
                    datajson=results4

            var results5 = []
                    var grep5 = new RegExp('wgmount-');
                    datalenth = datajson.length
                    for (var i=0 ; i < datalenth ; i++)
                      {
                          if(!grep5.test(datajson[i]['Names'])){
                               results5.push(datajson[i]);
                          }
                      }
                    datajson=results5

            var results6 = []
                    var grep6 = new RegExp('wgshare-');
                    datalenth = datajson.length
                    for (var i=0 ; i < datalenth ; i++)
                      {
                          if(!grep6.test(datajson[i]['Names'])){
                               results6.push(datajson[i]);
                          }
                      }
                    datajson=results6

            var results = []
              if(filter !== 'NULL'){
                    var grep = new RegExp(filter);
                    var datalenth = datajson.length
                    for (var i=0 ; i < datalenth ; i++)
                      {
                          if(grep.test(datajson[i]['Names'])){
                               results.push(datajson[i]);
                          }
                      }
                    datajson=results
                  }
        if(sortname == 'Names'){
          datajson.sort(function (a, b) {
            if(sortorder == 'asc'){
              return a.Names.localeCompare(b.Names);
            }else{
              return b.Names.localeCompare(a.Names);
            }
          });
        }else if(sortname == 'Status'){
          datajson.sort(function (a, b) {
            if(sortorder == 'asc'){
                return a.Status.localeCompare(b.Status);
            }else{
                return b.Status.localeCompare(a.Status);
            }
          });
        }
      var resultid = []
      var datalenth2 = datajson.length
          for (var i=0 ; i < datalenth2 ; i++)
          {
            datajson[i].id=i
            datajson[i]._id=i
            resultid.push(datajson[i]);
          }
      datajson=resultid
        var total = datajson.length;
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
              var myplaybooks = new Object();
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
              myplaybooks.links = JSON.parse(links);
              from--
              myplaybooks.data = datajson.slice(from,to);
              var RES = new Object();
              RES.code    = req.query["action"]
              RES.token    = req.query["token"]
              RES.error = false
              RES.error_msg = "ok"
              RES.data = myplaybooks;
              res.json(RES.data)
    });
});

// VENUS
app.get('/hybridnetworks', (req, res, next) => {
          var RES = new Object();
          const page      = req.query["page"]
          const per_page  = req.query["per_page"]
          var sort      = req.query["sort"]
          var filter    = req.query["filter"]
          var type      = req.query["type"]
      var sort      = req.query["sort"]
      var sorttmp1 = sort.split('|');
      var sortname = sorttmp1[0];
      var sortorder = sorttmp1[1];
    var showexec = `docker ps --format '{"ID":"{{ .ID }}", "Image": "{{ .Image }}", "Names":"{{ .Names }}", "Ports":"{{.Ports}}", "Networks":"{{.Networks}}", "Status":"{{.Status}}","RunningFor":"{{.RunningFor}}","CreatedAt":"{{.CreatedAt}}"}' | jq . -s `
    exec(showexec, (err, stdout, stderr) => {
              if (err) {
                              console.error(`exec error: ${err}`);
                              return;
                            }
            var nn = []
            var string = stdout.toString()
            var datajson = JSON.parse(string);

            var results3 = []
                    var grep3 = new RegExp('swarmlabwg-');
                    datalenth = datajson.length
                    for (var i=0 ; i < datalenth ; i++)
                      {
                          if(grep3.test(datajson[i]['Names'])){
                               results3.push(datajson[i]);
                          }
                      }
                    datajson=results3

            var results1 = []
                    var grep1 = new RegExp(/^swlab/);
                    datalenth = datajson.length
                    for (var i=0 ; i < datalenth ; i++)
                      {
                          if(grep1.test(datajson[i]['Networks'])){
                               results1.push(datajson[i]);
                          }
                      }
                    datajson=results1

            var results = []
              if(filter !== 'NULL'){
                    var grep = new RegExp(filter);
                    var datalenth = datajson.length
                    for (var i=0 ; i < datalenth ; i++)
                      {
                          if(grep.test(datajson[i]['Names'])){
                               results.push(datajson[i]);
                          }
                      }
                    datajson=results
                  }

       //swlabJZk0tKskTS


        if(sortname == 'Names'){
          datajson.sort(function (a, b) {
            if(sortorder == 'asc'){
              return a.Names.localeCompare(b.Names);
            }else{
              return b.Names.localeCompare(a.Names);
            }
          });
        }else if(sortname == 'Status'){
          datajson.sort(function (a, b) {
            if(sortorder == 'asc'){
                return a.Status.localeCompare(b.Status);
            }else{
                return b.Status.localeCompare(a.Status);
            }
          });
        }
      var resultid = []
      var datalenth2 = datajson.length
          for (var i=0 ; i < datalenth2 ; i++)
          {
            datajson[i].id=i
            datajson[i]._id=i
            resultid.push(datajson[i]);
          }
      datajson=resultid
        var total = datajson.length;
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
              var myplaybooks = new Object();
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
              myplaybooks.links = JSON.parse(links);
              from--
              myplaybooks.data = datajson.slice(from,to);
              var RES = new Object();
              RES.code    = req.query["action"]
              RES.token    = req.query["token"]
              RES.error = false
              RES.error_msg = "ok"
              RES.data = myplaybooks;
              res.json(RES.data)
    });
});

// VENUS
app.get('/getshare_volumes', (req, res, next) => {
          var RES = new Object();
          const page      = req.query["page"]
          const per_page  = req.query["per_page"]
          var sort      = req.query["sort"]
          var filter    = req.query["filter"]
          var type      = req.query["type"]
      var sort      = req.query["sort"]
      var sorttmp1 = sort.split('|');
      var sortname = sorttmp1[0];
      var sortorder = sorttmp1[1];
    var showexec = `docker ps --format '{"ID":"{{ .ID }}", "Image": "{{ .Image }}", "Names":"{{ .Names }}", "Ports":"{{.Ports}}", "Networks":"{{.Networks}}", "Status":"{{.Status}}","RunningFor":"{{.RunningFor}}","CreatedAt":"{{.CreatedAt}}"}' | jq . -s `
    exec(showexec, (err, stdout, stderr) => {
              if (err) {
                              console.error(`exec error: ${err}`);
                              return;
                            }
            var nn = []
            var string = stdout.toString()
            var datajson = JSON.parse(string);

            var results3 = []
                    var grep3 = new RegExp('wgshare-');
                    datalenth = datajson.length
                    for (var i=0 ; i < datalenth ; i++)
                      {
                          if(grep3.test(datajson[i]['Names'])){
                               results3.push(datajson[i]);
                          }
                      }
                    datajson=results3

            var results = []
              if(filter !== 'NULL'){
                    var grep = new RegExp(filter);
                    var datalenth = datajson.length
                    for (var i=0 ; i < datalenth ; i++)
                      {
                          if(grep.test(datajson[i]['Names'])){
                               results.push(datajson[i]);
                          }
                      }
                    datajson=results
                  }

       //swlabJZk0tKskTS


        if(sortname == 'Names'){
          datajson.sort(function (a, b) {
            if(sortorder == 'asc'){
              return a.Names.localeCompare(b.Names);
            }else{
              return b.Names.localeCompare(a.Names);
            }
          });
        }else if(sortname == 'Status'){
          datajson.sort(function (a, b) {
            if(sortorder == 'asc'){
                return a.Status.localeCompare(b.Status);
            }else{
                return b.Status.localeCompare(a.Status);
            }
          });
        }
      var resultid = []
      var datalenth2 = datajson.length
          for (var i=0 ; i < datalenth2 ; i++)
          {
            datajson[i].id=i
            datajson[i]._id=i
            resultid.push(datajson[i]);
          }
      datajson=resultid
        var total = datajson.length;
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
              var myplaybooks = new Object();
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
              myplaybooks.links = JSON.parse(links);
              from--
              myplaybooks.data = datajson.slice(from,to);
              var RES = new Object();
              RES.code    = req.query["action"]
              RES.token    = req.query["token"]
              RES.error = false
              RES.error_msg = "ok"
              RES.data = myplaybooks;
              res.json(RES.data)
    });
});

// VENUS
app.get('/getshare_clientvolumes', (req, res, next) => {
          var RES = new Object();
          const page      = req.query["page"]
          const per_page  = req.query["per_page"]
          var sort      = req.query["sort"]
          var filter    = req.query["filter"]
          var type      = req.query["type"]
      var sort      = req.query["sort"]
      var sorttmp1 = sort.split('|');
      var sortname = sorttmp1[0];
      var sortorder = sorttmp1[1];
    var showexec = `docker ps --format '{"ID":"{{ .ID }}", "Image": "{{ .Image }}", "Names":"{{ .Names }}", "Ports":"{{.Ports}}", "Networks":"{{.Networks}}", "Status":"{{.Status}}","RunningFor":"{{.RunningFor}}","CreatedAt":"{{.CreatedAt}}"}' | jq . -s `
    exec(showexec, (err, stdout, stderr) => {
              if (err) {
                              console.error(`exec error: ${err}`);
                              return;
                            }
            var nn = []
            var string = stdout.toString()
            var datajson = JSON.parse(string);

            var results3 = []
                    var grep3 = new RegExp('wgmount-');
                    datalenth = datajson.length
                    for (var i=0 ; i < datalenth ; i++)
                      {
                          if(grep3.test(datajson[i]['Names'])){
                               results3.push(datajson[i]);
                          }
                      }
                    datajson=results3

            var results = []
              if(filter !== 'NULL'){
                    var grep = new RegExp(filter);
                    var datalenth = datajson.length
                    for (var i=0 ; i < datalenth ; i++)
                      {
                          if(grep.test(datajson[i]['Names'])){
                               results.push(datajson[i]);
                          }
                      }
                    datajson=results
                  }

       //swlabJZk0tKskTS


        if(sortname == 'Names'){
          datajson.sort(function (a, b) {
            if(sortorder == 'asc'){
              return a.Names.localeCompare(b.Names);
            }else{
              return b.Names.localeCompare(a.Names);
            }
          });
        }else if(sortname == 'Status'){
          datajson.sort(function (a, b) {
            if(sortorder == 'asc'){
                return a.Status.localeCompare(b.Status);
            }else{
                return b.Status.localeCompare(a.Status);
            }
          });
        }
      var resultid = []
      var datalenth2 = datajson.length
          for (var i=0 ; i < datalenth2 ; i++)
          {
            datajson[i].id=i
            datajson[i]._id=i
            resultid.push(datajson[i]);
          }
      datajson=resultid
        var total = datajson.length;
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
              var myplaybooks = new Object();
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
              myplaybooks.links = JSON.parse(links);
              from--
              myplaybooks.data = datajson.slice(from,to);
              var RES = new Object();
              RES.code    = req.query["action"]
              RES.token    = req.query["token"]
              RES.error = false
              RES.error_msg = "ok"
              RES.data = myplaybooks;
              res.json(RES.data)
    });
});

// VENUS
app.get('/getservicesmountstatus', (req, res, next) => {

        var RES = new Object();
        RES.bootstrapstackname    = req.query["name"]
        var showexec = `docker exec ${RES.bootstrapstackname} /bin/sh -c "/usr/local/bin/check_mount"`
        exec(showexec, (err, stdout, stderr) => {
           if (err) {
              console.error(`exec error: ${err}`);
              return;
            }
           if (stdout) {
              var string = stdout.toString()
              string = string.replace(/(\r\n|\n|\r|\t)/g,"");
              if(string == 'yes'){
                var found = 'yes';
              }else{
                var found = 'no';
              }
                      RES.error = false
                      RES.error_msg = "ok"
                      RES.test = string;
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

async function mywgcheckStatus(){
    //var mongoserver = JSON.parse(fs.readFileSync('./hybrid/venus-stats/config.json', 'utf8'))
     var mypath = process.cwd()

				var showexec = `/bin/bash ${mypath}/files/checkstatus.sh`
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
								console.log('mywgcheckStatusdata '+JSON.stringify(n));
								io.emit('mywgcheckStatus_res', n);
              });

              log.stderr.on('data', function (data) {
                var n = {}
                n.data = data.toString()
								console.log('mywgcheckStatuserror '+JSON.stringify(n));
								io.emit('mywgcheckStatus_res_error', n);
              });

              log.on('close', function (code) {
                var n = {}
                n.data = code
								console.log('mywgcheckStatusclose '+JSON.stringify(code));
								io.emit('mywgcheckStatus_res_close', n);
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
       try { 
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
																console.log('close1close----------1 '+JSON.stringify(code));
															var n = {}
															n.data = code
															io.emit('message_close', n);
													});
										}else if(intconnection == 'yes'){
                      //connection is ok 
                      // check if container is ok

																console.log('close1close----------2 ');
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

                                      console.log('fount disconnect '+found + ' ' + showexecrm1 )
                                   // auto close when no connection exist
                                   /*
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
                                   */       
                                 }else{
                                    console.log('fountsearch '+found + ' ' + search )
                                 }
                               }
                            })

                    }
								}
			 } catch (err) {
					console.error(err);
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
                //auto close network container
                //mywgcheckStatus();
              });

                var n1 = {}
                n1.data = 'hello'
								console.log('errorhello '+JSON.stringify(n1));
                io.emit('message_err', n1);

}
mywgRemoveClosedConnection();

setInterval(function(){
      mywgRemoveClosedConnection()
}, 45000)

  async function socket_get_container_ports(containerservice){
        try {
            var mypath = process.cwd()
            var service = {}
            service.Name    = containerservice
            service.Dir     = mypath
            var showexec = `docker cp ${mypath}/files/findports.sh ${service.Name}:/tmp/findports.sh; docker exec ${service.Name} /bin/sh -c "/bin/sh /tmp/findports.sh"`
            console.log(showexec)
               log = spawn(showexec, {
                  shell: true,
                  cwd: service.Dir,
                  detached: false,
                  stdio: 'pipe'
                });
                log.stdout.on('data', function (data) {
                  var n = {}
                  n.status = 'data'
                  n.exec = 'info'
                  try {
                    n.data = data.toString()
                    //n.data = JSON.parse(n.data)
                  } catch (err) {
                      console.log(err.stack || String(err));
                  }
                  console.log('data '+JSON.stringify(n.data));
                  io.emit('virtual_port_info_res', n);
                });
                log.stderr.on('data', function (data) {
                  var n = {}
                  n.status = 'error'
                  n.exec = 'info'
                  n.data = data.toString()
                  io.emit('virtual_port_info_reserror', n);
                  console.log('error '+JSON.stringify(n.data));
                });
                log.on('close', function (code) {
                  var n = {}
                  n.status = 'close'
                  n.exec = 'info'
                  n.data = code
                  io.emit('virtual_port_info_resclose', n);
                });
        } catch (err) {
            console.log(err.stack || String(err));
        }
}

function makeid(length) {
      var result           = [];
      var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for ( var i = 0; i < length; i++ ) {
              result.push(characters.charAt(Math.floor(Math.random() * 
                 charactersLength)));
           }
     return result.join('');
}


io.on('connection', function(socket) {
  console.log('new connection');
    socket.on('start', (value) => {
  			console.log('start'+ value);
    });

    socket.on('share_app_info', (value) => {
        var service = {}
        var mypath = process.cwd()
        try {
            service.Name = value.Names 
            console.log(JSON.stringify(value));
            var showexec = `docker inspect --format '{{json .Config.Labels}}' ${service.Name}`
             log = spawn(showexec, {
                shell: true,
                cwd: mypath,
                detached: false,
                stdio: 'pipe'
              });
              log.stdout.on('data', function (data) {
                var n = {}
                n.status = 'data'
                n.exec = 'inspect'
                n.data = data.toString()
								var interfaces = JSON.parse(n.data);
                io.emit('share_app_res', n);
              });
              log.stderr.on('data', function (data) {
                var n = {}
                n.status = 'error'
                n.exec = 'inspect'
                n.data = data.toString()
                io.emit('share_app_reserror', n);
              });
              log.on('close', function (code) {
                var n = {}
                n.status = 'close'
                n.exec = 'inspect'
                n.data = code
                io.emit('share_app_resclose', n);
              });
            
            var showexec1 = `docker ps --format '{"ID":"{{ .ID }}", "Image": "{{ .Image }}", "Names":"{{ .Names }}", "Ports":"{{.Ports}}", "Networks":"{{.Networks}}", "Status":"{{.Status}}","RunningFor":"{{.RunningFor}}","CreatedAt":"{{.CreatedAt}}"}' | jq . -s `
             log1 = spawn(showexec1, {
                shell: true,
                cwd: mypath,
                detached: false,
                stdio: 'pipe'
              });
              log1.stdout.on('data', function (data) {
                var n = {}
                n.status = 'data'
                n.exec = 'ps'
                var string = data.toString()
                var datajson = JSON.parse(string);

                var results = []
                var filter = `swarmlabwg-`
                var grep = new RegExp(filter);
                var datalenth = datajson.length
                for (var i=0 ; i < datalenth ; i++)
                {
                      if(grep.test(datajson[i]['Names'])){
                        results.push(datajson[i]);
                      }
                }
                n.data = results
                io.emit('share_app_res', n);
              });
              log1.stderr.on('data', function (data) {
                var n = {}
                n.status = 'error'
                n.exec = 'ps'
                n.data = data.toString()
                io.emit('share_app_reserror', n);
              });
              log1.on('close', function (code) {
                var n = {}
                n.status = 'close'
                n.exec = 'ps'
                n.data = code
                io.emit('share_app_resclose', n);
              });


        } catch (err) {
            console.log(err.stack || String(err));
        }
   });

    socket.on('share_app', (value) => {
        var service = {}
        var mypath = process.cwd()
      /*
       * value.c
          this.dockercompose.stack    = 'com.docker.compose.project'
          this.dockercompose.service  = 'com.docker.compose.service'
          this.dockercompose.file     = 'com.docker.compose.project.config_files'
          this.dockercompose.env      = 'com.docker.compose.project.environment_file'
          this.dockercompose.dir      = 'com.docker.compose.project.working_dir'
          value.s          [{"ID":"36be0c53c700","Image":"hub.swarmlab.io:5480/venus-alpine:latest","Names":"swarmlabwg-AcwtSX5hswT4pmObytxBjoCd4rDJMwB1","Ports":"80/tcp, 443/tcp, 8080/tcp, 8088/tcp, 51820/udp","Networks":"swlabAcwtSX5hsw","Status":"Up 35 minutes","RunningFor":"35 minutes ago","CreatedAt":"2021-05-26 13:21:08 +0300 EEST"}]
          value.n conatiner name
          */
            console.log(JSON.stringify(value));
        try {
            service.Name    = mpath.basename(value.c.file)
            service.Dir     = value.c.dir
            service.stack   = value.c.stack
            service.env     = value.c.env
            service.service = value.c.service
            service.network = value.n

            console.log(JSON.stringify(value.c.statck));
            if(value.c.stack){
              var filename1 = service.Dir+"/"+service.stack+'_'+service.service+"-venus.yml"
              var filenamedefault = service.Dir+"/"+service.stack+'_'+service.service+"-venus-default.yml"
              var filenameyaml  = service.Dir+"/"+service.Name
              var contents  = fs.readFileSync(filenameyaml, 'utf8')
              var yamldata  = yaml.load(contents)
              fs.exists(filenamedefault, (exists) => {
                if(exists){
                }else{
                  fs.copyFile(filenameyaml, filenamedefault, (err) => {
                      if (err){
                        console.log('source.txt was not copied to '+ filenamedefault);
                      }
                        console.log('source.txt was  copied to '+ filenamedefault);
                  });
                }
              });
              console.log(JSON.stringify(yamldata));
            
              delete yamldata.services[service.service].ports 
              delete yamldata.services[service.service].networks 
              //yamldata.services[service.service].network_mode: "service:masternfsserver"
              yamldata.services[service.service].network_mode = "container:"+service.network
              console.log(yamldata.services[service.service])


              var yamldata_out = yaml.dump(yamldata, {
                'styles': {
                      '!!null': '' // dump null as ~
                      //'!!null': 'canonical' // dump null as ~
                    },
                'sortKeys': false        // sort object keys
              });
              console.log(JSON.stringify(yamldata_out));
              fs.writeFileSync(filename1, yamldata_out);
              //var showexec = `cd ${service.Dir}; docker-compose -f ${filename1} --project-directory ${service.Dir} --env-file ${service.env} up -d ${service.service}`
              var showexec = `cd ${service.Dir}; docker-compose -f ${filename1} --project-directory ${service.Dir} up -d ${service.service}`
              console.log(showexec);
               log = spawn(showexec, {
                  shell: true,
                  cwd: service.Dir,
                  detached: false,
                  stdio: 'pipe'
                });
                log.stdout.on('data', function (data) {
                  var n = {}
                  n.status = 'data'
                  n.exec = 'share'
                  n.compose = 'yes'
                  n.data = data.toString()
                  io.emit('share_app_exec_res', n);
                });
                log.stderr.on('data', function (data) {
                  var n = {}
                  n.status = 'error'
                  n.exec = 'share'
                  n.data = data.toString()
                  n.compose = 'yes'
                  io.emit('share_app_exec_reserror', n);
                });
                log.on('close', function (code) {
                  var n = {}
                  n.status = 'close'
                  n.exec = 'share'
                  n.compose = 'yes'
                  n.data = code
                  io.emit('share_app_exec_resclose', n);
                });
            }else{
                var n = {}
                n.status = 'close'
                n.exec = 'share'
                n.compose = 'no'
                n.data = 'nodata'
                io.emit('share_app_exec_resclose', n);
            }

        } catch (err) {
            console.log(err.stack || String(err));
        }
   });

    socket.on('share_app_default', (value) => {
        var service = {}
        var mypath = process.cwd()
            console.log(JSON.stringify(value));
        try {
            service.Name    = mpath.basename(value.c.file)
            service.Dir     = value.c.dir
            service.stack   = value.c.stack
            service.env     = value.c.env
            service.service = value.c.service
            service.network = value.n

            if(value.c.stack){
              var filenamedefault = service.Dir+"/"+service.stack+'_'+service.service+"-venus-default.yml"
              //var showexec = `docker-compose -f ${filenamedefault} --project-directory ${service.Dir} --env-file ${service.env} up -d ${service.service}`
              var showexec = `cd ${service.Dir}; docker-compose -f ${filenamedefault} --project-directory ${service.Dir}  up -d ${service.service}`
              console.log(showexec);
               log = spawn(showexec, {
                  shell: true,
                  cwd: service.Dir,
                  detached: false,
                  stdio: 'pipe'
                });
                log.stdout.on('data', function (data) {
                  var n = {}
                  n.status = 'data'
                  n.exec = 'sharedefault'
                  n.compose = 'yes'
                  n.data = data.toString()
                  io.emit('share_app_exec_res', n);
                });
                log.stderr.on('data', function (data) {
                  var n = {}
                  n.status = 'error'
                  n.exec = 'sharedefault'
                  n.data = data.toString()
                  n.compose = 'yes'
                  io.emit('share_app_exec_reserror', n);
                });
                log.on('close', function (code) {
                  var n = {}
                  n.status = 'close'
                  n.exec = 'sharedefault'
                  n.compose = 'yes'
                  n.data = code
                  io.emit('share_app_exec_resclose', n);
                });
            }else{
                var n = {}
                n.status = 'close'
                n.exec = 'sharedefault'
                n.compose = 'no'
                n.data = 'nodata'
                io.emit('share_app_exec_resclose', n);
            }
        } catch (err) {
            console.log(err.stack || String(err));
        }
   });



    socket.on('virtual_port_getinfo', (value) => {
        var service = {}
        var mypath = process.cwd()
            console.log(JSON.stringify(value));
        try {
            socket_get_container_ports(value.name)
        } catch (err) {
            console.log(err.stack || String(err));
        }
   });


    socket.on('container_info', (value) => {
        var service = {}
        var mypath = process.cwd()
            console.log(JSON.stringify(value));
        try {
            service.Name    = mpath.basename(value.s.Names)
            service.Dir     = value.c.dir
            var showexec = `docker inspect --format '{{json .HostConfig.NetworkMode}}' ${service.Name}`
            //get ports async
                  //console.log(" exec PORT "+ service.Name);
            // ip --brief address show
            //var showexec = `docker inspect --format '{{json .Config}}' ${service.Name}`
               log = spawn(showexec, {
                  shell: true,
                  cwd: service.Dir,
                  detached: false,
                  stdio: 'pipe'
                });
                log.stdout.on('data', function (data) {
                  var n = {}
                  n.status = 'data'
                  n.exec = 'info'
                  n.data = data.toString()
                  n.data = n.data.replace(/(\r\n|\n|\r)/gm, "");
                  n.data = n.data.replace(/["']/g, "");
                  console.log(JSON.stringify(n.data));
                  var grep1a = new RegExp(/^container/);
                  var grep1b = new RegExp(/^service/);
                  if(grep1a.test(n.data) || grep1b.test(n.data)){
                     var ndata  = n.data.replace(/["']/g, "");
                     var grepsplit = new RegExp(':');
                     if(grepsplit.test(ndata)){  // network_mode container
                       var split = ndata.split(":")
                       var containername = split[1].replace(/(\r\n|\n|\r)/gm, "");
                       var showexec2 = `docker exec ${containername} /bin/sh -c "ip -j --brief address show"`
                       //docker exec -it microservice-jupyter26_masterservice_1 /bin/sh -c "jupyter notebook list"
                       console.log(showexec2)
                       log2 = spawn(showexec2, {
                          shell: true,
                          cwd: service.Dir,
                          detached: false,
                          stdio: 'pipe'
                        });
                        log2.stdout.on('data', function (data) {
                          var n = {}
                          n.status = 'error'
                          n.exec = 'info'
                          n.data = data.toString()
                  console.log('n.data 1 '+JSON.stringify(n.data));
                  console.log('n.data 1------ '+JSON.stringify(service.Name));
                          var grepjupyter = new RegExp('microservice-jupyter26');
                          var grepjupyter30 = new RegExp('microservice-jupyter30');
                          if(grepjupyter.test(service.Name)){
                           //var showexec3 = `docker exec ${service.Name} /bin/sh -c "cat /home/jovyan/.local/share/jupyter/runtime/nbserver-46.json"`
                           var showexec3 = `docker exec ${service.Name} /bin/sh -c "jupyter notebook list --json"`
                          }else if(grepjupyter30.test(service.Name)){
                           var showexec3 = `docker exec ${service.Name} /bin/sh -c "jupyter server list --json"`
                          }else{
                           var showexec3 = 'no'
                          }
                          if(showexec3 != 'no'){
                  console.log('n.data 2 '+JSON.stringify(showexec3));
                           log3 = spawn(showexec3, {
                              shell: true,
                              cwd: service.Dir,
                              detached: false,
                              stdio: 'pipe'
                            });
                            log3.stdout.on('data', function (data) {
                              var nn    = {}
                              nn.status  = 'error'
                              nn.exec    = 'info'
                              nn.data    = n.data
                              nn.jupyter = data.toString()
                              console.log(nn)
                  console.log('n.data 3 '+JSON.stringify(n.data));
                              io.emit('container_info_res', nn);
                            });
                          }else{
                            io.emit('container_info_res', n);
                            console.log(n.data)
                          }

                        });
                        log2.stderr.on('data', function (data) {
                          var n = {}
                          n.status = 'error'
                          n.exec = 'sharedefault'
                          n.data = data.toString()
                          console.log(n.data)
                          io.emit('container_info_reserror', n);
                        });
                      }
                  } else{ //  network mode other 
                      var grep2a = new RegExp(/^microservice-/);
                      var grep2b = new RegExp(/^hybrid-/);
                      if(grep2a.test(n.data) || grep2b.test(n.data)){
            console.log('-----------------------------------');
                              var showexec2 = `docker exec ${service.Name} /bin/sh -c "ip -j --brief address show"`
                               log2 = spawn(showexec2, {
                                  shell: true,
                                  cwd: service.Dir,
                                  detached: false,
                                  stdio: 'pipe'
                                });
                                log2.stdout.on('data', function (data) {
                                  var n = {}
                                  n.status = 'error'
                                  n.exec = 'info'
                                  n.data = data.toString()
                                  console.log(n)
                                  io.emit('container_info_res', n);
                                });
                                log2.stderr.on('data', function (data) {
                                  var n = {}
                                  n.status = 'error'
                                  n.exec = 'sharedefault'
                                  n.data = data.toString()
                                  n.command = `docker exec ${service.Name} /bin/sh -c "ifconfig" <br> <br>`
                                  var grepjupyter1 = new RegExp('microservice-jupyter26');
                                  var grepjupyter301 = new RegExp('microservice-jupyter30');
                                  if(grepjupyter1.test(service.Name)){
                                      n.command += `docker exec ${service.Name} /bin/sh -c "jupyter notebook list"`
                                  }else if(grepjupyter301.test(service.Name)){
                                      n.command += `docker exec ${service.Name} /bin/sh -c "jupyter server list"`
                                  }


                                  console.log(n.data)
                                  io.emit('container_info_reserror', n);
                                });
                      }
                  }
                  //var showexec1 = `docker inspect --format '{{json .HostConfig.NetworkMode}}' ${service.Name}`
                  //io.emit('container_info_res', n);
                });
                log.stderr.on('data', function (data) {
                  var n = {}
                  n.status = 'error'
                  n.exec = 'info'
                  n.data = data.toString()
                  io.emit('container_info_reserror', n);
                });
                log.on('close', function (code) {
                  var n = {}
                  n.status = 'close'
                  n.exec = 'info'
                  n.data = code
                  io.emit('container_info_resclose', n);
                });
        } catch (err) {
            console.log(err.stack || String(err));
        }
   });

    socket.on('virtual_net_info', (value) => {
        var service = {}
        var mypath = process.cwd()
            console.log(JSON.stringify(value));
            console.log('-----------------------------------');
        try {
            service.Name    = mpath.basename(value.s.Names)
            service.Dir     = value.c.dir
            var showexec = `docker exec ${service.Name} /bin/sh -c "ip -j --brief address show"`
               log = spawn(showexec, {
                  shell: true,
                  cwd: service.Dir,
                  detached: false,
                  stdio: 'pipe'
                });
                log.stdout.on('data', function (data) {
                  var n = {}
                  n.status = 'data'
                  n.exec = 'info'
                  n.data = data.toString()
                  try {
                    n.data = JSON.parse(n.data)
                  } catch (err) {
                      console.log(err.stack || String(err));
                  }
                  console.log(JSON.stringify(n.data));
                  io.emit('virtual_net_info_res', n);
                });
                log.stderr.on('data', function (data) {
                  var n = {}
                  n.status = 'error'
                  n.exec = 'info'
                  n.data = data.toString()
                  io.emit('virtual_net_info_reserror', n);
                });
                log.on('close', function (code) {
                  var n = {}
                  n.status = 'close'
                  n.exec = 'info'
                  n.data = code
                  io.emit('virtual_net_info_resclose', n);
                });
        } catch (err) {
            console.log(err.stack || String(err));
        }
   });

    socket.on('share_volume', (value) => {
        var service = {}
        var mypath = process.cwd()
            console.log(JSON.stringify(value));
        try {
            service.Options       = value.options
            service.Stackname     = value.stackname
            service.Network       = value.network
            var stackid = value.network.split("-")
            var sharename = stackid[1].slice(0, 7)
            var sharenetwork = stackid[1].slice(0, 10)
            //var sharename = makeid(7)

            var sharerights = 'ro'
            if(service.Options == 'write'){
              sharerights = 'rw'
            }

            var share_dir=`${mypath}/hybrid/connect/${stackid[1]}/volumes/${stackid[1]}_${service.Stackname}`
var stackid_yml = `version: "3.8"
  
services:

  wgshare-${sharename}:
    image: hub.swarmlab.io:5480/venus-fsshare-server:latest
    network_mode: "container:${service.Network}"
    privileged: true
    container_name: wgshare-${sharename}
    restart: unless-stopped
    environment:
     - SHARED_DIRECTORY=/data
     - NFS_EXPORT_0='/data *(${sharerights},fsid=0,async,no_subtree_check,no_auth_nlm,insecure,no_root_squash)'
     - share_name=${sharename}
     - share_stackname=${service.Network}
     - share_volume=${service.Stackname}

    volumes:
      - ${share_dir}:/data
      - /lib/modules:/lib/modules:ro
    cap_add:
      - SYS_ADMIN
      - SYS_MODULE
`

            var stackid_env = `share_container=${service.Network}
            share_name=${sharename}
            share_rights=${sharerights}
            share_dir=${mypath}/hybrid/connect/${stackid[1]}/volumes/${stackid[1]}_${service.Stackname}
            share_stackname=${service.Network}
            share_volume=${service.Stackname}
            `
            var shareinfo = {}
            shareinfo.stackid     = service.Network
            shareinfo.name        = stackid[1]
            shareinfo.volumename  = service.Stackname
            shareinfo.options     = service.Options

  //var showexec = `mkdir -p ${mypath}/files/startnfs.yml ${mypath}/hybrid/connect/${stackid[1]}/volumes; cp ${mypath}/files/startnfs.yml ${mypath}/hybrid/connect/${stackid[1]}/volumes/${stackid[1]}.yml; echo "${stackid_env}" > ${mypath}/hybrid/connect/${stackid[1]}/volumes/${stackid[1]}.env; mkdir ${mypath}/hybrid/connect/${stackid[1]}/volumes/${stackid[1]}_${service.Stackname}; docker-compose  -f ${mypath}/hybrid/connect/${stackid[1]}/volumes/${stackid[1]}.yml --env-file ${mypath}/hybrid/connect/${stackid[1]}/volumes/${stackid[1]}.env --project-directory ${mypath}/hybrid/connect/${stackid[1]}/volumes up --build --force-recreate -d`

          try {
              var showexecyml = `${mypath}/hybrid/connect/${stackid[1]}/volumes/${stackid[1]}_${service.Stackname}.yml`
              fs.writeFileSync(showexecyml, stackid_yml, { mode: 0o755 });
          } catch(err) {
              console.error(err);
          }
  var showexecdown = `docker-compose  -f ${mypath}/hybrid/connect/${stackid[1]}/volumes/${stackid[1]}_${service.Stackname}.yml --env-file ${mypath}/hybrid/connect/${stackid[1]}/volumes/${stackid[1]}_${service.Stackname}.env --project-directory ${mypath}/hybrid/connect/${stackid[1]}/volumes down`
  var showexecstop = `docker-compose  -f ${mypath}/hybrid/connect/${stackid[1]}/volumes/${stackid[1]}_${service.Stackname}.yml --env-file ${mypath}/hybrid/connect/${stackid[1]}/volumes/${stackid[1]}_${service.Stackname}.env --project-directory ${mypath}/hybrid/connect/${stackid[1]}/volumes stop`
  var showexecrm = `docker-compose  -f ${mypath}/hybrid/connect/${stackid[1]}/volumes/${stackid[1]}_${service.Stackname}.yml --env-file ${mypath}/hybrid/connect/${stackid[1]}/volumes/${stackid[1]}_${service.Stackname}.env --project-directory ${mypath}/hybrid/connect/${stackid[1]}/volumes rm`
  var showexec = `mkdir -p ${mypath}/files/startnfs.yml ${mypath}/hybrid/connect/${stackid[1]}/volumes; echo "${stackid_env}" > ${mypath}/hybrid/connect/${stackid[1]}/volumes/${stackid[1]}_${service.Stackname}.env; mkdir ${mypath}/hybrid/connect/${stackid[1]}/volumes/${stackid[1]}_${service.Stackname}; ${showexecdown}; ${showexecstop}; ${showexecrm}; docker-compose  -f ${mypath}/hybrid/connect/${stackid[1]}/volumes/${stackid[1]}_${service.Stackname}.yml --env-file ${mypath}/hybrid/connect/${stackid[1]}/volumes/${stackid[1]}_${service.Stackname}.env --project-directory ${mypath}/hybrid/connect/${stackid[1]}/volumes up --build --force-recreate -d --remove-orphans`
               console.log(showexec)
               log = spawn(showexec, {
                  shell: true,
                  cwd: service.Dir,
                  detached: false,
                  stdio: 'pipe'
                });
                log.stdout.on('data', function (data) {
                  var n = {}
                  n.status = 'data'
                  n.exec = 'sharevolume'
                  n.data = data.toString()
                  console.log(JSON.stringify(n.data));
                  io.emit('share_volume_res', n);
                });
                log.stderr.on('data', function (data) {
                  var n = {}
                  n.status = 'error'
                  n.exec = 'sharevolume'
                  n.data = data.toString()
                  io.emit('share_volume_res_reserror', n);
                });
                log.on('close', function (code) {
                     var showexec1 = `docker exec ${service.Network} /bin/sh -c "ip -4 addr show dev swlab${sharenetwork} | grep inet | tr -s ' ' | cut -d' ' -f3 | head -n 1"`
                     console.log(showexec1)
                     log1 = spawn(showexec1, {
                        shell: true,
                        cwd: service.Dir,
                        detached: false,
                        stdio: 'pipe'
                      });
                      log1.stdout.on('data', function (data) {
                        var n = {}
                        n.status = 'data'
                        n.exec = 'sharevolume'
                        n.network = data.toString()
                        n.network = n.network.replace(/(\r\n|\n|\r|\t)/g,"");
                        n.data = code
                        n.shareinfo = shareinfo
                        console.log(JSON.stringify(n.data));
                        io.emit('share_volume_res_resclose', n);
                      });
                      log1.stderr.on('data', function (data) {
                        var n = {}
                        n.status = 'error'
                        n.exec = 'sharevolume'
                        n.data = data.toString()
                        io.emit('share_volume_res_reserror', n);
                      });

                });

        } catch (err) {
            console.log(err.stack || String(err));
        }
   });

    socket.on('stop_share_volume', (value) => {
        var service = {}
        var mypath = process.cwd()
            console.log(JSON.stringify(value));
        try {
            service.Name       = value

            var showexec = `docker inspect --format '{{json .Config.Labels}}' ${service.Name}`
               console.log(showexec)
               log = spawn(showexec, {
                  shell: true,
                  cwd: service.Dir,
                  detached: false,
                  stdio: 'pipe'
                });
                log.stdout.on('data', function (data) {
                  var n1 = {}
                  n1.status = 'data'
                  n1.exec = 'stop_share_volume'
                  n1.data = data.toString()
                  n1.data = JSON.parse(n1.data)
                  var wdir = n1.data["com.docker.compose.project.working_dir"]
                  var wyml = n1.data["com.docker.compose.project.config_files"]

                    console.log(JSON.stringify(wdir));
                    var showexec1 = `docker-compose  -f ${wyml} --project-directory ${wdir} down --remove-orphans`
                        console.log('rmmount '+JSON.stringify(showexec1));
                     log1 = spawn(showexec1, {
                        shell: true,
                        cwd: service.Dir,
                        detached: false,
                        stdio: 'pipe'
                      });
                      log1.stdout.on('data', function (data) {
                        var n = {}
                        n.status = 'data'
                        n.exec = 'stop_share_volume'
                        n.network = data.toString()
                        n.network = n.network.replace(/(\r\n|\n|\r|\t)/g,"");
                        n.info = n1
                        n.data = code
                        console.log(JSON.stringify(n.data));
                        io.emit('stop_share_volume_res', n);
                      });
                      log1.stderr.on('data', function (data) {
                        var n = {}
                        n.status = 'error'
                        n.exec = 'stop_share_volume'
                        n.data = data.toString()
                            //var showexec2 = `docker inspect --format '{{json .HostConfig.NetworkMode}}' ${service.Name}`
                            //var showexec2 = `docker network disconnect -f $(docker inspect --format '{{json .HostConfig.NetworkMode}}' ${service.Name} | cut -d':' -f2) ${service.Name}; docker stop ${service.Name}; docker container rm ${service.Name}`
                            var showexec2 = `docker stop ${service.Name}; docker container rm ${service.Name}`
                            console.log(JSON.stringify(showexec2));
                             log2 = spawn(showexec2, {
                                shell: true,
                                cwd: service.Dir,
                                detached: false,
                                stdio: 'pipe'
                              });
                              log2.stdout.on('data', function (data) {
                                var n1 = {}
                                n1.status = 'data'
                                n1.exec = 'stop_share_volume'
                                n1.data = data.toString()
                                console.log(JSON.stringify(n1.data));
                                io.emit('stop_share_volume_force_res', n1);
                              });

                        console.log('errorrm '+JSON.stringify(JSON.stringify(n.data)));
                        io.emit('stop_share_volume_res', n);
                      });
                      log1.on('close', function (code) {
                        var n = {}
                        n.status = 'error'
                        n.exec = 'stop_share_volume'
                        n.data = code.toString()
                        io.emit('stop_share_volume_res_resclose', n);
                      });

                });
                log.stderr.on('data', function (data) {
                  var n = {}
                  n.status = 'error'
                  n.exec = 'stop_share_volume'
                  n.data = data.toString()
                  io.emit('stop_share_volume_res_reserror', n);
                });
                log.on('close', function (code) {
                  var n = {}
                  n.status = 'error'
                  n.exec = 'stop_share_volume'
                  n.data = code.toString()
                  io.emit('stop_share_volume_res_resclose1', n);
                });

        } catch (err) {
            console.log(err.stack || String(err));
        }
   });

    socket.on('connect_nfsvolume', (value) => {
        var service = {}
        var mypath = process.cwd()
            console.log(JSON.stringify(value));
        try {
            service.container       = value.share_container
            service.ip              = value.share_ip
            //service.volumename      = value.share_volumename
            service.volumename      = 'volumename'
            var stackid = value.share_container.split("-")
            var sharename = stackid[1].slice(0, 7)

            var stackid_env = `share_container=${service.container}
            share_name=${sharename}
            share_ip=${service.ip}
            share_dir=${mypath}/hybrid/connect/${stackid[1]}/volumes_client/${stackid[1]}_${service.volumename}
            `
            var shareinfo = {}
            shareinfo.stackid     = service.container
            shareinfo.name        = stackid[1]
            shareinfo.volumename  = service.volumename
            shareinfo.share_ip    = service.ip
            shareinfo.share_name  = sharename


            var stackid_yaml = `version: "3.8"
services:
  wgmount-${sharename}:
    image: hub.swarmlab.io:5480/venus-fsshare-client
    container_name: wgmount-${sharename}
    restart: unless-stopped
    network_mode: "container:\${share_container}"
    privileged: true
    container_name: wgmount-\${share_name}
    environment:
     - FSTYPE=nfs4
     - SERVER=\${share_ip}
     - SHARE=/
     - MOUNTPOINT=/mnt/share
     - MOUNT_OPTIONS="vers=4,loud"
    volumes:
      - \${share_dir}:/mnt/share:shared
      - /lib/modules:/lib/modules:ro
    cap_add:
      - SYS_ADMIN
      - SYS_MODULE
`
            shareinfo.share_dir   = `${mypath}/hybrid/connect/${stackid[1]}/volumes_client/${stackid[1]}_${service.volumename}`
          try {
              var showexecicreatedir = `./hybrid/connect/${stackid[1]}/volumes_client`
              if (!fs.existsSync(showexecicreatedir)){
                    fs.mkdirSync(showexecicreatedir, { recursive: true });
                    var showexecyml = `./hybrid/connect/${stackid[1]}/volumes_client/${stackid[1]}_${service.volumename}.yml`
                    //fs.writeFileSync(showexecyml, stackid_yaml, { mode: 0o755 });
                    //console.log('create yaml ' + showexecyml)
                    fs.writeFileSync(showexecyml, stackid_yaml);
              }else{
                    var showexecyml = `./hybrid/connect/${stackid[1]}/volumes_client/${stackid[1]}_${service.volumename}.yml`
                    //console.log('create yaml1 ' + showexecyml)
                    fs.writeFileSync(showexecyml, stackid_yaml);
              }
          } catch(err) {
              console.error(err);
          }
  //var showexec = `mkdir -p ${mypath}/files/startnfs.yml ${mypath}/hybrid/connect/${stackid[1]}/volumes_client; cp ${mypath}/files/startnfsclient.yml ${mypath}/hybrid/connect/${stackid[1]}/volumes_client/${stackid[1]}_${service.volumename}.yml; echo "${stackid_env}" > ${mypath}/hybrid/connect/${stackid[1]}/volumes_client/${stackid[1]}_${service.volumename}.env; mkdir ${mypath}/hybrid/connect/${stackid[1]}/volumes_client/${stackid[1]}_${service.volumename}; docker-compose  -f ${mypath}/hybrid/connect/${stackid[1]}/volumes_client/${stackid[1]}_${service.volumename}.yml --env-file ${mypath}/hybrid/connect/${stackid[1]}/volumes_client/${stackid[1]}_${service.volumename}.env --project-directory ${mypath}/hybrid/connect/${stackid[1]}/volumes_client up --build --force-recreate -d`
  var showexecdown = `docker-compose   -f ${mypath}/hybrid/connect/${stackid[1]}/volumes_client/${stackid[1]}_${service.volumename}.yml --env-file ${mypath}/hybrid/connect/${stackid[1]}/volumes_client/${stackid[1]}_${service.volumename}.env --project-directory ${mypath}/hybrid/connect/${stackid[1]}/volumes_client down`
  var showexecstop = `docker-compose  -f ${mypath}/hybrid/connect/${stackid[1]}/volumes_client/${stackid[1]}_${service.volumename}.yml --env-file ${mypath}/hybrid/connect/${stackid[1]}/volumes_client/${stackid[1]}_${service.volumename}.env --project-directory ${mypath}/hybrid/connect/${stackid[1]}/volumes_client stop`
  var showexecirm = `docker-compose  -f ${mypath}/hybrid/connect/${stackid[1]}/volumes_client/${stackid[1]}_${service.volumename}.yml --env-file ${mypath}/hybrid/connect/${stackid[1]}/volumes_client/${stackid[1]}_${service.volumename}.env --project-directory ${mypath}/hybrid/connect/${stackid[1]}/volumes_client rm`
  var showexecpull = `docker-compose  -f ${mypath}/hybrid/connect/${stackid[1]}/volumes_client/${stackid[1]}_${service.volumename}.yml --env-file ${mypath}/hybrid/connect/${stackid[1]}/volumes_client/${stackid[1]}_${service.volumename}.env --project-directory ${mypath}/hybrid/connect/${stackid[1]}/volumes_client pull`
  var showexec = `mkdir -p ${mypath}/files/startnfs.yml ${mypath}/hybrid/connect/${stackid[1]}/volumes_client; echo "${stackid_env}" > ${mypath}/hybrid/connect/${stackid[1]}/volumes_client/${stackid[1]}_${service.volumename}.env; mkdir ${mypath}/hybrid/connect/${stackid[1]}/volumes_client/${stackid[1]}_${service.volumename}; ${showexecdown}; ${showexecstop}; ${showexecirm}; ${showexecpull};   docker-compose  -f ${mypath}/hybrid/connect/${stackid[1]}/volumes_client/${stackid[1]}_${service.volumename}.yml --env-file ${mypath}/hybrid/connect/${stackid[1]}/volumes_client/${stackid[1]}_${service.volumename}.env --project-directory ${mypath}/hybrid/connect/${stackid[1]}/volumes_client up --build --force-recreate -d --remove-orphans`
               console.log(showexec)
               log = spawn(showexec, {
                  shell: true,
                  cwd: service.Dir,
                  detached: false,
                  stdio: 'pipe'
                });
                log.stdout.on('data', function (data) {
                  var n = {}
                  n.status = 'data'
                  n.exec = 'sharevolume'
                  n.data = data.toString()
                  console.log(JSON.stringify(n.data));
                  io.emit('connect_nfsvolume_res', n);
                });
                log.stderr.on('data', function (data) {
                  var n = {}
                  n.status = 'error'
                  n.exec = 'sharevolume'
                  n.data = data.toString()
                  io.emit('connect_nfsvolume_res_reserror', n);
                });
                log.on('close', function (code) {
                     var showexec1 = `docker inspect --format '{{json .State.Status}}' wgmount-${sharename}`
                     log1 = spawn(showexec1, {
                        shell: true,
                        cwd: service.Dir,
                        detached: false,
                        stdio: 'pipe'
                      });
                      log1.stdout.on('data', function (data) {
                        var n = {}
                        n.status = 'data'
                        n.exec = 'sharevolume'
                        n.network = data.toString()
                        n.data = code
                        n.shareinfo = shareinfo
                        console.log(JSON.stringify(n.data));
                        io.emit('connect_nfsvolume_res_resclose', n);
                      });
                      log1.stderr.on('data', function (data) {
                        var n = {}
                        n.status = 'error'
                        n.exec = 'sharevolume'
                        n.data = data.toString()
                        io.emit('connect_nfsvolume_res_reserror', n);
                      });
                        console.log(JSON.stringify(code));
                });

        } catch (err) {
            console.log(err.stack || String(err));
        }
   });

    socket.on('stop_client_volume_connection', (value) => {
        var service = {}
        var mypath = process.cwd()
            console.log(JSON.stringify(value));
        try {
            service.Name       = value

            var showexec = `docker inspect --format '{{json .Config.Labels}}' ${service.Name}`
               console.log(showexec)
               log = spawn(showexec, {
                  shell: true,
                  cwd: service.Dir,
                  detached: false,
                  stdio: 'pipe'
                });
                log.stdout.on('data', function (data) {
                  var n1 = {}
                  n1.status = 'data'
                  n1.exec = 'stop_client_volume_connection'
                  n1.data = data.toString()
                  n1.data = JSON.parse(n1.data)
                  var wdir = n1.data["com.docker.compose.project.working_dir"]
                  var wyml = n1.data["com.docker.compose.project.config_files"]

                    console.log(JSON.stringify(wdir));
                    var showexec1 = `docker-compose  -f ${wyml} --project-directory ${wdir} down`
                     log1 = spawn(showexec1, {
                        shell: true,
                        cwd: service.Dir,
                        detached: false,
                        stdio: 'pipe'
                      });
                      log1.stdout.on('data', function (data) {
                        var n = {}
                        n.status = 'data'
                        n.exec = 'stop_share_volume'
                        n.network = data.toString()
                        n.network = n.network.replace(/(\r\n|\n|\r|\t)/g,"");
                        n.info = n1
                        n.data = code
                        console.log(JSON.stringify(n.data));
                        io.emit('stop_client_volume_connection_res', n);
                      });
                      log1.stderr.on('data', function (data) {
                        var n = {}
                        n.status = 'error'
                        n.exec = 'stop_share_volume'
                        n.data = data.toString()
                        io.emit('stop_client_volume_connection_res', n);
                      });
                      log1.on('close', function (code) {
                        var n = {}
                        n.status = 'error'
                        n.exec = 'stop_share_volume'
                        n.data = code.toString()
                        io.emit('stop_client_volume_connection_res_resclose', n);
                      });

                });
                log.stderr.on('data', function (data) {
                  var n = {}
                  n.status = 'error'
                  n.exec = 'stop_share_volume'
                  n.data = data.toString()
                  io.emit('stop_client_volume_connection_res_reserror', n);
                });
                log.on('close', function (code) {
                  var n = {}
                  n.status = 'error'
                  n.exec = 'stop_share_volume'
                  n.data = code.toString()
                  io.emit('stop_client_volume_connection_res_resclose1', n);
                });

        } catch (err) {
            console.log(err.stack || String(err));
        }
   });

    socket.on('mount_nfsvolume', (value) => {
        var service = {}
        var mypath = process.cwd()
            console.log(JSON.stringify(value));
        try {
            service.container       = value
                     var showexec1 = `docker exec ${service.container} /bin/sh -c "/bin/sh /usr/local/bin/startfs.sh"`
                     log1 = spawn(showexec1, {
                        shell: true,
                        cwd: service.Dir,
                        detached: false,
                        stdio: 'pipe'
                      });
                      log1.stdout.on('data', function (data) {
                        var n = {}
                        n.status = 'data'
                        n.exec = 'mountvolume'
                        n.data = data.toString()
                        console.log(JSON.stringify(n.data));
                        io.emit('mount_nfsvolume_res_resclose', n);
                      });
                      log1.stderr.on('data', function (data) {
                        var n = {}
                        n.status = 'error'
                        n.exec = 'mountvolume'
                        n.data = data.toString()
                        console.log(JSON.stringify(n.data));
                        io.emit('mount_nfsvolume_res_reserror', n);
                      });
        } catch (err) {
            console.log(err.stack || String(err));
        }
   });

    socket.on('umount_nfsvolume', (value) => {
        var service = {}
        var mypath = process.cwd()
            console.log(JSON.stringify(value));
        try {
            service.container       = value
                     var showexec1 = `docker exec ${service.container} /bin/sh -c "/bin/sh /usr/local/bin/stopfs.sh"`
                     log1 = spawn(showexec1, {
                        shell: true,
                        cwd: service.Dir,
                        detached: false,
                        stdio: 'pipe'
                      });
                      log1.stdout.on('data', function (data) {
                        var n = {}
                        n.status = 'data'
                        n.exec = 'mountvolume'
                        n.data = data.toString()
                        console.log(JSON.stringify(n.data));
                        io.emit('mount_nfsvolume_res_resclose', n);
                      });
                      log1.stderr.on('data', function (data) {
                        var n = {}
                        n.status = 'error'
                        n.exec = 'mountvolume'
                        n.data = data.toString()
                        console.log(JSON.stringify(n.data));
                        io.emit('mount_nfsvolume_res_reserror', n);
                      });
                      log1.on('close', function (code) {
                        var n = {}
                        n.status = 'error'
                        n.exec = 'mountvolume'
                        n.data = code.toString()
                        console.log(JSON.stringify(n.data));
                        io.emit('mount_nfsvolume_res_resclose', n);
                      });
        } catch (err) {
            console.log(err.stack || String(err));
        }
   });

    socket.on('info_nfsvolume', (value) => {
        var service = {}
        var mypath = process.cwd()
            console.log(JSON.stringify(value));
        try {
            service.container       = value

              var showmount = `docker exec ${service.container} /bin/sh -c "/usr/local/bin/check_mount"`
              exec(showmount, (err, stdout, stderr) => {
                 if (err) {
                    console.error(`exec error: ${err}`);
                    return;
                  }
                 if (stdout) {
                        var string = stdout.toString()
                        string = string.replace(/(\r\n|\n|\r|\t)/g,"");
                        if(string == 'yes'){
                          var found = 'yes';
                          // mount yes find directory
                           var showexec1 = `docker inspect --format '{{json .Mounts}}' ${service.container}`
                           log1 = spawn(showexec1, {
                              shell: true,
                              cwd: service.Dir,
                              detached: false,
                              stdio: 'pipe'
                            });
                            log1.stdout.on('data', function (data) {
                              var n = {}
                              n.status = 'data'
                              n.mount = found
                              n.exec = 'infomountvolume'
                              n.data = data.toString()
                              n.data = JSON.parse(n.data)
                              console.log(JSON.stringify(n.data));
                              io.emit('info_nfsvolume_res_resclose', n);
                            });
                            log1.stderr.on('data', function (data) {
                              var n = {}
                              n.status = 'error'
                              n.exec = 'infomountvolume'
                              n.data = data.toString()
                              console.log(JSON.stringify(n.data));
                              io.emit('info_nfsvolume_res_reserror', n);
                            });
                            log1.on('close', function (code) {
                              var n = {}
                              n.status = 'error'
                              n.exec = 'infomountvolume'
                              n.data = code.toString()
                              console.log(JSON.stringify(n.data));
                              io.emit('info_nfsvolume_res_resclose', n);
                            });
                             
                     }else{
                          var found = 'no';
                              var n = {}
                              n.status = 'error'
                              n.exec = 'infomountvolume'
                              n.mount = found
                              io.emit('info_nfsvolume_res_resclose', n);
                     }
                 }
             });
        } catch (err) {
            console.log(err.stack || String(err));
        }
   });

    socket.on('info_nfsservervolume', (value) => {
        var service = {}
        var mypath = process.cwd()
            console.log(JSON.stringify(value));
        try {
            service.container       = value
                     var showexec1 = `docker inspect --format '{{json .Mounts}}' ${service.container}`
                     log1 = spawn(showexec1, {
                        shell: true,
                        cwd: service.Dir,
                        detached: false,
                        stdio: 'pipe'
                      });
                      log1.stdout.on('data', function (data) {
                        var n = {}
                        n.status = 'data'
                        n.exec = 'infomountvolume'
                        n.data = data.toString()
                        n.data = JSON.parse(n.data)
                        console.log(JSON.stringify(n.data));
                        io.emit('info_nfsservervolume_res_resclose', n);
                      });
                      log1.stderr.on('data', function (data) {
                        var n = {}
                        n.status = 'error'
                        n.exec = 'infomountvolume'
                        n.data = data.toString()
                        console.log(JSON.stringify(n.data));
                        io.emit('info_nfsservervolume_res_reserror', n);
                      });
                      log1.on('close', function (code) {
                        var n = {}
                        n.status = 'error'
                        n.exec = 'infomountvolume'
                        n.data = code.toString()
                        console.log(JSON.stringify(n.data));
                        io.emit('info_nfsservervolume_res_resclose', n);
                      });
        } catch (err) {
            console.log(err.stack || String(err));
        }
   });


});

server.listen(serverPort, function() {
  console.log('server up and running at %s port', serverPort);
});
