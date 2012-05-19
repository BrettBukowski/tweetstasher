
/*
 * GET home page.
 */
 
exports.index = function(req, res){
  if (req.user) {
    res.render('user', { user: req.user, title: '' });
  }
  else {
    res.render('index', { title: 'TweetStasher' });
  }
};