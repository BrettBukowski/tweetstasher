
/*
 * POST stash a new draft.
 */

var Tweet = require('../models/tweet.js');

exports.stash = function(req, res) {
  if (!req.user) return res.header('401 Unauthorized');

  var text = req.body.tweet;
  if (text) {
    Tweet.new({text: text}, req.user);
  }

  res.redirect('/');
};
