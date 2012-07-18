define(['lib/jquery'], function($) {
  // Displays a notice with the given message.
  // When clicked, the notice is removed, otherwise
  // it removes itself after 9 seconds.
  return function(message) {
    var note = $('<div id="notice" role="alert" aria-live="assertive" tabindex="0">' + message + '</div>').click(function() {
      $(this).remove();
    });
    setTimeout(function() {
      if (note && note.parent) {
        note.remove();
      }
    }, 9000);
    $(document.body).prepend(note).focus();
  };
})