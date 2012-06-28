var assert = require('assert')
  , sinon = require('sinon')
  , sandboxed = require('sandboxed-module');
  
describe('Base model tests', function() {
  var dbMethods = {
      save: function() {}
    , merge: function() {}
    , remove: function() {}
    , view: function() {}
  };
  
  var save = sinon.spy(dbMethods, 'save')
    , merge = sinon.spy(dbMethods, 'merge')
    , remove = sinon.spy(dbMethods, 'remove')
    , view = sinon.spy(dbMethods, 'view');
  
  var CradleMock = {
    Connection: function() {
      return {
        database: function() {
          return dbMethods;
        }
      }
    }
  };
  
  var connection = sinon.spy(CradleMock, 'Connection');
  
  var Base = sandboxed.require('../../models/base', {
      requires: {cradle: CradleMock}
  });


  beforeEach(function() {
    save.reset();
    merge.reset();
    remove.reset();
    view.reset();
    connection.reset();
  });
  
  describe('Inheritance', function() {
    var child = Base.extend({
        id: 'Child'
      , set: function() { console.log('overrides parent') }
    });

    it('Sets the prototype chain properly', function() {      
      assert(new child instanceof Base);
    });

    it('Allows child to override parent instance properties', function() {
      var instance = new child;      
      assert.equal('Child', instance.id);
      assert.notEqual(instance.set.toString(), new Base().set.toString());
    });

    it('Properly inherits static properties', function() {      
      var parent = Base.extend({}, {
          a: ['foo', 'bar']
        , b: 'banana'
      });
      var extendingFrom = parent.extend({}, {
          a: [1, 2, 3]
      });
      assert.deepEqual(parent.b, extendingFrom.b);
      assert.deepEqual([1, 2, 3], extendingFrom.a);
    });
  });

  describe('Methods', function() {
    it('Sets and gets properties', function() {
      var model = new Base;
      model.set('foo', 'bar');
      assert.equal('bar', model.get('foo'));
      model.set('foo', 'banana');
      assert.equal('banana', model.get('foo'));
    });

    it('Sets and gets properties in mass assigment', function() {
      var model = new Base;
      
      model.set({'foo': 'bar', 'banana': 'no'});
      assert.equal('bar', model.get('foo'));
      assert.equal('no', model.get('banana'));
      model.set({'foo': 'no'});
      assert.deepEqual({'foo': 'no', 'banana': 'no'}, model.get());
    });
     
    it('#db returns a database connection', function() {
      var model = new Base;
      
      assert.deepEqual(model.db(), dbMethods);
      assert(connection.calledOnce);
    });
    
    describe('#save', function() {
      it('Creates a new record', function() {
        new Base({foo: 'banana'}).save();
        
        assert(save.calledOnce);
        
        var args = save.getCall(0).args;
        
        assert(args[0].created !== 'undefined');
        assert.equal('banana', args[0].foo);
        assert(typeof args[0].id === 'undefined');
        assert(typeof args[0]._id === 'undefined');
        assert(typeof args[1] === 'function');
      });
  
      it('Updates an existing record', function() {
        new Base().set({_id: 123, foo: 'banana'}).save();
        
        assert(merge.calledOnce);
        
        var args = merge.getCall(0).args;
        
        assert.equal(123, args[0]);
        assert(typeof args[1].created === 'undefined');
        assert.equal('banana', args[1].foo);
        assert(typeof args[2] === 'function');
      });
  
      it('Calls a callback when complete', function() {
        var callback = sinon.spy();
        new Base().save(callback);
        
        assert(save.calledOnce);
        // db.save calls the user-specified callback if error or success.
        var saveCallback = save.getCall(0).args[1];
        saveCallback(null, {id: 'yep'});
        
        assert(callback.calledOnce);
        
        var args = callback.getCall(0).args;
        
        assert.equal('yep', args[0]._id);
        assert(typeof args[0].created !== 'undefined')
      });
      
      it('Calls a callback when erroring', function() {
        var callback = sinon.spy();
        new Base().save(callback);
        
        assert(save.calledOnce);
        // db.save calls the user-specified callback if error or success.
        var saveCallback = save.getCall(0).args[1];
        saveCallback("error message", {id: 'yep'});
        
        assert(callback.calledOnce);
        
        var args = callback.getCall(0).args;
        assert.equal(null, args[0]);
        assert.equal('error message', args[1]);
      });
      
      it('Fulfills a promise when complete', function() {
        var promise = { fulfill: function() {} };
        var callback = sinon.spy(promise, 'fulfill');
        new Base().save(callback);
        
        assert(save.calledOnce);
        // db.save calls the user-specified callback if error or success.
        var saveCallback = save.getCall(0).args[1];
        saveCallback(null, {id: 'yep'});
        
        assert(callback.calledOnce);
        
        var args = callback.getCall(0).args;
        
        assert.equal('yep', args[0]._id);
        assert(typeof args[0].created !== 'undefined');
      });

      it('Fails a promise when erroring', function() {
        var promise = { fail: function() {} };
        var callback = sinon.spy(promise, 'fail');
        new Base().save(callback);
        
        assert(save.calledOnce);
        // db.save calls the user-specified callback if error or success.
        var saveCallback = save.getCall(0).args[1];
        saveCallback("error message", {id: 'yep'});
        
        assert(callback.calledOnce);
        
        var args = callback.getCall(0).args;
        
        assert.equal(null, args[0]);
        assert.equal('error message', args[1]);
      });
    });
    
    describe('#destroy', function() {
      it('Removes the record', function() {
        new Base({_id: 'kill'}).destroy();
      
        assert(remove.calledOnce);
        assert.equal('kill', remove.getCall(0).args[0]);
      });

      it('Calls a callback when complete', function() {
        var callback = sinon.spy();
        new Base({_id: 'kill'}).destroy(callback);
      
        assert(remove.calledOnce);
        var removeCallback = remove.getCall(0).args[1];
        removeCallback(null, {id: 'yep'});
        assert(callback.calledOnce);
      });

      it('Calls a callback when erroring', function() {
        var callback = sinon.spy();
        new Base({_id: 'kill'}).destroy(callback);
      
        assert(remove.calledOnce);
        var removeCallback = remove.getCall(0).args[1];
        removeCallback('error');
        assert(callback.calledOnce);
      });
      
      it('Fulfills a promise when complete', function() {
        var promise = { fulfill: function() {} };
        var callback = sinon.spy(promise, 'fulfill');
        new Base().destroy(callback);
        
        assert(remove.calledOnce);
        // db.save calls the user-specified callback if error or success.
        var removeCallback = remove.getCall(0).args[1];
        removeCallback(null, {id: 'yep'});
        assert(callback.calledOnce);        
      });

      it('Fails a promise when erroring', function() {
        var promise = { fail: function() {} };
        var callback = sinon.spy(promise, 'fail');
        new Base().destroy(callback);
        
        assert(remove.calledOnce);
        // db.save calls the user-specified callback if error or success.
        var removeCallback = remove.getCall(0).args[1];
        removeCallback("error message");
        assert(callback.calledOnce);
      });
    });
    
    describe('#view', function() {
      it('Executes the callback with the report', function() {
        var callback = function(result) { return result; };
        new Base().view('Name', 'banana', callback);
        
        assert(view.calledOnce);
        var args = view.getCall(0).args;
        assert.equal('model/Name', args[0]);
        assert.deepEqual({key: 'banana'}, args[1]);
        assert.equal(callback.toString(), args[2].toString());
      });
    });
  });
})