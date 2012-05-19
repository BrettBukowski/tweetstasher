/*
 * User
 */

var cradle = require('cradle')
  , db = (new cradle.Connection()).database('users');

function getUserFromSession(req, userId) {
  var session = req.session;
  if (session.user && session.user.id === userId) return session.user;
}

function storeUserInSession(req, user) {
  req.session.user = user;
}

module.exports = {
  findOrCreate: function(userInfo, accessToken, accessTokenSecret, promise) {
    db.view('user/twitterId', { key: userInfo.id_str }, function(error, docs) {
      if (error) {
        console.log(error);
        return promise.fail(error);
      }
      if (docs.length === 1) {
        // Existing user
        var user = docs[0].value;
        return promise.fulfill(docs[0].value);
      }
      // New user
      var newUser = {
            accessToken:        accessToken
          , accessTokenSecret:  accessTokenSecret
          , name:               userInfo.name
          , screenName:         userInfo.screen_name
          , twitterId:          userInfo.id_str
          , profilePic:         userInfo.profile_image_url
      };

      db.save(newUser, function(error, result) {
        if (error) {
          console.log(error);
          return promise.fail(error);
        }
        return promise.fulfill(newUser);
      });
    });
  },
  
  findById: function(req, userId, callback) {
    var user = getUserFromSession(req, userId);
    if (user) {
      return callback(null, user);
    }

    db.view('user/userId', { key: userId }, function(error, doc) {
      var user = (doc.length === 1) ? doc[0].value : {};
      callback(error, user);
    });
  }
};