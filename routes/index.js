
/*
 * Route handlers
 */
var Tweet = require('../models/tweet.js');

module.exports = {
  /*
   * GET '/' home page.
   */
  index: function(req, res) {
    if (req.user) {
      res.render('user', { user: req.user, title: '' });
    }
    else {
      res.render('index', { title: 'TweetStasher' });
    }
  },

  /*
   * GET '/' home page.
   */
  tweets: function(req, res) {
    
  },

  /*
   * POST '/stash' stash a new draft.
   */
  stash: function(req, res) {
    if (!req.user) return res.header('401 Unauthorized');

    var text = req.body.tweet;
    if (text) {
      Tweet.new({text: text}, req.user);
    }

    res.redirect('/');
  }
};