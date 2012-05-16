
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , less = require('less-middleware');

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
  app.use(less({ src: __dirname + '/public' }));
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
