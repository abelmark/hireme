var express = require('express');
var bodyParser = require('body-parser');
var db = require('../models');
var router = express.Router();

router.use(bodyParser.urlencoded({extended: false}));

//Shows favorites
router.get('/', function(req, res){
	if(req.currentUser){
		db.user.findById(req.currentUser.id).then(function(user){
			user.getFavorites().then(function(favorites){
				res.render('favorites', {favorites: favorites});
			})
		})
	}else{
		var error = 'You must be logged in to view';
		res.render('error', {error: error,
												 title: "favorites"});
	}
})

//Adds favorites
router.post('/', function(req, res){
	var job = req.body;
	if(req.currentUser){
		db.user.findById(req.currentUser.id)
		.then(function(user){
			db.favorite.findOrCreate({
			where:{
				title: job.title.trim(),
				company: job.company.trim(),
				site: job.site.trim(),
				description: job.description.trim(),
				url: job.url
				}
			}).spread(function(fave, created){
				if (fave) {
					user.addFavorite(fave).then(function() {
						res.redirect('favorites');
					})
				} else {
					var error = "You must be logged in to add favorites";
					res.render('error', {error: error})
				}
			})
		})
	}else{
		var error = "You must be logged in to do that"
		res.render('error', {error: error});
	}
})

//delete favorite page
router.delete('/:id', function(req, res) {
	db.user.findById(req.session.userId).then(function(user){
		db.favorite.findById(req.params.id).then(function(fav) {
			user.removeFavorite(fav)
			res.send({msg: 'success'});
  	}).catch(function(err) {
   	 res.send({msg: 'error'});
 	 	});
	})  
});

module.exports = router;
