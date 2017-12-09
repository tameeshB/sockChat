module.exports = function(app, passport, db) {

	//user
	app.get('/login',function(req,res){
		res.render('login');
		
	});
	app.get('/register',function(req,res){
		var defaults = {
			name : '',
			uname : '',
			email : ''
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
		} else{
			//register
			res.redirect('/');
		}
		
	});

	function isLoggedIn(req, res, next) {

	    // if user is authenticated in the session, carry on 
	    if (req.isAuthenticated())
	        return next();

	    // if they aren't redirect them to the home page
	    res.redirect('/');
	}

}
//get homepage
