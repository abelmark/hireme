
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var ejsLayouts = require('express-ejs-layouts');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');

app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(ejsLayouts);

app.get('/', function(req, res){
	res.render("index")
})

var search = "";
var where = "";

function indeed(callback){
	// var search = req.body.search;
	// var where = req.body.city;
	request("http://www.indeed.com/jobs?q=" + search + "&l=" + where + "/", function(error, response, data){
		if(!error && response.statusCode == 200){
			var $ = cheerio.load(data);
			var links = $('.result').map(function(link){
				return {
								site: "Indeed",
								title: $(this).children(".jobtitle").text(),
							  url: ("http://www.indeed.com" + $(this).find(".turnstileLink").attr("href")),
							  company: $(this).find(".company").text(),
								description: $(this).find(".summary").html()
							 }
			}).get();
			callback(null, links);
		}
	}, 2000)
}

function jobDotCom(callback){
	// var search = req.body.search;
	// var where = req.body.city;
	request("http://www.job.com/job-search/results/?titleSearch=&titleWhere=&q=" + search + "&l=" + where, function(error, response, data){
		// res.send(data);
		console.log(data);
		if(!error && response.statusCode == 200){
			var $ = cheerio.load(data);
			var links = $('.m-result').map(function(link){
				return {
								site: "Job.com",
								title: $(this).find(".job-title").text(),
								url: "http://www.job.com/" + $(this).find("a").text(),
								company: $(this).find(".company").text(),
								description: $(this).find(".description").text()
				}
			}).get();
			callback(null, links);
		}
	}, 5000)
}

function simplyHired(callback){
	// var search = req.body.search;
	// var where = req.body.city;
	request("http://www.simplyhired.com/search?q=" + search + "&l=" + where, function(error, response, data){
		// res.send(data);
		console.log(data);
		if(!error && response.statusCode == 200){
			var $ = cheerio.load(data);
			var links = $('.js-jobs .card').map(function(link){
				return {
					site: "Simply Hired",
					title: $(this).find(".serp-title").text(),
					url: $(this).find("js-job-link").attr("href"),
					company: $(this).find(".serp-subtitle").text(),
					description: $(this).find(".serp-snippet").text()
				}
			}).get();
			callback(null, links);
		}
		// res.render('results', {links: links});
		// res.send(data);

	}, 7000)
}


app.post('/results', function(req, res){
	console.log(req.body.search);
	console.log(req.body.city);
	search = req.body.search;
	where = req.body.city;
	async.parallel([indeed, jobDotCom, simplyHired], function(err, results){
		console.log("done!");
		var allLinks = [].concat.apply([], results);
		// res.render('resultpage', {results: results});
		res.send(allLinks);
	})
})










app.listen(3000);

