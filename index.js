
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var ejsLayouts = require('express-ejs-layouts');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var db = require('./models')
var session = require('express-session');
var webscraper = require('./webscrapers.js')

app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(ejsLayouts);
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

//logout route
app.get('/logout', function(req, res){
	req.session.userId = null;
	res.redirect('/login')
})

//error page
app.get('/error', function(req, res){
	res.render("error");
})

//controllers
var favoritesCtrl = require('./controllers/favorites');
app.use('/favorites', favoritesCtrl);
var loginCtrl = require('./controllers/login');
app.use('/login', loginCtrl);
var resultsCtrl = require('./controllers/results');
app.use('/results', resultsCtrl);
var signupCtrl = require('./controllers/signup');
app.use('/signup', signupCtrl);

app.get('/*', function(req, res){
	var error = "404 NOT FOUND"
	res.render('error', {error: error});
})

app.listen(process.env.PORT || 3000);