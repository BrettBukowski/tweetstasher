$(function() {
  var serverRequests = 1; // RequireJS
  
  function keyUp(el) {
    el.trigger($.Event('keyup', { keyCode: 72 }));
  }
  
  function click(el) {
    el.trigger($.Event('click'));
  }

  describe('Initialization', function() {
    it('Makes initial request for all tweets', function() {
      assert.equal(server.requests.length, ++serverRequests);
      var initialRequest = server.requests[serverRequests - 1];
      assert.equal(initialRequest.method, 'GET');
      assert.equal(initialRequest.url, '/tweets');
    })
    
    it('Displays initial tweets in newest to oldest order', function() {
      assert.equal($('.tweet').length, fixture.length + 1);
      var units = ['', 'moments', 'minutes', 'hours', 'days', 'weeks', 'months', ','];
      $('.tweet').each(function(i, e) {
        var dateLabel = $(e).find('.created').html();
        assert.equal($(e).find('textarea').val(), dateLabel);
        assert(dateLabel.indexOf(units[i]) > -1, "Date label didn't contain " + units[i]);
      });
    })
  })
  
  describe('Client app behavior', function() {
    describe('Character counter', function() {
      it('Decrements characters on keyup', function() {
        var counter = $('.counter').first()
          , textarea = $('textarea').first();

        textarea.val('hey');
        keyUp(textarea);
        assert.equal(counter.html(), '137');
      })
      
      it('Accounts for links', function() {
        var counter = $('.counter').first()
          , textarea = $('textarea').first();

        textarea.val('www.google.com');
        keyUp(textarea);
        assert.equal(counter.html(), '120');
        
        textarea.val('http://placekitten.com/200/220');
        keyUp(textarea);
        assert.equal(counter.html(), '120');
      })
    })

    describe('Buttons', function() {
      it('Disables buttons when there\'s no text', function() {
        var button = $('button').first()
          , textarea = $('textarea').first();

        textarea.val('');
        keyUp(textarea);
        assert(button.attr('disabled'));        
      })

      it('Un-disables buttons when there\'s text', function() {
        var button = $('button').first()
          , textarea = $('textarea').first();

        textarea.val(' ');
        keyUp(textarea);
        assert(!button.attr('disabled'));        
      })
    })
  })
  
  describe('User stories', function() {
    describe('Stashing', function() {
      it('Stashes a new draft and adds a new empty', function(done) {
        var draft = $('.tweet').first();
        var textarea = draft.find('textarea');

        textarea.val('Draft');
        keyUp(textarea);
        click(draft.find('.stash'));
        
        setTimeout(function() {
          assert.equal(server.requests.length, ++serverRequests);
          assert.equal($($('textarea')[1]).val(), textarea.val());
          assert.equal('Draft', textarea.val());
          assert.equal($($('.created')[1]).html(), 'moments ago');
          assert.equal($($('.counter')[1]).html(), 140 - textarea.val().length);
          done();
        }, 100);
      })
      
      it('Stashes an existing draft and doesn\'t change its position', function(done) {
        var draft = $('.tweet').last();
        var textarea = draft.find('textarea');
        var created = draft.find('.created');

        textarea.val('Existing Draft');
        keyUp(textarea);
        click(draft.find('.stash'));

        setTimeout(function() {
          assert.equal(server.requests.length, ++serverRequests);
          assert.equal($('textarea').last().val(), textarea.val());
          assert.equal($('.created').last().html(), created.html());
          assert.equal($('.counter').last().html(), 140 - textarea.val().length);
          done();
        }, 100);
      })
    })
    
    describe('Tweeting', function() {
      it('Tweets a new draft', function(done) {
        var draft = $('.tweet').first();
        var textarea = draft.find('textarea');
        
        textarea.val('Instatweet');
        keyUp(textarea);
        click(draft.find('.post'));
        
        setTimeout(function() {
          assert.equal(server.requests.length, ++serverRequests);
          assert($($('textarea')[1]).val() != textarea.val());
          assert($('#notice'));
          assert.equal('https://twitter.com/bananas/status/123423', $('#notice').find('a').attr('href'));
          done();
        }, 100);
      })
      
      it('Tweets an existing draft', function(done) {
        var draft = $('.tweet').last();
        var textarea = draft.find('textarea');
        var created = draft.find('.created');

        textarea.val('Post This Existing Draft');
        keyUp(textarea);
        click(draft.find('.post'));

        setTimeout(function() {
          ++serverRequests; // Publish
          ++serverRequests; // Delete
          assert.equal(server.requests.length, serverRequests);
          assert.equal('DELETE', server.requests[serverRequests - 1].method);
          assert($('textarea').last().val() != textarea.val());
          assert($('.created').last().html() != created.html());
          assert($('#notice'));
          assert.equal('https://twitter.com/bananas/status/123423', $('#notice').find('a').attr('href'));
          done();
        }, 100);
      })
    })
    
    describe('Deleting', function() {
      it('Cannot delete a new draft', function() {
        var draft = $('.tweet').first();
        assert(!draft.find('a.destroy').length);
      })
      
      it('Deletes an existing draft', function() {
        var drafts = $('.tweet').length;
        var draft = $('.tweet').last();
        click(draft.find('a.destroy'));
        assert.equal(drafts - 1, $('.tweet').length);
      })
    })
  })
})