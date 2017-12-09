/**
 * Loading all dependencies
 */
var express = require('express');
var app = express();
var bodyP = require('body-parser');
var path = require('path');
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var mongojs = require('mongojs');
var ObjectId = mongojs.ObjectId;
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var flash    = require('connect-flash');
var configDB = require('./config/database.js');
var morgan       = require('morgan');
var session      = require('express-session');

var db = mongojs('sockchat', ['messages']);
var port = process.env.PORT || 3000;
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(bodyP.json());
app.use(bodyP.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'public')));
app.use(morgan('dev'));

app.use(session({ secret: 'tameeshb' })); // session secret


// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//routing
require('./routes/index.js')(app, passport, db);
require('./routes/users.js')(app, passport, db);

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// app.listen(port);

server.listen(process.env.PORT || 3000);

console.log('The magic happens on port ' + port);

//socket programming using socket.io
require('./sockets.js')(app, io, db);
