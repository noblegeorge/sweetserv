/**
 * Module dependencies.
 */
var fs = require('fs');
var http = require('http');
var https = require('https');

var express = require('express')
,	path = require('path')
,	streams = require('./app/streams.js')();

var favicon = require('serve-favicon')
,	logger = require('morgan')
,	methodOverride = require('method-override')
,	bodyParser = require('body-parser')
,	errorHandler = require('errorhandler');

  var Connections = require('./app/model/connections');



var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};

var app = express();

//moongo db connection
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test0');

var query= {'status': 1};
var update = {'status': 0};
Connections.update(query,update,{upsert: false , multi: true}, function(err, doc){
          if (err)
          {
            console.log(err);
          }
        });

//Connections.collection.drop();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

// routing
require('./app/routes.js')(app, streams);

var httpServer = http.createServer(app).listen(app.get('port'));
var httpsServer = https.createServer(credentials, app).listen(3005);

/*httpServer.listen(8080);
httpsServer.listen(8443);

var server = app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
*/
var io = require('socket.io').listen(httpsServer);

io.listen(httpServer,{'pingInterval': 30000, 'pingTimeout': 80000});



/**
 * Socket.io event handling
 */
require('./app/socketHandler.js')(io, streams,app);