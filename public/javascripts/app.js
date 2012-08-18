requirejs.config({
  shim: {
      'lib/jquery': {
        exports: '$'
      }
    , 'lib/underscore': {
        exports: '_'
    }
    , 'lib/backbone': {
        deps: ['lib/underscore', 'lib/jquery']
      , exports: 'Backbone'
    }
  }
});

requirejs(['lib/jquery', 'lib/underscore', 'lib/backbone', 'app/relativize', 'app/notice'], 
function($, _, Backbone, relativeize, notice) {
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
      attrs.text = $.trim(attrs.text);
      if (!attrs.text.length) {
        return "There's nothing to stash!";
      }
    },

    // Routes to '/instaPublish' or '/publish'
    // depending on whether the tweet is new
    // or has already been saved.
    publish: function(key, val, callback) {
      this.set(key, val);
      Backbone.sync.call(this, 'create', this, {
        url: this.urlRoot + ((this.isNew()) ? '/instaPublish' : '/publish/' + this.id),
        success: _.bind(function(resp, status, xhr) {
          if (callback) {
            callback(this, resp);
          }
        }, this)
      });
    }
  });

  var Tweets = Backbone.Collection.extend({
      url: '/tweets'
    , model: Tweet
    , comparator: function(a, b) {
        a = a.get('created');
        b = b.get('created');
        if (a === b) return 0;
        return (a < b) ? 1 : -1;
      }
  });

  var stashed = new Tweets;
  
  _.templateSettings = {
      interpolate: /<\*=([\s\S]+?)\*>/g
    , evaluate: /<\*([\s\S]+?)\*>/g
    , escape: /<\*-([\s\S]+?)\*>/g
  }

  var TweetView = Backbone.View.extend({
    tagName: 'div',

    template: _.template($('#tweet-template').html()),

    events: {
      'click .stash':     'save',
      'click .destroy':   'kill',
      'click .post':      'post',
      'keyup textarea':  'updateCounter'
    },

    initialize: function() {
      _.bindAll(this, 'render', 'save', 'post', 'remove', 'updateCounter');

      this.model.bind('change', this.render);
      this.model.bind('change', this.updateCounter);
      this.model.bind('destroy', this.remove);
    },

    render: function() {
      var viewData = this.model.toJSON();
      viewData.created = viewData.created ? relativeize(viewData.created) : '';

      $(this.el).html(this.template(viewData));
      this.input = this.$('textarea');
      return this;
    },

    // Update the number of chars left.
    // Subtracts out link length to Twitter's
    // max t.co link length.
    updateCounter: function() {
      var text = this.input.val(),
          count = TweetView.charLimit - text.length;

      var urls = (text.match(TweetView.url) || []).concat(text.match(TweetView.pseudo) || []);
      _.each(urls, function(url) {
        count += url.length;
        count -= TweetView.linkLength;
      });

      this.$('.counter')[(count < 0) ? 'addClass' : 'removeClass']('error').html(count);
      this.toggleButtons(count < TweetView.charLimit);
    },

    toggleButtons: function(on) {
      this.$('button')[(on) ? 'removeAttr' : 'attr']('disabled', 'disabled');
    },

    save: function(e) {
      e.preventDefault();
      this.model.save({ text: this.input.val() });
    },

    post: function(e) {
      e.preventDefault();
      this.model.publish('text', this.input.val(), _.bind(function(model, response) {
        if (response.id) {
          notice("<a href='https://twitter.com/" + response.user.screen_name + "/status/" + response.id_str + "' target='_blank'>Your tweet's been posted!</a>");
          this.model.destroy();
        }
      }, this));
    },

    kill: function(e) {
      e.preventDefault();
      this.model.destroy();
    }
  }, {
    // http:// https://
    url: /\b(?:https?):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim,
    // www.
    pseudo: /(^|[^\/])(www\.[\S]+(\b|$))/gim,
    charLimit: 140,
    // Current max t.co link length
    linkLength: 20
  });

  var AppView = Backbone.View.extend({
    el: $('#app'),

    initialize: function() {
      _.bindAll(this, 'add', 'addAll', 'ensureNewDraft');

      stashed.bind('add', this.add);
      stashed.bind('reset', this.addAll);
      stashed.bind('destroy', this.ensureNewDraft);

      // Display an initial new tweet
      this.addNewEmpty();
      // Get all the tweets!
      stashed.fetch({ add: true });
    },

    ensureNewDraft: function(model, collection) {
      if (model.isNew()) {
        this.addNewEmpty();
      }
    },

    addNewEmpty: function() {
      if (this.empty) {
        // Previous empty? Unsubscribe this listener
        this.empty.off('sync', this.addNewEmpty, this);
      }

      this.empty = new Tweet;
      stashed.add(this.empty, { silent: true });
      this.empty.on('sync', this.addNewEmpty, this);
      this.add(this.empty, null, null, true);
      this.$('textarea')[0].focus();
    },

    add: function(model, index, all, prepend) {
      var view = new TweetView({ model: model });
      this.$el[(prepend) ? 'prepend' : 'append'](view.render().el);
      view.updateCounter();
    },

    addAll: function() {
      stashed.each(this.add);
    }
  });

  new AppView;
});
});