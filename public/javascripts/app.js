$(function() {
  var Tweet = Backbone.Model.extend({
    idAttribute: '_id',
    
    defaults: {
      created: '',
      text: ''
    },
    
    clear: function() {
      this.destroy();
    },
    
    validate: function(attrs) {
      if (!attrs.text.length) {
        return "There's nothing to stash!";
      }
    }
  });
  
  var Tweets = Backbone.Collection.extend({
    url: '/tweets',
    model: Tweet
  });
  
  var stashed = new Tweets;
  
  var TweetView = Backbone.View.extend({
    tagName: 'div',
    
    template: _.template($('#tweet-template').html()),
    
    events: {
      'click .stash': 'save',
      'click .destroy': 'remove',
      'change textarea': 'updateCounter'
    },

    initialize: function() {
      _.bindAll(this, 'render', 'save', 'remove', 'updateCounter');
      
      this.model.bind('change', this.render);
      this.model.bind('destroy', this.remove);      
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.input = this.$('textarea');
      return this;
    },

    updateCounter: function() {
      this.$('.counter').html(this.input.val().length);
    },
    
    save: function() {
      this.model.save({ text: this.input.val() });
    },

    remove: function(e) {
      e.preventDefault();
      this.model.clear();
    }
  });
  
  var AppView = Backbone.View.extend({
    el: $('#app'),
    initialize: function() {
      _.bindAll(this, 'add', 'addAll');
      stashed.bind('add', this.add);
      stashed.bind('reset', this.addAll);
      
      // Display an initial new tweet
      this.add(new Tweet);
      // Get all the tweets!
      stashed.fetch();
    },
    add: function(model) {
      var view = new TweetView({model: model});
      this.$el.append(view.render().el);
    },
    addAll: function() {
      stashed.each(this.add);
    }
  });
  new AppView;
});