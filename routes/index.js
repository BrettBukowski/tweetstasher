
/*
 * Route handlers
 */
var Tweet = require('../models/tweet.js'),
    fs = require('fs');

module.exports = {
  /*
   * GET '/' home page.
   */
  index: function(req, res) {
    if (req.user) {
      res.render('user', {
        layout: 'userLayout',
        user: req.user,
        view: fs.readFileSync(__dirname + '/../views/client/user.ejs')
      });
    }
    else {
      res.render('index');
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
   * POST '/tweets' stash a new draft.
   */
  stash: function(req, res) {
    if (!req.user) return res.send('Unauthorized', 401);

    var text = req.body.tweet;
    if (text) {
      new Tweet({text: text, user: req.user._id}).save();
    }

    res.redirect('/');
  }
};