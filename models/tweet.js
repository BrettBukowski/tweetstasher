/*
 * Tweet
 */

var Model = require('./base.js');

var Tweet = Model.extend({ id: 'Tweet' }, {
  all: function(user, callback) {
    (new Tweet).view('forUser', user._id, function(error, docs) {
      if (error) {
        console.log('Error in for User: ' + error);
      }
      if (typeof callback === 'function') {
        callback(
          // Get the actual values and return
          // tweets in newest to oldest order
          docs.map(function(row) { return row }).reverse()
        );
      }
    });
  },
  find: function(id, callback) {
    (new Tweet).db().get(id, function(error, result) {
      if (error) {
        console.log(error);
      }
      callback(new Tweet(result));
    });
  }
});

module.exports = Tweet;