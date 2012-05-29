/*
 * Base model
 */

var cradle = require('cradle')

// HELPERS

// Copies properies from provider onto receiver.
// Also includes prototype properties.
function mix(receiver, provider) {
  for (var prop in provider) {
    receiver[prop] = provider[prop];
  }

  return receiver;
}
 
function empty() {}

// Creates subclasses, setting up the prototype chain.
// Basically Backbone's inherits helper. 
function inherit(parent, props, statics) {
  var child = (props && props.hasOwnProperty('constructor'))
    ? props.constructor
    : function() { parent.apply(this, arguments); };
     
  // Inherit static properies
  child = mix(child, parent);
   
  // Make child's proto chain inherit from
  // parent's without calling parent's constructor
  empty.prototype = parent.prototype;
  child.prototype = new empty();
   
  if (props) {
    child.prototype = mix(child.prototype, props);
  }
  if (statics) {
    child = mix(child, statics);
  }
   
  child.prototype.constructor = child;
   
  child.__super__ = parent.prototype;
   
  return child;
}

function extend(props, staticProps) {
  var child = inherit(this, props, staticProps);
  child.extend = this;
  return child;
}

function getDBConnection(modelName) {
  this.cached || (this.cached = {});

  var name = modelName.toLowerCase() + 's';
  console.log('returning db connection for ' + name);
  return this.cached[name] || (this.cached[name] = (new cradle.Connection()).database(name));
}

function callable(callback, result) {
  console.log('callback');
  return typeof callback === 'function' && callback(result);
}


// BASE MODEL

var Model = extend({
  id: 'Model',
  
  constructor: function(props) {
    this.props = mix({}, props);
  },
  
  set: function(key, val) {
    if (typeof key === 'string' && typeof val !== 'undefined') {
      // Single key-value being set
      this.props[key] = val;
    }
    else if (key && typeof key === 'object' && !val) {
      this.props = mix(this.props, key);
    }
    
    return this;
  },
  
  get: function(key) {
    if (typeof key === 'undefined') {
      return this.props;
    }
    
    return this.props[key];
  },

  save: function(callback, promise) {
    if (!this.props._id) {
      // New
      
      // Timestamp the creation
      this.props.created || (this.props.created = +new Date());
      
      var saved = this.props;
      this.db().save(saved, function(error, result) {
        if (error) {
          console.log('Error creating: ' + error);
          if (promise) return promise.fail(error);
        }

        saved._id = result.id;
        callable(callback, saved) || (promise && promise.fulfill(saved));
      });
    }
    else {
      // Update existing
      this.db().merge(this.props._id, this.props, function(error, result) {
        if (error) {
          console.log('Error saving: ' + error);
        }
        
        callable(callback, result);
      });
    }

    return this;
  },
  
  destroy: function(callback) {
    this.db().remove(this.props._id, function(error, result) {
      if (error) {
        console.log(error);
      }
      callable(callback, result);
    });
  },
  
  db: function() {
    return this.dbConnection || (this.dbConnection = getDBConnection(this.id));
  },
  
  view: function(name, key, callback) {
    this.db().view(this.id.toLowerCase() + '/' + name, { key: key }, callback);
  }
});
Model.extend = extend;

module.exports = Model;