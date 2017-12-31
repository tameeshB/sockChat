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

	app.get('/app', isLoggedIn, function (req, res) {
		var rooms_ = [];
		roomsGL.forEach(function (room__) {
			rooms_.push(room__.roomname);
		});
		res.render('chat', {
			user: req.user
		});
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