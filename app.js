
/**
 * Module dependencies.
 */
 var express = require('express')
  , less = require('less-middleware')
  , everyauth = require('everyauth')
  , User = require('./models/user.js');

// Everyauth setup

everyauth.everymodule.userPkey('_id');
everyauth.everymodule.findUserById(User.findById);

var twitterCredentials = require('./config/twitter.js');
everyauth.twitter
  .consumerKey(twitterCredentials.key)
  .consumerSecret(twitterCredentials.secret)
  .findOrCreateUser(function(session, accessToken, accessTokenSecret, userInfo) {
    var promise = this.Promise();
    require('./models/user.js').findOrCreate(userInfo, accessToken, accessTokenSecret, promise);
    return promise;
  })
  .redirectPath('/');

var app = module.exports = express.createServer();

// Configuration

app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'yeeeaaaah' }));
  app.use(everyauth.middleware());
  app.use(app.router);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(less({ src: __dirname + '/public', force: true }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
  app.use(less({ src: __dirname + '/public', once: true, compress: true }));
});

// Routes
app.get('/', require('./routes').index);
app.post('/stash', require('./routes/stash.js').stash);

app.listen(3000, function() {
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
