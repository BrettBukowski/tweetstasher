var assert = require('assert')
  , sinon = require('sinon')
  , sandboxed = require('sandboxed-module')
  , Model = require('../../models/base');

describe('Tweet model tests', function() {
  var OauthRequest = {
      write: function() {}
    , end: function() {}
  };
  var OauthMock = {
      createConsumer: function() {}
    , createToken: function() {}
    , createHmac: function() {}
    , request: function() {
        return OauthRequest;
      }
  };
  var get = function(){};
  var db = function() {
    return {get: get};
  };
  db = sinon.spy(db);
  get = sinon.spy(get);
  
  var request = sinon.spy(OauthMock, 'request')
    , write = sinon.spy(OauthRequest, 'write')
    , end = sinon.spy(OauthRequest, 'end')
    , view = sinon.spy();
  
  var ModelMock = Model.extend({
      db: db
    , view: view
  });
  
  var Tweet = sandboxed.require('../../models/tweet', {
    requires: {
        'oauth-client': OauthMock
      , './base.js': ModelMock
    }
  });
  
  
  beforeEach(function() {
    request.reset();
    write.reset();
    end.reset();
    db.reset();
    view.reset();
    get.reset();
  });

  describe('#publish', function() {
    it('Sends the correct request params and the body', function() {
      new Tweet({text: 'banana'}).publish({accessToken: 'abc', accessTokenSecret: 'def'});
      
      assert(request.calledOnce);
      
      var args = request.getCall(0).args;
      
      assert.equal('/1/statuses/update.json', args[0].path);
      assert.equal('api.twitter.com', args[0].host);
      assert(args[0].https);
      assert.equal('banana', args[0].body.status);
      
      assert(write.calledOnce);
      assert.equal('banana', write.getCall(0).args[0].status);
      assert(end.calledOnce);
    });
  });

  describe('#all', function() {
    it('Uses the `forUser` view and passes the user id', function() {
      Tweet.all({_id: 'banana'});
      assert(view.calledOnce);
      
      var args = view.getCall(0).args;
      
      assert.equal('forUser', args[0]);
      assert.equal('banana', args[1]);
      assert(typeof args[2] === 'function');
    });
    
    it('Calls the callback with ordered results', function() {
      var callback = sinon.spy();
      Tweet.all({_id: 'banana'}, callback);
      assert(view.calledOnce);
      
      var passback = view.getCall(0).args[2]
        , docs = [{id: 'banana', value: 'no'}, {id: 'plantain', value: 'yes'}];
      
      passback(null, docs);
      
      assert(callback.calledOnce);
      var args = callback.getCall(0).args[0];
      assert.deepEqual(docs[1], args[0]);
      assert.deepEqual(docs[0], args[1]);
    });
  });
  
  describe('#find', function() {
    it('Returns a new Tweet', function() {
      var callback = sinon.spy();
      Tweet.find('banana', callback);
      
      assert(db.calledOnce);
      assert(get.calledOnce);
      
      var args = get.getCall(0).args;
      
      assert.equal('banana', args[0]);
      var passback = args[1];
      passback(null, {hey: 'yo'});
      
      assert(callback.calledOnce);
      var tweet = callback.getCall(0).args[0];
      assert(tweet instanceof Tweet);
      assert.equal('yo', tweet.get('hey'));
    });
  });
})