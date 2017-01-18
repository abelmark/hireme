var express = require('express');
var async = require('async');
var bodyparser = require('body-parser');
var router = express.Router();
var webscraper = require('../webscrapers.js')

//shows results from search
router.post('/', function(req, res){
	var search = req.body.search;
	var where = req.body.city;
	async.parallel([webscraper.job(search, where), webscraper.simply(search, where), webscraper.indeed(search, where)], function(err, results){
		var allLinks = [].concat.apply([], results);
		shuffle(allLinks);
		res.render('resultpage', {allLinks: allLinks});
	})
})

//shuffle function for displaying jobs
function shuffle(a) {
	var j, x, i;
	for (i = a.length; i; i--) {
		j = Math.floor(Math.random() * i);
		x = a[i - 1];
		a[i - 1] = a[j];
		a[j] = x;
	}
	return a;
}

module.exports = router;