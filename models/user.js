/*
 * User
 */

var Model = require('./base.js');

function getUserFromSession(req, userId) {
  var session = req.session;
  if (session.user && session.user._id === userId) return session.user;
}

function storeUserInSession(req, user) {
  req.session.user = user;
}

var User = Model.extend({ id: 'User' }, {
  findOrCreate: function(userInfo, accessToken, accessTokenSecret, promise) {
    (new User).view('twitterId', userInfo.id_str, function(error, docs) {
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
      new User({
            accessToken:        accessToken
          , accessTokenSecret:  accessTokenSecret
          , name:               userInfo.name
          , screenName:         userInfo.screen_name
          , twitterId:          userInfo.id_str
          , profilePic:         userInfo.profile_image_url
      }).save(null, promise);
    });
  },
  
  findById: function(req, userId, callback) {
    var user = getUserFromSession(req, userId);
    if (user) {
      return callback(null, user);
    }

    (new User).view('userId', userId, function(error, doc) {
      var user = (doc.length === 1) ? doc[0].value : {};
      storeUserInSession(req, user);
      callback(error, user);
    });
  }
});
module.exports = User;