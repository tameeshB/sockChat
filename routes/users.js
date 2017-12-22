module.exports = function (app, passport, db) {

	//user login front
	app.get('/login', function (req, res) {
		res.render('login', {
			message: req.flash('loginMessage')
		});
	});

	
	app.get('/register', function (req, res) {
		if (!req.flash('prev')) {
			//flash init
			var prev = {
				name: '',
				uname: '',
				email: ''
			};
			req.flash('prev', prev);
		}
		res.render('register', {
			data: req.flash('prev'),
			errors: null,
			valErrors: req.flash('valErrors'),
			message: req.flash('signupMessage')
		});

	});
	
	//user login api
	// app.post('/api/register/:type(web|json)', isValidSignup, passport.authenticate('local-signup', {
	// 	successRedirect: '/login',
	// 	failureRedirect: '/register',
	// 	failureFlash: true
	// }));

	app.post('/api/register/:type(web|json)', function (req, res, next) {
		if (req.params.type == 'web') {
			passport.authenticate('local-signup', function (err, user, info) {
				if (err) { return next(err); }
				if (!user) { return res.redirect('/register'); }
				return res.redirect('/login');
			})(req, res, next);
		} else if (req.params.type == 'json'){
			passport.authenticate('local-signup', function (err, user, info) {
				if (err) { return res.json({ "status": 500, "message": err }); }
				if (!user) { return res.json({ "status": 400, "message": req.flash('signupMessage') }); }
				else 
					return res.json({ "status": 200, "message": "Successsfully signed up. Please Login to continue." });
			})(req, res, next);
		}
		
	});

	app.post('/api/login/:type(web|json)', function (req, res, next) {
		if(req.params.type == 'web'){
			passport.authenticate('local-login', function (err, user, info) {
				if (err) { return next(err); }
				if (!user) { return res.redirect('/login'); }
				req.logIn(user, function (err) {
					if (err) { return next(err); }
					return res.redirect('/app');
				});
			})(req, res, next);
		} else if(req.params.type=='json'){
			passport.authenticate('local-login', function (err, user, info) {
				if (err) { return res.json({"status" : 500,"message":err}); }
				if (!user) { return res.json({ "status": 401, "message": "Invalid user credentials." }); }
				req.logIn(user, function (err) {
					if (err) { return next(err); }
					return res.json({ "status": 200, "message": "Successful Login." });;
				});
			})(req, res, next);
		}
			
	});


	app.get('/addusername', isLoggedIn, function (req, res) {
		//only usefull for post oauth
	})
	app.post('/addusername', isLoggedIn, function (req, res) {
		//only usefull for post oauth
	})


	app.get('/profile', isLoggedIn, function (req, res) {
		console.log();
		res.render('profile.ejs', {
			user: req.user
		});
	});

	app.get('/logout', isLoggedIn, function (req, res) {
		req.session.destroy();;
		res.redirect('/');
	});

	//fb
	app.get('/auth/facebook', passport.authenticate('facebook', {
		scope: ['public_profile', 'email']
	}));
	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect: '/app',
			failureRedirect: '/register'
		}));


	//Utility functions
	isLoggedIn: function isLoggedIn(req, res, next) {
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
		res.redirect('/');
	}

	function isValidSignup(req, res, next) {
		var name = req.body.name;
		var email = req.body.email;
		var username = req.body.uname;
		var password = req.body.password;
		var password_ = req.body.password_;
		// console.log(name+email+username+password);
		console.log(req.body);
		//validation
		req.checkBody('name', 'Name is required.').notEmpty();
		req.checkBody('email', 'Email is required.').notEmpty();
		req.checkBody('email', 'Email is invalid.').isEmail();
		req.checkBody('uname', 'Username is required.').notEmpty();
		req.checkBody('password', 'Password is required.').notEmpty();
		req.checkBody('password_', 'Password Confirmation does not equal password.').equals(req.body.password);
		var errors = req.validationErrors();
		if (errors) {
			var prev = {
				name: name,
				uname: username,
				email: email
			};
			req.flash('valErrors', errors);
			req.flash('prev', prev);
			res.redirect('/register');
			//if api
			// res.json({status:400,errors:errors});
		} else
			return next();
	}
}
