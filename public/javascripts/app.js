$(function() {
  var Tweet = Backbone.Model.extend({
    urlRoot: '/tweets',
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
      'click .stash':     'save',
      'click .destroy':   'kill',
      'click .post':      'post',
      'change textarea':  'updateCounter'
    },

    initialize: function() {
      _.bindAll(this, 'render', 'save', 'post', 'remove', 'updateCounter');
      
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
    
    save: function(e) {
      e.preventDefault();
      this.model.save({ text: this.input.val() });
    },
    
    post: function() {
      
    },

    kill: function(e) {
      e.preventDefault();
      this.model.destroy();
    }
  });
  
  var AppView = Backbone.View.extend({
    el: $('#app'),
    initialize: function() {
      _.bindAll(this, 'add', 'created', 'addAll', 'changed', 'sync');
      stashed.bind('add', this.add);
      stashed.bind('reset', this.addAll);
      stashed.bind('change', this.changed);
      stashed.bind('sync', this.sync);

      // Display an initial new tweet
      this.addNewEmpty();
      // Get all the tweets!
      stashed.fetch();
    },
    addNewEmpty: function() {
      if (this.empty) {
        // Previous empty? Unsubscribe this listener
        this.empty.off('sync', this.addNewEmpty, this);
      }

      this.empty = new Tweet;
      this.empty.on('sync', this.addNewEmpty, this);
      this.add(this.empty, null, null, true);
    },
    sync: function(a, b) {
      debugger;
    },
    changed: function(a, b) {
      debugger;
    },
    created: function(a, b) {
      debugger;
    },
    add: function(model, index, all, prepend) {
      var view = new TweetView({model: model});
      this.$el[(prepend) ? 'prepend' : 'append'](view.render().el);
    },
    addAll: function() {
      stashed.each(this.add);
    }
  });
  new AppView;
});