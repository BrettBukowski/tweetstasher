
/**
 * Module dependencies.
 */
 var express = require('express')
  , routes = require('./routes')
  , less = require('less-middleware')
  , everyauth = require('everyauth')
  , RedisStore = require('connect-redis')(express)
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
  app.use(express.session({ store: new RedisStore(), secret: config.session, cookie: { maxAge: 60 * 60 * 1000 }}));
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

app.configure('test', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.static(__dirname + '/test/browser'));
  app.use(express.static(__dirname + '/node_modules/mocha'));
  app.use(express.static(__dirname + '/node_modules/sinon'));
});

app.dynamicHelpers({
  route: function(req, res) {
    if (!req.route) return '404';
    return (req.route.path === '/') ? 'home' : req.route.path.substr(1);
  }
});

// Routes
function requireUser(req, res, next) {
  if (!req || !req.user) return res.send('Unauthorized', 401);

  next();
}
app.get('/', routes.index);
app.get('/tweets', requireUser, routes.tweets);
app.post('/tweets', requireUser, routes.stash);
app.del('/tweets/:id', requireUser, routes.del);
app.put('/tweets/:id', requireUser, routes.put);
app.post('/tweets/publish/:id', requireUser, routes.publish);
app.post('/tweets/instaPublish', requireUser, routes.instaPublish);
app.get('/signout', requireUser, routes.signout);
app.get('/about', routes.about);

// Errors
app.use(function(req, res) {
  res.render('404');
});

app.listen(4000, function() {
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
