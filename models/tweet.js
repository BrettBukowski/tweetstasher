/*
 * Tweet
 */

var Model = require('./base.js')
  , Oauth = require('oauth-client')
  , keys = require('../config/keys.js');

var urls = {
    base: 'api.twitter.com'
  , publish: '/1/statuses/update.json'
};

var Tweet = Model.extend({
  id: 'Tweet',

  publish: function(user, callback) {
    var consumer = Oauth.createConsumer(keys.twitter.consumerKey, keys.twitter.consumerSecret)
      , token = Oauth.createToken(user.accessToken, user.accessTokenSecret)
      , signature = Oauth.createHmac(consumer, token)
      , body = { status: this.get('text') }
      , request = {
            host: urls.base
          , path: urls.publish
          , https: true
          , method: 'POST'
          , body: body
          , oauth_signature: signature
        }
      , req = Oauth.request(request, function(response) {
          var responseData = '';

          response.setEncoding('utf8');
          response.on('data', function(chunk) {
            responseData += chunk;
          });
          response.on('end', function() {
            if (callback) {
              callback(JSON.parse(responseData));
            }
          });
      });

    req.write(body);
    req.end();
  }}, {
  all: function(user, callback) {
    (new Tweet).view('forUser', user._id, function(error, docs) {
      if (error) {
        console.log('Error in for User: ' + error);
      }
      if (typeof callback === 'function') {
        callback(
          // Get the actual values and return
          // tweets in newest to oldest order
          docs ? docs.map(function(row) { return row }).reverse() : null,
          error
        );
      }
    });
  },
  find: function(id, callback) {
    (new Tweet).db().get(id, function(error, result) {
      if (error) {
        console.log(error);
      }
      callback(new Tweet(result), error);
    });
  }
});

module.exports = Tweet;