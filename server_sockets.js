module.exports = function(app, io, db) {
	var users = [];
	var connections= [];

	//sockets
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

}