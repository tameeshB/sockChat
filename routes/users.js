var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs('sockchat', ['messages']);

//reg
router.get('/register',function(req,res){
	// res.sendFile(__dirname+'/index.html');
	db.messages.find(function(err, docs){
		res.render('register',{messages:docs});
	});
});

//get homepage
router.get('/login',function(req,res){
	// res.sendFile(__dirname+'/index.html');
	db.messages.find(function(err, docs){
		res.render('login',{messages:docs});
	});
});

module.exports = router;