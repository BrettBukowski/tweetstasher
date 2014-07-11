/*
 * Base model
 */

var cradle = require('cradle');
var util = require('../util');

// HELPERS


function getDBConnection(modelName) {
  this.cached || (this.cached = {});

  var name = modelName.toLowerCase() + 's';
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

var Model = util.extend({
  id: 'Model',

  constructor: function(props) {
    this.props = util.mix({}, props);
  },

  set: function(key, val) {
    if (typeof key === 'string' && typeof val !== 'undefined') {
      // Single key-value being set
      this.props[key] = val;
    }
    else if (key && typeof key === 'object' && !val) {
      this.props = util.mix(this.props, key);
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
Model.extend = util.extend;

module.exports = Model;