module.exports = function(app, passport, db) {

	 app.get('/',function(req,res){
		// res.sendFile(__dirname+'/index.html');
		db.messages.find(function(err, docs){
			res.render('index',{messages:docs});
		});
	});

}
//get homepage
