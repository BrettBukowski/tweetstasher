!function(exports) {
  exports.mocha.setup('bdd');
  
  function assert(expr, msg) {
    if (!expr) throw new Error(msg || 'failed');
  }
  assert.equal = function(a, b, msg) {
    if (a != b) throw new Error (msg || a + '!=' + b);
  };
  exports.assert = assert;
  
  var now = new Date()
    , mins = new Date(now.getTime() - (30 * 60 * 1000))
    , hrs = new Date(now.getTime() - (2 * 60 * 60 * 1000))
    , days = new Date(now.getTime() - 259200000)
    , wks = new Date(now.getTime() - 1209600000)
    , mths = new Date(now.getTime() - 10512000000)
    , yrs = new Date(now.getTime() - 31556952000);
    
  var fixture = [{
      "_id": "12312"
    , "_rev": "1-asdf"
    , "text": "moments ago"
    , "user":"sadf"
    , "created": +now
   }, {
      "_id": "23423"
    , "_rev": "1-asdfsdf"
    , "text": "30 minutes ago"
    , "user": "sadf"
    , "created": +mins
  }, {
      "_id": "123adf"
    , "_rev": "1-asdfsdf"
    , "text": "2 hours ago"
    , "user": "sadf"
    , "created": +hrs
  }, {
      "_id": "g342"
    , "_rev": "1-asdfsdf"
    , "text": "2 weeks ago"
    , "user": "sadf"
    , "created": +wks
  }, {
      "_id": "324sdf"
    , "_rev": "1-asdfsdf"
    , "text": "3 days ago"
    , "user": "sadf"
    , "created": +days
  }, {
      "_id": "sdf"
    , "_rev": "1-asdfsdf"
    , "text": "4 months ago"
    , "user": "sadf"
    , "created": +mths
  }, {
      "_id": "23q423"
    , "_rev": "1-asdfsdf"
    , "text": yrs.toLocaleDateString()
    , "user": "sadf"
    , "created": +yrs
  }];
  
  var server = sinon.fakeServer.create();
  server.autoRespond = true;
  server.respondWith('GET', '/tweets', [200, {'Content-Type': 'application/json'}, JSON.stringify(fixture)]);
  server.respondWith('POST', '/tweets', [200, {'Content-Type': 'application/json'}, JSON.stringify({'_id': '11234sdf', '_rev': '23434', created: + new Date()})])
  server.respondWith('PUT', /\/tweets\/(\d)+/, [200, {'Content-Type': 'application/json'}, JSON.stringify({id: 123423, id_str: '123423', user: {screen_name: 'bananas'}})]);
  server.respondWith('POST', '/tweets/instaPublish', [200, {'Content-Type': 'application/json'}, JSON.stringify({id: 123423, id_str: '123423', user: {screen_name: 'bananas'}})]);
  server.respondWith('POST', /\/tweets\/publish\/(\d)+/, [200, {'Content-Type': 'application/json'}, JSON.stringify({id: 123423, id_str: '123423', user: {screen_name: 'bananas'}})]);
  server.respondWith('DELETE', /\/tweets\/(\d)+/, [200, {'Content-Type': 'application/json'}, '']);
  
  exports.server = server;
  exports.fixture = fixture;
}(window)