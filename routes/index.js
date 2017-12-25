require('../globals');
module.exports = function (app, passport, db) {

	app.get('/:type(|about)', function (req, res) {
		// res.sendFile(__dirname+'/index.html');
		// console.log(req);
		if (req.isAuthenticated() && req.url != '/about') {
			res.redirect('/app');
		} else {
			res.render('index', {
				messages: null,
				user: req.session.user
			});
		}
	});

	// app.get('/test/:a/:b',function(req,res){

	// 	db.users.findOne({ 'username': req.params.a, 'name': req.params.b }, function (err, doc) {
	// 		if (err) {
	// 			res.send(err);
	// 		}
	// 		if(doc)
	// 			res.send('a'+doc);
	// 		if(!doc)
	// 			res.send('b' + doc);
	// 	});
	// });
	//@async
	app.get('/app', isLoggedIn, function (req, res) {
		var rooms = {};
		var messages = {};
		var rooms_ = [];
		roomsGL.forEach(function (room__) {
			rooms_.push(room__.roomname);
		});
		console.log('rooms_', rooms_);
		db.rooms.find({
			roomname: {
				$in: rooms_
			} //@todo: Limit
		}, function (err, docs) {
			if (err)
				console.log(err);
			rooms = docs;
			//filter message history
			//message remodel
			db.messages.find({
				room: {
					$in: rooms_
				}
			}, function (err, docs_) {
				console.log("pastmsgs:", docs_);
				messages = docs_; //later fetch with js lib
				console.log("dbg:", messages, rooms)
				res.render('chat', {
					messages: messages,
					user: req.user,
					rooms: rooms
				}); //want room data here with all participants etc.
				//complete room data, user and messages
			});
		})



	});


	//Utility functions
	function isLoggedIn(req, res, next) {

		// if user is authenticated in the session, carry on 
		console.log('check auth');
		if (req.isAuthenticated()) {
			console.log('isauth');

			if (!req.session.user.hasOwnProperty('username') && req.url != '/addusername') {
				res.redirect('/addusername');
			}

			return next();

		}
		console.log('isNOTauth');
		// if they aren't redirect them to the home page
		req.flash('loginMessage', req.flash('loginMessage') + "You must login first.")
		res.redirect('/login');
	}


}