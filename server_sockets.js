require('./globals'); 
var bcrypt = require('bcrypt-nodejs');
module.exports = function(app, io, db) {
	var users = [];//make this into a multidimentional array
	var connections= [];
	var rooms = {};
	//sockets
	io.sockets.on('connection',function(socket){
		connections.push(socket);
		console.log('connected %s',connections.length);

		//disconnect
		socket.on('disconnect',function(data){
			// if(!socket.username)
			// 	return;
			users.splice(users.indexOf(socket.username),1);//update this
			connections.splice(connections.indexOf(socket), 1);
			console.log('disconnected %s', connections.length);
		});


		//User connected
		socket.on('connected', function (data, callback){
			callback(true);
			//verify user
			if(userGL.hash == data.hash){
				socket.username = data.username;
				users.push(socket.username);
				updateactive();
			}else{
				io.sockets.emit('400');
			}
		});



		//new room or join room
		//data: {roomname, roomid, password}
		socket.on('room add', function (data, callback) {
			var newRoomId = -1;
			var newRoom = {};
			callback(true);
			switch(roomAuth(data.roomname, data.password)){
				case 1:
					db.rooms.insert({
						'roomname': data.roomname,
						'password': genHash(data.password),
						'users': [socket.username]
					}, function (err, inserted) {
						newRoomId = inserted._id;
						db.users.update(
							{ username: socket.username },
							{$push: 
								{ rooms: newRoomId }
							}
						)
						io.sockets.emit('post room add', { status: 200, message: 'Created new room!', newId: newRoomId, room:inserted });
					});
					//update all objects
					
				break;
				case 2:
				var newRoomData;
				if (userGL.rooms.hasOwnProperty(data.roomid)){
					//nothing
				}else{
					//can add user to group
					db.rooms.find({ roomname: data.roomname }, function (err, docs) {
						newRoomId = docs._id;
						newRoom = docs;
					})
					db.users.update(
						{ username: socket.username },
						{
							$push:
								{ rooms: newRoomId }
						}
					)
					db.rooms.update(
						{ roomname: data.roomname},
						{
							$push:
								{ users: socket.username }
						}
					)
				}	
				io.sockets.emit('post room add', { status: 200, message: 'Joined room!', room: newRoom});
					
				break;
				case 3:
					io.sockets.emit('post room add', { status: 401, message: 'Room already exists, wrong authorization creds.' });
				break;

				case -1:
					io.sockets.emit('post room add', { status: 500, message: 'Some Internal error occured.' });
				break;
				default:
					io.sockets.emit('post room add', { status: 500, message: 'Some Internal error occured.' });
				break;
			}
			roomsGL_id.push(newRoomId);
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

		

		function updateactive(){
			io.sockets.emit('post connect',rooms);
		}
		
		function roomAuth(name, pass){
			var pswdhash = genHash(pass);
			db.rooms.findOne({ 'roomname': name}, function (err, doc) {
				if(err){
					console.log(err);
					return -1;//error
				}
				if(!doc)
					return 1;// good, can create
				if (doc.password == pswdhash){
					return 2;//good, authorised
				}else{
					return 3;//bad, unauthorised
				}
			});
		}

		function genHash(pass){
			return bcrypt.hashSync(pass, bcrypt.genSaltSync(8), null);
		}
	});

}
