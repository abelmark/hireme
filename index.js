
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var ejsLayouts = require('express-ejs-layouts');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var db = require('./models')
var flash = require('connect-flash');
var session = require('express-session');

app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(ejsLayouts);
app.use(flash());
app.use(session({
	secret: 'heytherebabyboy',
	resave: false,
	saveUninitialized: true
}))

app.get('/', function(req, res){
	res.render("index")
})

var search = "";
var where = "";

function indeed(callback){
	request("http://www.indeed.com/jobs?q=" + search + "&l=" + where + "/", function(error, response, data){
		if(!error && response.statusCode == 200){
			var $ = cheerio.load(data);
			var links = $('.result').map(function(link){
				return {
								site: "Indeed",
								title: $(this).children(".jobtitle").text(),
							  url: ("http://www.indeed.com" + $(this).find(".turnstileLink").attr("href")),
							  company: $(this).find(".company").text(),
								description: $(this).find(".summary").text()
							 }
			}).get();
			callback(null, links);
		}
	}, 2000)
}

function jobDotCom(callback){
	request("http://www.job.com/job-search/results/?titleSearch=&titleWhere=&q="+  search + "&l=" + where + "&geonameid=#.VsvJJZMrLVo", function(error, response, data){
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
	request("http://www.simplyhired.com/search?q=" + search + "&l=" + where, function(error, response, data){
		if(!error && response.statusCode == 200){
			var $ = cheerio.load(data);
			var links = $('.js-jobs .card').map(function(link){
				return {
					site: "Simply Hired",
					title: $(this).find(".serp-title").text(),
					url: "http://www.simplyhired.com" + $(this).find(".js-job-link").attr("href"),
					company: $(this).find(".serp-subtitle").text(),
					description: $(this).find(".serp-snippet").text()
				}
			}).get();
			callback(null, links);
		}
	}, 7000)
}

//login forms and pages
app.get('/login', function(req, res){
	res.render("login");
})

app.post('/login', function(req, res) {
  var email = req.body.email;
	var	password = req.body.password;

	db.user.authenticate(email,password, function(err, user){
		if(err){
			res.send(err);
		}else if(user){
			req.session.userId = user.id;
			res.redirect('/');
		}else{
			res.send('Email and/or password invalid');
		}
	})
});

//signup forms and pages
app.get('/signup', function(req, res){
	res.render("signup");
})

app.post('/signup', function(req, res){
	var userInfo = req.body;
	if(userInfo.password === userInfo.password2){
		db.user.findOrCreate({
			where: {
			email: userInfo.email,
			name: userInfo.name,
			password: userInfo.password
		}
		}).spread(function(newUser, isCreated){
			res.redirect('signup');
		})
	}else{
		req.flash('danger', 'Passwords did not match')
		res.redirect('signup');
	}

})

app.post('/results', function(req, res){
	search = req.body.search;
	where = req.body.city;
	async.parallel([indeed, jobDotCom, simplyHired], function(err, results){
		var allLinks = [].concat.apply([], results);
		shuffle(allLinks);
		res.render('resultpage', {allLinks: allLinks});
	})
})

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









app.listen(3000);

