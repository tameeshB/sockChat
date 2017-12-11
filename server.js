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
var favicon = require('serve-favicon');
var ObjectId = mongojs.ObjectId;
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var flash    = require('connect-flash');
var configDB = require('./config/database.js');
var morgan       = require('morgan');
var session      = require('express-session');
var mailer = require('express-mailer');


app.use(morgan('dev'));
app.use(cookieParser());

app.use(bodyP.json());
app.use(bodyP.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

//db connections
var db = mongojs('sockchat', ['messages']);
mongoose.connect(configDB.url, {
  useMongoClient: true,
}); 

app.use(session({ 
  secret: 'ilovescotchscotchyscotchscotch',
  resave: true,
  saveUninitialized: true
 })); 
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

require('./config/passport')(passport, app);

var port = process.env.PORT || 3000;

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// app.use(session({ secret: 'tameeshb' })); // session secret


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

mailer.extend(app, {
  from: 'gmail@gmail.com',
  host: 'smtp.gmail.com',  
  secureConnection: true, 
  port: 465, 
  transportMethod: 'SMTP',
  auth: {
    user: 'gmail@gmail.com',
    pass: 'gmailpassword'
  }
});

//routing
require('./routes/index.js')(app, passport, db);
require('./routes/users.js')(app, passport, db);


 // persistent login sessions
 // use connect-flash for flash messages stored in session

// app.listen(port);

//404
app.use(function (req, res, next) {
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});


server.listen(process.env.PORT || 3000);

console.log('The magic happens on port ' + port);

//socket programming using socket.io
require('./sockets.js')(app, io, db);
