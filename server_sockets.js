require('./globals');
var async = require('async');
var wait = require('wait.for');
var bcrypt = require('bcrypt-nodejs');
module.exports = function (app, io, db) {
	var connections = [];//for socket.io's buisness
	var online = []; //usernamep per room
	var onlineUsers = [];//linear list of all users, just for the record
	//sockets
	var socketonline = [];//socketid per room online

	io.sockets.on('connection', function (socket) {
		connections.push(socket);
		console.log('connected %s', connections.length);
		roomsGL.forEach(function (r) {
			// console.log("spltest:",r);
			if (socketonline[r.roomname])
				socketonline[r.roomname].push(socket.id);
			else
				socketonline[r.roomname] = [socket.id];
			if (online[r.roomname])
				online[r.roomname].push(userGL.username);
			else
				online[r.roomname] = [userGL.username];
		});
		// console.log("conn:socketonline",socketonline);
		//disconnect
		socket.on('disconnect', function (data) {
			// if(!socket.username)
			// 	return;
			//remove me from online users object @todo
			connections.splice(connections.indexOf(socket), 1);
			onlineUsers.splice(onlineUsers.indexOf(userGL.username), 1);
			console.log('disconnected %s', connections.length);
			roomsGL.forEach(function (r) {
				socketonline[r.roomname].splice(socketonline[r.roomname].indexOf(socket.id), 1);
				online[r.roomname].splice(online[r.roomname].indexOf(userGL.username), 1);
			});
			
			console.log("disc:socketonline", socketonline);
		});

		//required sockets for: user requesting latest messages for a thread, requesting older messages


		//User connected
		//data prototype: data:{username: , hash: } 
		socket.on('connected', function (data) {
			console.log('connected');
			// console.log('connected:',data);
			// callback(true);
			var myRooms = userGL.rooms.map(function (a) {
				return a.roomname
			});
			//lets remodel all room objects with name + id, that'll make stuff a lot non-SQL-y
			//#makethemostoutofmongo
			//verify user
			if (userGL.hash == data.hash) {
				console.log('auth!');
				socket.username = data.username;
				console.log('\x1b[36m%s\x1b[0m', userGL);
				// console.log('\x1b[36m%s\x1b[0m', roomsGL);
				console.log('=1', roomsGL);
				// online.push(data.username);//@todo remove.
				// });
				//update online users list with this new user
				//so i can either append to a list of all rooms just the online users //could do that for now
				// or something that shows who is active and who is not?
				//rather just go with an object model with room object and ng- it with some js framework, angular? that parts later... program the sockets first...
				//so just the online users in each array inside the rooms object.
				//voila, could combine both arrays in O(1) and remove dupes using the new Set() method, find some method to keep the first one...
				var runFlag = 0;
				console.log('=3', online, online.length);
				console.log('=5', roomsGL, roomsGL.length);
				var postConnectObject = {
					status: 200,
					rooms: myRooms, //only rooms you are a part of
					online: online //online members in each room
				};
				console.log('=4:postconnectobj', postConnectObject);
				socket.emit('post connect', postConnectObject);
				console.log('emitted postconnect');
				runFlag = 1;
			} else {
				io.sockets.emit('post connect', {
					status: 403
				});
			}
		});


		socket.on('fetchMessages', function(data, callback){
			// callback(true);
			db.messages.find({
				room: data.roomname
			}, function (err, docs_) {//@todo: limit
				console.log("pastmsgs:", docs_);
				socket.emit('fetchMessagesResponse', docs_)
			});
		})
		//problem now is that if one user is requesting to be added to a room, the callback goes to all other online users
		socket.on('roomNameCheck', function(data){
			// callback(true);
			db.rooms.findOne({
				'roomname': data.roomName
			}, function (err, doc) {
				// console.log('roomauth find', doc);
				if (err) {
					console.log("_err");
					console.log(err);
					socket.emit('roomNameCheckRet', {
						status: 500,
						message: 'Some Internal error occured.'
					});
				}
				if (!doc) {
					socket.emit('roomNameCheckRet', {
						status: 200,
						message: 'Can create.'
					});
				} else if(doc) {
					socket.emit('roomNameCheckRet', {
						status: 409,
						message: 'Exists.'
					});
				}
			});
		})
		//new room or join room
		//data: {roomname, /*roomid*/, password}//modify
		socket.on('roomPassCheck', function (data) {
			var newrooms_ = roomsGL.map(a => a.roomname);
			var newRoomId = -1;
			var newRoom = {};
			console.log("roomPassCheck",data);
			// console.log('before sw', data.roomname, data.password);
			//@async
			db.rooms.findOne({
				'roomname': data.roomName
			}, function (err, doc) {
				// console.log('roomauth find', doc);
				if (err) {
					console.log("_err");
					console.log(err);
					socket.emit('roomPassCheckRet', {
						status: 500,
						message: 'Some Internal error occured.'
					});
				}
				if (!doc) {
					console.log("_nodoc");
					db.rooms.insert({
						'roomname': data.roomName,
						'password': genHash(data.password),
						'users': [socket.username]
					}, function (err, inserted) {
						newRoomId = inserted._id;
						db.users.update({
							username: socket.username
						}, {
							$push: {
								rooms: {
									id: newRoomId,
									roomname: data.roomName
								}
							}
						}, function (err, data__) { //callback
							roomsGL.push({
								id: newRoomId,
								roomname: data.roomName
							});
							socket.emit('roomPassCheckRet', {
								status: 200,
								message: 'Created new room!',
								newId: newRoomId,
								room: inserted
							});
							console.log("inserted", inserted);
						})

					});
				} else {
					var hash_pass = genHash(data.password);
					console.log(hash_pass);
					if (bcrypt.compareSync(data.password, doc.password)) {
						console.log("_auth");
						// return 2;//good, authorised
						ret = 2;
						var newRoomData;
						// console.log("_dbg1",newrooms_);
						// console.log("_dbg2",data.roomname);
						// console.log("_dbg3", newrooms_.indexOf('ookkk'));

						if (newrooms_.indexOf(data.roomName) >= 0) {
							//nothing
						} else {
							console.log('\x1b[36m%s\x1b[0m', "DID NOT DETECT ROOM");
							//1) make subdoc unique. 
							//2) proper callback/async
							//can add user to group
							//@async
							db.rooms.find({
								roomname: data.roomName
							}, function (err, docs) {
								newRoomId = docs._id;
								newRoom = docs;
							})
							roomsGL.push({
								id: newRoomId,
								roomname: data.roomName
							});
							db.users.update({
								username: socket.username
							}, {
								$push: {
									rooms: {
										id: newRoomId,
										roomname: data.roomName
									}
								}
							})
							db.rooms.update({
								roomname: data.roomName
							}, {
								$push: {
									users: socket.username
								}
							})
						}
						socket.emit('roomPassCheckRet', {
							status: 200,
							message: 'Joined room!',
							room: newRoom
						});
					} else {
						console.log("_noauth");
						// return 3;//bad, unauthorised
						ret = 3;
						socket.emit('roomPassCheckRet', {
							status: 401,
							message: 'Room already exists, wrong authorization creds.'
						});
					}
				}

			});


		});


		//get message
		//	if(user.in msg.room then socket.emmit else nothing)
		//send message
		//model: {msg, room}
		socket.on('send message', function (data) {

			// console.log(data);
			var msgObj = {
				user: socket.username,
				message: data.message,
				room: data.room, //check id
				ts: Date()
			};
			db.messages.insert(msgObj, function (err, result) {
				if (err)
					console.log(err);
			});
			//let's home this works :P
			console.log('_1', userGL.rooms);
			console.log('_2', data);
			console.log('_3', roomsGL);
			console.log('_3', userGL);
			console.log('_4', socketonline);
			socketonline[data.room].forEach(function (socketConn) {
				io.sockets.connected[socketConn].emit('new message', msgObj);
			}); //@todo, socket way to send socket emmit to a subarray of connections
		});

		//@async
		function userInRoom(roomname) {
			var newrooms_ = userGL.rooms.map(a => a.roomname);
			console.log("special test", newrooms_);

			userGL.rooms.forEach(function (roomObj) {
				if (roomObj.roomname == roomname) {
					return 1;
				}
			});
			return 0;
		}

		function genHash(pass) {
			// console.log('hashing');
			return bcrypt.hashSync(pass);
		}
	});

}