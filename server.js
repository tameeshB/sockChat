var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

server.listen(process.env.PORT || 3000);
var users = [];
var connections= [];
console.log('Server running');
app.get('/',function(req,res){
	res.sendFile(__dirname+'/index.html');
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
