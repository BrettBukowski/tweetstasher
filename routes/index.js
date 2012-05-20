
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
   * GET '/tweets' user's saved tweets.
   */
  tweets: function(req, res) {
    if (!req.user) return res.send('Unauthorized', 401);

    Tweet.all(req.user, function(tweets) {
      res.json(tweets);
    });
  },

  /*
   * POST '/stash' stash a new draft.
   */
  stash: function(req, res) {
    if (!req.user) return res.send('Unauthorized', 401);

    var text = req.body.tweet;
    if (text) {
      Tweet.new({text: text}, req.user);
    }

    res.redirect('/');
  }
};