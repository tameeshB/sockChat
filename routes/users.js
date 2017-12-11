module.exports = function(app, passport, db) {

	//user
	app.get('/login',function(req,res){
		res.render('login',{message:req.flash('loginMessage')});
		
	});
	app.get('/register',function(req,res){
		if(!req.flash('prev')){
			//flash init
			var prev = {
				name : '',
				uname : '',
				email : ''
			};
			req.flash('prev', prev);
		}
		res.render('register',{
			data: req.flash('prev'),
			errors : null,
			valErrors : req.flash('valErrors'),
			message : req.flash('signupMessage') 
		});
		
	});

	app.post('/api/register',isValidSignup, passport.authenticate('local-signup', {
        successRedirect : '/login', 
        failureRedirect : '/register', 
        failureFlash : true 
    }));

    app.post('/api/login', passport.authenticate('local-login', {
           successRedirect : '/profile', 
           failureRedirect : '/login',
           failureFlash : true
       }));


	app.get('/profile', isLoggedIn, function(req, res) {
	    res.render('profile.ejs', {
	        user : req.user
	    });
	});

	 app.get('/logout',isLoggedIn, function(req, res) {
        req.session.destroy();;
        res.redirect('/');
    });

	//fb
	app.get('/auth/facebook', passport.authenticate('facebook', {
		scope: ['public_profile', 'email']
	}));
	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect: '/profile',
			failureRedirect: '/register'
		}));
	//Utility functions
	function isLoggedIn(req, res, next) {

	    // if user is authenticated in the session, carry on 
	    console.log('check auth');
	    if (req.session.hasOwnProperty('user')){
	    	console.log('isauth');
	        return next();
	    }
	    console.log('isNOTauth');

	    // if they aren't redirect them to the home page
	    res.redirect('/');
	}

	function isValidSignup(req, res, next){
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
			var prev = {
				name : name,
				uname : username,
				email : email
			};
			req.flash('valErrors', errors);
			req.flash('prev', prev);
			res.redirect('/register');
			//if api
			// res.json({status:400,errors:errors});
		}
		else
			return next();
	}
}
//get homepage
