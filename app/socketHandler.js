module.exports = function(io, streams,app) {
  var clients = {};
  var reflected = [];
  var User = require('./model/user');
  var Friend = require('./model/friend');
  var Connections = require('./model/connections');
  var Profile = require('./model/profile');
  var Calls = require('./model/calls');

  io.on('connection', function(client) {
    console.log('\n-- ' + client.id + ' joined --');
    var text = "";
    var number= "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));

/*    while(clients.hasOwnProperty(text)) {
     var text = "";
     var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
     for( var i=0; i < 5; i++ )
     text += possible.charAt(Math.floor(Math.random() * possible.length));
     //clients[text] = client.id;
     }
     //clients[text] = client.id;*/
     if(client!=null){
      client.emit('connect');
    }


    client.on("packet", function(type, data) {
      console.log("received ping");
    });

    client.on("packetCreate", function(type, data) {
      console.log("sending pong");
    });



 /*   client.on('readyToStream', function(options) {
      console.log('\n-- ' + client.id + ' is ready to stream --');
      console.log("readyToStream function content { " + JSON.stringify(options) + " } ")
      streams.addStream(client.id, options.name); 

    });*/
    
  /*  client.on('update', function(options) {
            console.log("Update function content { " + JSON.stringify(options) + " } ");

      streams.update(client.id, options.name);
    });*/

    client.on('poll', function(details){
      var currentDate = new Date();

      console.log("\nPoll from " + details.myId + " at " + currentDate);
    });

    client.on('resetId', function(options) {
      console.log("\nReset id : { " + JSON.stringify(options) + " } ");

      number=options.myId;
      var newConnection = {
        phone_number: options.myId,
        socket_id: client.id,
        updated_at: Date(),
        status: 1
      };
      var query = {'phone_number': options.myId};
      Connections.findOneAndUpdate(query, newConnection, {upsert:true}, function(err, doc){
        if (err)
        {
          console.log(err);
        }
      });

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


      Connections.findOne({ socket_id: client.id }, function(err, connection) {
        if (!connection){
          console.log("Error" + connection + err +client.id);

        }else{
          var socket_caller = connection.getPhoneNumber();
          console.log("Call from " + socket_caller + client.id);

          var newCall = Calls({
            caller: socket_caller,
            callee: details.to,
            status: 1,
            init_time: Date()
          });
          newCall.save(function(err) {
            if (err){
            //res.send({status: -1});
            console.log(err);
            }
          });
        }
      });


      User.findOne({id: reflected[text]}, function(err, user) {
        if(user){
          var otherClient = io.sockets.connected[clients[details.to]];
          details.from = reflected[text];
          console.log("\n Start Client" + JSON.stringify(details));
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
   //   streams.removeStream(client.id);
   if(clients[number]==client.id)
   {
    delete clients[number];
  }
  console.log(clients);

  var status = {

    status: 0,
    socket_id: null
  };

  var query = {'socket_id': client.id};
       // req.newData.status = 1;
       Connections.findOneAndUpdate(query, status, {upsert:false}, function(err, doc){
        if (err)
        {
          console.log(err);
        }
      });


     }

     client.on('disconnect', leave);
     client.on('leave', leave);
   });

var getStatus = function(req, res) {
  var currentDate = new Date();

  console.log('\n'+currentDate+'\n');
  console.log(clients);
  Connections.find( { $where : "this.status == 1 " }, { _id: 0, qty: 0 },'phone_number', function(err, docs){
    console.log(docs);
  });

  var clientid = clients[req.params.id];
    //  console.log("lien minh get user statys"+clientid+ " "+req.params.id);
     /* if(io.sockets.connected[clientid]!=undefined){
        res.send({status: 1});
      }else{
        res.send({status: -1});
      }
      */    
      Connections.find( {'phone_number': req.params.id, 'status': 1 }, function(err, state) {


        if ((JSON.stringify(state)=="[]")||(state==null)){
          res.send({status: -1});
        }else{
          res.send({status: 1});
              // Friend.findOne({ username: req.body.username }, function(err, friend) {
              //   if (!friend){
              //     res.send({status: 1,id: user.id});
              //   }else{
              //     res.send({status: 1,id: user.id,id: friend.friend_id});
              //   }
              // });
              //??? return id to user
              //return list of friends id and status online offline
            }
          });





    };

    app.get('/status/:id', getStatus);

  };

