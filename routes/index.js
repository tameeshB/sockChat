require('../globals'); 
module.exports = function(app, passport, db) {

	app.get('/:type(|about)',function(req,res){
		// res.sendFile(__dirname+'/index.html');
		// console.log(req);
		if (req.isAuthenticated() && req.url!='/about'){
			res.redirect('/app');
		}else{
			res.render('index',{messages:null,user:req.session.user});
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

	app.get('/app', isLoggedIn,function (req, res) {
		var rooms = [];
		db.rooms.find({
			roomid: { $elemMatch: req.session.rooms }
		},function(err,docs){
			if(err)
				console.log(err);
			else
				rooms = docs;
		})
		db.messages.find(function (err, docs) {
			res.render('chat', { messages: docs, user: req.user, rooms: rooms });
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
		res.redirect('/');
	}


}
