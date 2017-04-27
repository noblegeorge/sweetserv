module.exports = function(app, streams) {
  var User = require('./model/user');
  var Friend = require('./model/friend');
  var Connections = require('./model/connections');
  var Profile = require('./model/profile.js');
  var twitterAPI = require('node-twitter-api');

  var twitter = new twitterAPI({
    consumerKey: 'YX7RFAfUTuXtFxR2cZCjF9OZK',
    consumerSecret: '9M98QFCamAmp5WavPQ3re8Bva8YYR1JI6TrytbNzWscqF0VRb6'
  });

  console.log('cOME TO ROUTES ');
  // GET home 
  var index = function(req, res) {
    res.render('index', {});
  };

  // POST check login info
  var digitsOAuth = function(req,res) {


    var uph_no = req.body.number,
    utoken = req.body.token,
    usecret = req.body.secret,
    ufirst_name = req.body.first_name,
    usecond_name = req.body.second_name,
    uimei = req.body.imei,
    udevice = req.body.device;
    var additionalClaims = {
      token: utoken,
      secret: usecret
    };
    twitter.verifyCredentials(utoken,usecret,{}, function(error, data, response) {
      if (error) {
        console.log(error);
        res.send({status: -1});
      } else {
        console.log("User auth from: " + uph_no);
        var newProfile = {
          phone_number: uph_no,
          first_name: ufirst_name,
          second_name: usecond_name,
          token: utoken,
          imei: uimei,
          device: udevice,
          updated_at: Date(),
        };


        var query = {'phone_number': uph_no};
       // req.newData.status = 1;
       Profile.findOneAndUpdate(query, newProfile, {upsert:true}, function(err, doc){
        if (err)
        {
          console.log(err);
          res.send({status: -2});

        }
        else
        {
          res.send({status: 1});
        }
      });







     }
   });
  };

  var login = function(req, res) {
    console.log("come here");
    User.findOne({ username: req.body.username }, function(err, user) {
      if (!user){
        res.send({status: -1});
      }else{
            // test a matching password
            if(user.comparePassword(req.body.password)==1)
            {
              res.send({status: 1,id: user.id, name: user.username});
              // Friend.findOne({ username: req.body.username }, function(err, friend) {
              //   if (!friend){
              //     res.send({status: 1,id: user.id});
              //   }else{
              //     res.send({status: 1,id: user.id,id: friend.friend_id});
              //   }
              // });
              //??? return id to user
              //return list of friends id and status online offline
            }else{
              res.send({status: -1});
            }
          }
        });
  };

  //GET list of users
  var listUser = function(req, res) {
    var id = req.params.id;
    Friend.find({ 'username': id }, function (err, friends) {
      var ids = friends.map(function(friend) { return friend.friend_id; });
      User.find({id: {$ne: ids}}, function(err, users) {
        if (err){
          res.send({status: -1});
        }else{
          res.json(users);
        }
      });
    });

    // User.find(function(err, users) {
    //   if (err){
    //     res.send({status: -1});
    //   }else{
    //     res.json(users);
    //   }
    // });
  };

  var listFriend = function(req, res) {
    Friend.find({ 'username': req.body.username }, function (err, friends) {
      if (err){
        res.send({status: -1});
      }else{
        res.json(friends);
      }
    });
  };

  var getPersonName = function(req, res) {
    User.findOne({ id: req.body.username }, function(err, user) {
      if (err){
        res.send({status: -1});
      }else{
        res.json(user);
      }
    });
  };

  //POST add friend
  var addFriend = function(req, res) {
    var username = req.body.username;
    var friend_id = req.body.friend_id;
    var newFriend = Friend({
      username: username,
      friend_id: friend_id
    });
    newFriend.save(function(err) {
      if (err){
        res.send(err);
      }else{
        var newFriend_reverse = Friend({
          username: friend_id,
          friend_id: username
        });
        newFriend_reverse.save(function(err) {
          if (err){
            res.send(err);
          }else{
            res.send({status: 1});
          }
        });
      }
    });

  };

  // POST register user account
  var register = function(req, res) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 5; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    //remember to check trung id trong db
    var newUser = User({
      name: req.body.name,
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      phone: req.body.phone,
      id: req.body.name
    });
    newUser.save(function(err) {
      if (err){
        res.send({status: -1});
        console.log(err);

      }else{
        res.send({status: 1,id: text});
      }

    });
  };


  // GET streams as JSON
  var displayStreams = function(req, res) {
    var streamList = streams.getStreams();
    // JSON exploit to clone streamList.public
    var data = (JSON.parse(JSON.stringify(streamList))); 
    res.status(200).json(data);
  };

  app.get('/streams.json', displayStreams);
  app.get('/users/:id', listUser);
  app.post('/friend_name', getPersonName);
  app.post('/friends', listFriend);
  app.post('/login', login);
  app.post('/oAuth', digitsOAuth);
  app.post('/addFriend', addFriend);
  app.post('/register', register);
  app.get('/', index);
  app.get('/:id', index);
}