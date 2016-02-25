var express = require('express');
var db = require('../models');
var bodyparser = require('body-parser');
var router = express.Router();


//login forms and pages
router.get('/', function(req, res){
	res.render("login");
})

//logs in user
router.post('/', function(req, res) {
  var email = req.body.email.toLowerCase();
	var	password = req.body.password;

	db.user.authenticate(email,password, function(err, user){
		if(err){
			res.send(err);
		}else if(user){
			req.session.userId = user.id;
			console.log("LOGGED IN AS: " + user.name)
			res.redirect('/');
		}else{
			var error = 'Username or password incorrect';
			res.redirect('login');
		}
	})
});

module.exports = router;