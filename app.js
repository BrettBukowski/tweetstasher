
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , less = require('less-middleware')
  , passport = require('passport')
  , twitter = require('passport-twitter').Strategy;
  
// Passport setup

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});

var credentials = require('./config/passport.js');
passport.use(new twitter({
    consumerKey: credentials.key,
    consumerSecret: credentials.secret,
    callbackURL: ''
  },
  function(token, tokenSecret, profile, done) {
    
  }
));

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'yeeeaaaah' }));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(less({ src: __dirname + '/public', force: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
  app.use(less({ src: __dirname + '/public', once: true, compress: true }));
});

// Routes

app.get('/', routes.index);

app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), function(req, res) {
  res.redirect('/');
});

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
