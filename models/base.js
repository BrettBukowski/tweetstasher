/*
 * Base model
 */

var cradle = require('cradle')

// HELPERS

// Copies properies from provider onto receiver.
// Also includes prototype properties.
// Overwrites any existing properties.
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
  child.extend = extend;
  return child;
}

function getDBConnection(modelName) {
  this.cached || (this.cached = {});

  var name = modelName.toLowerCase() + 's';
/*   console.log('returning db connection for ' + name); */
/*   console.log(new cradle().Connection().database); */
  return this.cached[name] || (this.cached[name] = (new cradle.Connection()).database(name));
}

function callable(callback, response, error) {
  if (callback && (typeof callback.fulfill === 'function' || typeof callback.fail === 'function')) {
    if (error) {
      callback.fail(error);
    }
    else {
      callback.fulfill(response);
    }
  }
  else if (typeof callback === 'function') {
    callback(response, error);
  }
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

  save: function(callback) {
    if (!this.props._id) {
      // New

      // Timestamp the creation
      this.props.created = +new Date();

      var saved = this.props;
      this.db().save(saved, function(error, result) {
        if (error) {
          console.log('Error creating: ' + error);
          return callable(callback, null, error);
        }

        saved._id = result.id;
        callable(callback, saved);
      });
    }
    else {
      // Update existing
      this.db().merge(this.props._id, this.props, function(error, result) {
        if (error) {
          console.log('Error saving: ' + error);
          return callable(callback, null, error);
        }

        callable(callback, result);
      });
    }

    return this;
  },

  destroy: function(callback) {
    this.db().remove(this.props._id, function(error, result) {
      if (error) {
        console.log('Error removing: ' + error);
        return callable(callback, null, error);
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