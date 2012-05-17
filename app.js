
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , less = require('less-middleware')
  , everyauth = require('everyauth');

// Everyauth setup

var twitterCredentials = require('./config/twitter.js');
everyauth.twitter
  .consumerKey(twitterCredentials.key)
  .consumerSecret(twitterCredentials.secret)
  .findOrCreateUser(function(session, accessToken, accessTokenSecret, userInfo) {
    var promise = this.Promise();
    users.findOrCreate(userInfo, accessToken, accessTokenSecret, promise);
    return promise;
  })
  .redirectPath('/');

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
  app.use(everyauth.middleware());
  everyauth.helpExpress(app)
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

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
