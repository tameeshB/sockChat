var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs('sockchat', ['messages']);

//get homepage


module.exports = router;