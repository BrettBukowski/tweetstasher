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
      'keyup textarea':  'updateCounter'
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