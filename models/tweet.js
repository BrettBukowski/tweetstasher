/*
 * Tweet
 */

 var cradle = require('cradle')
   , db = (new cradle.Connection()).database('tweets');
   
function Tweet(props) {
  this.props = {};
  for (var i in props) {
    if (props.hasOwnProperty(i)) {
      this.props[i] = props[i];
    }
  }
}
Tweet.new = function(props, user) {
  var tweet = (props instanceof Tweet)
        ? props
        : new Tweet(props);

  tweet.props.user = user._id;
  
  db.save(tweet.props, function(error, result) {
    if (error) {
      console.log(error);
    }
  });

  return tweet;
};
Tweet.get = function(query) {
  if (query === 'all') {
    
  }
  else if (query && typeof query === 'object') {
    
  }
};
Tweet.prototype = {
  save: function() {
    if (!this._id) throw Error("Tweet hasn't been created yet. Call User#new");
  }
};

module.exports = Tweet;