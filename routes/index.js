
/*
 * Route handlers
 */
var Tweet = require('../models/tweet.js'),
    fs = require('fs');

function respond(type, request) {
  return request.headers.accept.indexOf(type) > -1;
}

module.exports = {
  /*
   * GET '/' home page.
   */
  index: function(req, res) {
    if (req.user) {
      res.render('user', {
          layout: 'userLayout'
        , user: req.user
      });
    }
    else {
      res.render('index');
    }
  },
  
  /*
   * GET '/about' About page
   */
  about: function(req, res) {
    res.render('about');
  },

  /*
   * GET '/tweets' user's saved tweets.
   */
  tweets: function(req, res) {
    Tweet.all(req.user, function(tweets) {
      res.json(tweets);
    });
  },

  /*
   * POST '/tweets' stash a new draft.
   */
  stash: function(req, res) {
    var text = req.body.text;
    if (text) {
      console.log('saving ');
      console.log({text: text, user: req.user._id});
      new Tweet({text: text, user: req.user._id}).save(function(resp) {
        if (respond('json', req)) {
          res.json(resp);
        }
        else {
          res.redirect('/');
        }
      });
    }
    else {
      res.send('Bad Request', 400);
    }
  },

  /*
   * DELETE '/tweets/:id' delete a saved draft.
   */
  del: function(req, res) {
    Tweet.find(req.params.id, function(tweet) {
      tweet.destroy();
      res.send('OK', 200);
    });
  },

  /*
   * PUT '/tweets/:id' update existing draft.
   */
  put: function(req, res) {
    Tweet.find(req.params.id, function(tweet) {
      tweet.set('text', req.body.text).save();
      res.send('OK', 200);
    });
  },

  /*
   * POST '/tweets/publish/:id' post an existing draft to Twitter.
   */
  publish: function(req, res) {
    Tweet.find(req.params.id, function(tweet) {
      tweet.set('text', req.body.text).publish(req.user, function(response) {
        res.json(response);
      });
    });
  },

   /*
    * POST '/tweets/instaPublish' post a new draft to Twitter.
    */
  instaPublish: function(req, res) {
    var text = req.body.text;
    if (text) {
      new Tweet({text: text}).publish(req.user, function(response) {
        res.json(response);
      });
    }
    else {
      res.send('Bad Request', 400);
    }
  },

  /*
   * GET '/signout' kills the current user's session.
   */
  signout: function(req, res) {
    req.session.destroy();
    res.redirect('/');
  }
};