/*
 * User
 */

var cradle = require('cradle');

var db = (new cradle.Connection()).database('users');

module.exports = {
  findOrCreate: function(userInfo, accessToken, accessTokenSecret, promise) {
    users.view('docs/twitterId', { key: userInfo.id_str }, function(error, docs) {
      if (error) {
        console.log(error);
        promise.fail(error);
        return;
      }
      
      if (docs.length === 1) {
        // Existing user
        promise.fulfill(docs[0].value);
      }
      else {
        // New user
        var newUser = {
          accessToken: accessToken,
          accessTokenSecret: accessTokenSecret,
          name: userInfo.name,
          twitterId, userInfo.id_str
        };

        users.save(newUser, function(error, result) {
          if (error) {
            console.log(error);
            promise.fail(error);
            return;
          }
          
          promise.fulfill(newUser);
        });
      }
    });
  }
};