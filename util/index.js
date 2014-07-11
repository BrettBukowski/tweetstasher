
function empty() {}

// Copies properies from provider onto receiver.
// Also includes prototype properties.
// Overwrites any existing properties.
function mix(receiver, provider) {
  for (var prop in provider) {
    receiver[prop] = provider[prop];
  }

  return receiver;
}

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

module.exports = {
  mix: mix,
  extend: extend
};
