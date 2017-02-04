module.exports = function(io, streams,app) {
  var clients = {};
  var reflected = [];
  var User = require('./model/user');
  var Friend = require('./model/friend');
  io.on('connection', function(client) {
    console.log('\n-- ' + client.id + ' joined --');
    var text = "";
    var number= "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for( var i=0; i < 5; i++ )
          text += possible.charAt(Math.floor(Math.random() * possible.length));

    while(clients.hasOwnProperty(text)) {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for( var i=0; i < 5; i++ )
          text += possible.charAt(Math.floor(Math.random() * possible.length));
      //clients[text] = client.id;
    } 
        //clients[text] = client.id;
      client.emit('connect');

  
      
 /*   client.on('readyToStream', function(options) {
      console.log('\n-- ' + client.id + ' is ready to stream --');
      console.log("readyToStream function content { " + JSON.stringify(options) + " } ")
      streams.addStream(client.id, options.name); 

    });*/
    
    client.on('update', function(options) {
            console.log("Update function content { " + JSON.stringify(options) + " } ");

      streams.update(client.id, options.name);
    });

    client.on('poll', function(details){
        var currentDate = new Date();

      console.log("\nPoll from " + details.myId + " at " + currentDate);
    });

    client.on('resetId', function(options) {
                  console.log("\nReset id : { " + JSON.stringify(options) + " } ");


      number=options.myId;
      clients[options.myId] = client.id;
      client.emit('id', options.myId);

      reflected[text] = options.myId;
    });

    client.on('message', function (details) {
      console.log("\nmessage function "+ details.to);
      console.log("Message function content { " + JSON.stringify(details) + " } ")
      var otherClient = io.sockets.connected[clients[details.to]];
      if (!otherClient) {
        return;
      }

      delete details.to;
      details.from = reflected[text];

      otherClient.emit('message', details);
    });

    client.on('startclient', function (details) {
      User.findOne({id: reflected[text]}, function(err, user) {
        if(user){
          var otherClient = io.sockets.connected[clients[details.to]];
          details.from = reflected[text];
          console.log("\n" + JSON.stringify(details));
          details.name = user.name;
          otherClient.emit('receiveCall', details);
        }else{
          var otherClient = io.sockets.connected[clients[details.to]];
          details.from = reflected[text];
          otherClient.emit('receiveCall', details);
        }

      });
        
    });

    client.on('ejectcall', function (details) {
                console.log("\nEjectcall by : " +JSON.stringify(details));

      var otherClient = io.sockets.connected[clients[details.callerId]];

      otherClient.emit("ejectcall");
    });

    client.on('removecall', function (details) {
                      console.log("\nRemovecall by : " +JSON.stringify(details));

      var otherClient = io.sockets.connected[clients[details.callerId]];
      otherClient.emit("removecall");
    });

    // client.on('removevideo', function (details) {
    //   var otherClient = io.sockets.connected[clients[details.other]];
    //   otherClient.emit("removevideo");
       
    // });

    client.on('acceptcall', function (details) {
                      console.log("\nAcceptcall by : " +JSON.stringify(details));


      var otherClient = io.sockets.connected[clients[details.callerId]];
      otherClient.emit("acceptcall",details);
       
    });

    client.on('chat', function(options) {
                      console.log("\nChat by : " +JSON.stringify(details));

      var otherClient = io.sockets.connected[clients[options.to]];
      otherClient.emit('chat', options);
    });


    function leave() {
      console.log('\n-- ' + client.id + ' left --');
      streams.removeStream(client.id);
      delete clients[number];
    console.log(clients);

    }

    client.on('disconnect', leave);
    client.on('leave', leave);
  });

  var getStatus = function(req, res) {
                  console.log('\n');

      var clientid = clients[req.params.id];
    //  console.log("lien minh get user statys"+clientid+ " "+req.params.id);
      if(io.sockets.connected[clientid]!=undefined){
        res.send({status: 1});
      }else{
        res.send({status: -1});
      }
              console.log(clients);

    };

  app.get('/status/:id', getStatus);

};

