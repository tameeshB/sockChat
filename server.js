var express = require('express');
var app = express();
var bodyP = require('body-parser');
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var mongojs = require('mongojs');
var ObjectId = mongojs.ObjectId;

var db = mongojs('sockchat', ['messages']);


app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(bodyP.json());
app.use(bodyP.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'public')));


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
