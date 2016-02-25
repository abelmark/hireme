var express = require('express');
var db = require('../models');
var bodyparser = require('body-parser');
var router = express.Router();

//signup forms and pages
router.get('/', function(req, res){
	res.render("signup", {error: null});
})

//signs new user up
router.post('/', function(req, res){
	var userInfo = req.body;
	if(userInfo.password === userInfo.password2){
		db.user.findOrCreate({
			where: {
			email: userInfo.email.toLowerCase(),
			name: userInfo.name,
			password: userInfo.password
		}
		}).spread(function(newUser, isCreated){
			res.redirect('login');
		}).catch(function(err){
			res.render('error', {error: err})
		})
	}else{
		res.render('signup', {error: "PASSWORDS DID NOT MATCH"});
	}
})

module.exports = router;
