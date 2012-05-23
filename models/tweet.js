/*
 * Tweet
 */

var Model = require('./base.js');
   
var Tweet = Model.extend({}, {
  id: 'Tweet',
  all: function(user, callback) {
    Tweet.db().view('tweet/forUser', { key: user._id }, function(error, docs) {
      if (error) {
        console.log('Error for tweet/forUser: ' + error);
      }
      if (typeof callback === 'function') {
        callback(docs.map(function(row) {
          return row
        }));
      }
    });
  },
  db: function() {
    return Model.db(Tweet.id);
  }
});

module.exports = Tweet;