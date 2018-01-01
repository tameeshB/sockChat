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

	app.get('/incompat/:id', function (req, res) {
		var incompatContent ='';
		switch (req.params.id){
			case 'localStorage':
				incompatContent = 'Your browser doesn\'t support a stable version of localStorage. The crypto features will not be available rendering gibberish text insead of messages.'; 
			break;
			case 'clientIDErr':
				incompatContent = 'There was a problem generating client keys for your device.';
			break;
		}
		res.render('incompat', {
			content : incompatContent,
			user: userGL
		});
	});

	app.post('/crypto/getNewClientID',isLoggedIn, function(req, res){
		var ts,state=1; 
		var usrStr = "";
		ts = Date.now();
		
		state=0;
		db.keys.insert({
			username: req.user.username,
			cid: ts,
			key: req.body.pubKey},
			function(err, dat){
				if(err)
					res.json({status:401, message: err, cid: -1});
				else{
					res.json({ status: 200, message: "Successfully registered", cid: ts });
				}
			}
		)
	})
	
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
		if (req.accepts('html', 'json') === 'json') {
			console.log('json');
			res.json({ status: 403, message: JSON.stringify(req.flash('loginMessage'))})
		}else{
			console.log('acc', req.accepts('html', 'json'))
			res.redirect('/login');
		}
	}


}