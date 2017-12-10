module.exports = function(app, passport, db) {

	 app.get('/',function(req,res){
		// res.sendFile(__dirname+'/index.html');
		if(req.session.hasOwnProperty('user')){
			db.messages.find(function(err, docs){
				res.render('chat',{messages:docs});
			});
		}else{
			res.render('index',{messages:null});
		}
		
	});


}
//get homepage
