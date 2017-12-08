var express = require('express');
var app = express();
var bodyP = require('body-parser');
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');
// var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var mongojs = require('mongojs');
var ObjectId = mongojs.ObjectId;

var db = mongojs('sockchat', ['messages']);
var users = require('./routes/users');

mongoose.createConnection('mongodb://localhost/sockchat');
var db_ = mongoose.connection;

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(bodyP.json());
app.use(bodyP.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'public')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));


// Passport init
app.use(passport.initialize());
app.use(passport.session());

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

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

server.listen(process.env.PORT || 3000);


var users = [];
var connections= [];
console.log('Server running');
app.get('/',function(req,res){
	// res.sendFile(__dirname+'/index.html');
	db.messages.find(function(err, docs){
		res.render('index',{messages:docs});
	});
});

//user
app.get('/login',function(req,res){
	res.render('login');
	
});
app.get('/register',function(req,res){
	var defaults = {
		name : 'Name',
		uname : 'Username',
		email : 'me@example.com'
	};
	res.render('register',{data:defaults,errors:null});
	
});
app.post('/api/register',function(req,res){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.uname;
	var password = req.body.password;
	var password_ = req.body.password_;
	// console.log(name+email+username+password);
	console.log(req.body);
	//validation
	req.checkBody('name','Name is required.').notEmpty();
	req.checkBody('email','Email is required.').notEmpty();
	req.checkBody('email','Email is invalid.').isEmail();
	req.checkBody('uname','Username is required.').notEmpty();
	req.checkBody('password','Password is required.').notEmpty();
	req.checkBody('password_','Password Confirmation does not equal password.').equals(req.body.password);
	var errors = req.validationErrors();

	if(errors){
		console.log(errors);
		var userDat = {
			name : name,
			uname : username,
			email : email
		};
		res.render('register',{data:userDat,errors:errors});
	} else
		res.redirect('/');
	
});

// app.use('/users', users);


io.sockets.on('connection',function(socket){
	connections.push(socket);
	console.log('connected %s',connections.length);

	//disconnect
	socket.on('disconnect',function(data){
		// if(!socket.username)
		// 	return;
		users.splice(users.indexOf(socket.username),1);
		connections.splice(connections.indexOf(socket), 1);
		console.log('disconnected %s', connections.length);
	});
	//send message
	socket.on('send message',function(data){
		console.log(data);
		var msgObj = {
			user : socket.username,
			message: data,
			ts: Date()
		};
		db.messages.insert(msgObj,function(err,result){
			if(err)
				console.log(err);
		});
		io.sockets.emit('new message',{msg:data,user:socket.username});
	});

	//new user
	socket.on('new user',function (data, callback) {
		callback(true);
		socket.username = data;
		users.push(socket.username);
		updateactive();
	});

	function updateactive(){
		io.sockets.emit('get users',users);
	}
	
});
