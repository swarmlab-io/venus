function getArgs () {
    const args = {};
    process.argv
        .slice(2, process.argv.length)
        .forEach( arg => {
        // long arg
        if (arg.slice(0,2) === '--') {
            const longArg = arg.split('=');
            const longArgFlag = longArg[0].slice(2,longArg[0].length);
            const longArgValue = longArg.length > 1 ? longArg[1] : true;
            args[longArgFlag] = longArgValue;
        }
        // flags
        else if (arg[0] === '-') {
            const flags = arg.slice(1,arg.length).split('');
            flags.forEach(flag => {
            args[flag] = true;
            });
        }
    });
    return args;
}
const args = getArgs();


const { spawn, exec, execSync } = require('child_process')
//console.log(args)

// #!/bin/bash
//logs=$("/usr/local/bin/wg-json")
//echo $logs
//node ./venus-stats.js --insert=yes --port=30001 --ip='127.0.0.1' --user=swarmlab --password=swarmlab --db=venus --coll=logs --json='{ "name" : "Hello", "log" : "World" }'

if (args["insert"] == 'yes'){
  try{
      var dbuser       = args["user"]
      var dbpassword   = args["password"]
      var dbName       = args["db"]
      var collName     = args["coll"]
      var dbNamePort   = args["port"]
      var dbNameIP     = args["ip"]
      var dbdate       = args["json"]
      var stackid       = args["stackid"]
      var stackinterface  = args["stackinterface"]
      var stackpeer       = args["stackpeer"]
      var devname       = args["devname"]

      var showexec ='/usr/local/bin/wg-json';
      try {
           const stdout = execSync(showexec, {
                env: {
                    NODE_ENV: "production",
                },
           });
            var datajsontmp = stdout.toString()
            datajsontmp = datajsontmp.replace(/(\r\n|\n|\r|\t)/g,"");
            datajsontmp = JSON.parse(datajsontmp)

            var datajson = [] 
            for (let key in datajsontmp) { 
               if (datajsontmp.hasOwnProperty(key) && key == devname) {   
                  datajson.push(datajsontmp[key])    
               }    
            } 

                console.error('exec ' + JSON.stringify(datajson));
       } catch (error) {
            var datajson = error.toString()
                console.error('error ' + JSON.stringify(datajson));
       }

     var RESlog = new Object();
     RESlog.date = dbdate
     RESlog.log = datajson
     RESlog.stackid = stackid
     RESlog.stackinterface = stackinterface
     RESlog.stackpeer = stackpeer
     RESlog.devname = devname


      var MongoClient = require('mongodb').MongoClient;
      var mongourl = `mongodb://${dbuser}:${dbpassword}@${dbNameIP}:${dbNamePort}`;
      const OPTS = {
        useNewUrlParser: true,
        useUnifiedTopology: true
      };

      MongoClient.connect(mongourl, OPTS, function(err, db) {
          if(err){
              console.log(err);
          } else {
            var dbo = db.db(dbName);
            dbo.listCollections({name: collName})
              .next(function(err, collinfo) {
                if (collinfo) {
                }else{
                  dbo.createCollection(collName, {
                    capped: true,
                    size: 100000
                  });
                }
            });
            dbo.collection(collName).insertOne(RESlog, function(err, res) {
              if(err){
                  console.log(err);
              } else {
                console.log("ok");
                db.close();
              }
            });
          }
      });
   } catch (err) {
      console.error(err);
   }
}

