define(['lib/underscore'], function(_) {
  var dateParts = [
      { unit: 60, label: '%d minute(s) ago' }
    , { unit: 60, label: '%d hour(s) ago' }
    , { unit: 24, label: '%d day(s) ago' }
    , { unit:  7, label: '%d week(s) ago' }
    , { unit:  4, label: '%d month(s) ago' }
    , { unit: 12 }
  ];

  // Makes a relative date out of the given timestamp or Date.
  // Uses dateParts to construct a string.
  return function(time) {
    if (_.isNumber(time)) {
      time = new Date(time);
    }

    var diff = (new Date() - time) / 1000
      , label
      , relative;

    if (diff < 60) return 'moments ago';

    relative = _.find(dateParts, function(item, index, list) {
      diff /= item.unit;
      if (list[index + 1] && diff < list[index + 1].unit) {
        return true;
      }
    });

    if (relative) {
      label = relative.label;
      diff = Math.round(diff);

      return label.replace('(s)', (diff === 1) ? '' : 's').replace('%d', diff);
    }

    return time.toLocaleDateString();
  };
});