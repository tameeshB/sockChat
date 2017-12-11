
module.exports = function(app, passport, db) {

	app.get('/:type(|about)',function(req,res){
		// res.sendFile(__dirname+'/index.html');
		console.log(req);
		if (req.session.hasOwnProperty('user') && req.url!='/about'){
			
			res.redirect('/app');
		}else{
			res.render('index',{messages:null,user:req.session.user});
		}
		
	});
	

	app.get('/app', isLoggedIn,function (req, res) {
		
		db.messages.find(function (err, docs) {
			res.render('chat', { messages: docs, user: req.user });
		});
	});


	//Utility functions
	function isLoggedIn(req, res, next) {

		// if user is authenticated in the session, carry on 
		console.log('check auth');
		if (req.session.hasOwnProperty('user')) {
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


}
