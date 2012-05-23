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
  return typeof callback === 'function' && callback(result);
}


// BASE MODEL

var Model = extend({  
  constructor: function(props) {
    this.props = mix({}, props);    
  },

  save: function(callback, promise) {
    if (!this.props._id) {
      // Timestamp the creation
      this.props.created || this.props.created = +new Date();

      Model.db().save(this.props, function(error, result) {
        if (error) {
          console.log('Error creating: ' + error);
          if (promise) return promise.fail(error);
        }
        
        callable(callback, result) || (promise && promise.fulfill(this.props));
      });
    }
    else {
      Model.db().merge(this.props._id, this.props, function(error, result) {
        if (error) {
          console.log('Error saving: ' + error);
        }
        
        callable(callback, result);
      });
    }
    
    return this;
  }
}, {
  id: 'Model',
  db: function(name) {
    return getDBConnection(name || Model.id);
  }
});
Model.extend = extend;

module.exports = Model;