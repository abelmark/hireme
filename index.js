
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
var webscraper = require('./webscrapers.js')

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
	res.render("index", {title: "home"})
})

//login forms and pages
app.get('/login', function(req, res){
	res.render("login");
})

//logs in user
app.post('/login', function(req, res) {
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

//shows results from search
app.post('/results', function(req, res){
	var search = req.body.search;
	var where = req.body.city;
	async.parallel([webscraper.job(search, where), webscraper.simply(search, where), webscraper.indeed(search, where)], function(err, results){
		var allLinks = [].concat.apply([], results);
		shuffle(allLinks);
		res.render('resultpage', {allLinks: allLinks});
	})
})

//Shows favorites
app.get('/favorites', function(req, res){
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
app.post('/favorites', function(req, res){
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
	}
})

//delete favorite page
app.delete('/:id', function(req, res) {
	db.user.findById(req.session.userId).then(function(user){
		db.favorite.findById(req.params.id).then(function(fav) {
			user.removeFavorite(fav)
			res.send({msg: 'success'});
  	}).catch(function(err) {
   	 res.send({msg: 'error'});
 	 	});
	})
  
});


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

app.get('/*', function(req, res){
	var error = "404 NOT FOUND"
	res.render('error', {error: error});
})







app.listen(process.env.PORT || 3000);

