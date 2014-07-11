var assert = require('assert')
  , sinon = require('sinon')
  , sandboxed = require('sandboxed-module')
  , Model = require('../../models/base');

describe('User model tests', function() {
  var save = sinon.spy()
    , view = sinon.spy()
    , ModelMock = Model.extend({
        save: save
      , view: view
    });

  var User = sandboxed.require('../../models/user', {
    requires: {
      './base.js': ModelMock
    }
  });


  beforeEach(function() {
    save.reset();
    view.reset();
  });

  describe('#findOrCreate', function() {
    it('Finds an existing user', function() {
      var promise = { fulfill: function(){} };
      // var fulfilled = sinon.spy(promise, 'fulfill');

      User.findOrCreate({id_str: 'banana'}, 'abc', 'def', promise);

      assert(view.calledOnce);

      var args = view.getCall(0).args;
      assert.equal('twitterId', args[0]);
      assert.equal('banana', args[1]);

      var sendback = args[2];
      sendback(null, [{ value: { star: 'man' }}]);

      assert(save.calledOnce);

      // assert(fulfilled.called);
      // assert.equal('man', fulfilled.getCall(0).args[0].star);
    });

    it('Creates a new user if one without the given twitter id does\'nt exist', function() {
      var user = {id_str: 'banana', name: 'star', screen_name: 'man', profile_image_url: 'http://placekitten.com/100/100'};

      User.findOrCreate(user, 'abc', 'def');

      assert(view.calledOnce);

      var sendback = view.getCall(0).args[2];
      sendback(null, []);

      assert(save.calledOnce);

      var saved = save.thisValues[0].props;

      assert.equal('abc', saved.accessToken);
      assert.equal('def', saved.accessTokenSecret);
      assert.equal(user.id_str, saved.twitterId);
      assert.equal(user.name, saved.name);
      assert.equal(user.screen_name, saved.screenName);
      assert.equal(user.profile_image_url, saved.profilePic);
    });
  });

  describe('#findById', function() {
    var user = {_id: 'banana', name: 'star'};

    it('Finds a user in the session', function() {
      var callback = sinon.spy();

      User.findById({ session: { user: user}}, 'banana', callback);

      assert(!view.called);
      assert(callback.calledOnce);
      assert.deepEqual(user, callback.getCall(0).args[1]);
    });

    it('Finds a user in the db and stores it in the session', function() {
      var callback = sinon.spy();
      var session = {};

      User.findById({ session: session }, 'banana', callback);

      assert(view.calledOnce);

      var args = view.getCall(0).args;

      assert.equal('userId', args[0]);
      assert.equal('banana', args[1]);

      var sendback = args[2];
      sendback(null, [{ value: user }]);

      assert(callback.calledOnce);
      assert.deepEqual(user, callback.getCall(0).args[1]);

      assert.deepEqual(user, session.user);
    });

    it('Returns an empty object if not found', function() {
      var callback = sinon.spy();

      User.findById({ session: {}}, 'banana', callback);

      var args = view.getCall(0).args;
      var sendback = args[2];

      sendback(null, []);

      assert(callback.calledOnce);
      assert.deepEqual({}, callback.getCall(0).args[1]);
    });
  });
});