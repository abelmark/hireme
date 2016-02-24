
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

var search = "";
var where = "";


//Sets current user for display
app.use(function(req, res, next){
	if(req.session.userId){
		db.user.findById(req.session.userId).then(function(user){
			req.currentUser = user;
			res.locals.currentUser = user;
			next();
		})
	}else{
		req.currentUser = false;
		res.locals.currentUser = false;
		next();
	}
});

//displays main page
app.get('/', function(req, res){
	res.render("index")
})

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
	}, 500)
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
	}, 1000)
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
	}, 1500)
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
			console.log("LOGGED IN AS: " + user.name)
			res.redirect('/');
		}else{
			res.send('Email and/or password invalid');
		}
	})
});

//signup forms and pages
app.get('/signup', function(req, res){

	res.render("signup", {error: null});
})

app.get('/logout', function(req, res){
	req.session.userId = null;
	res.redirect('/login')
})

//signs new user up
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
		res.redirect('signup', {error: "PASSWORDS DID NOT MATCH"});
	}

})

//shows results from search
app.post('/results', function(req, res){
	search = req.body.search;
	where = req.body.city;
	async.parallel([indeed, jobDotCom, simplyHired], function(err, results){
		var allLinks = [].concat.apply([], results);
		shuffle(allLinks);
		res.render('resultpage', {allLinks: allLinks});
	})
})

//Shows favorites
app.get('/favorites', function(req, res){
	if(req.currentUser){
		res.render('favorites');
	}else{
		var error = 'You must be logged in to view';
		res.render('error', {error: error});
	}
})

app.post('/favorites', function(req, res){
	var job = req.body;
	console.log(job);
	if(req.currentUser){
		db.favorites.findOrCreate({
		where:{
			title: job.title.trim(),
			company: job.company.trim(),
			site: job.site.trim(),
			description: job.description.trim(),
			url: job.url
			}
		}).spread(function(newJob, isCreated){
			res.redirect('favorites');
		})	
	}else{
		var error = "You must be logged in to add favorites";
		res.render('error', {error: error})
	}
})

//error page
app.get('/error', function(req, res){
	res.render("error");
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









app.listen(3000);

