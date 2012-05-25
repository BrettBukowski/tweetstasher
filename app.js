
/**
 * Module dependencies.
 */
 var express = require('express')
  , routes = require('./routes')
  , less = require('less-middleware')
  , everyauth = require('everyauth')
  , User = require('./models/user.js');

// Everyauth setup

everyauth.everymodule.userPkey('_id');
everyauth.everymodule.findUserById(User.findById);

var config = require('./config/keys.js');
everyauth.twitter
  .consumerKey(config.twitter.consumerKey)
  .consumerSecret(config.twitter.consumerSecret)
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
  app.use(express.session({ secret: config.session, cookie: { maxAge: 60 * 60 * 1000 }}));
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
function requireUser(req, result, next) {
  if (!req || !req.user) return res.send('Unauthorized', 401);
  
  next();
}
app.get('/', routes.index);
app.get('/tweets', requireUser, routes.tweets);
app.post('/tweets', requireUser, routes.stash);
app.del('/tweets/:id', requireUser, routes.del);

app.listen(3000, function() {
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
