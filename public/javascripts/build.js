({
  name: 'app',
  out: 'app.js',
  shim: {
      'lib/jquery': {
        exports: '$'
      }
    , 'lib/underscore': {
        exports: '_'
    }
    , 'lib/backbone': {
        deps: ['lib/underscore', 'lib/jquery']
      , exports: 'Backbone'
    }
  }
})