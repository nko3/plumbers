// shim layer with setTimeout fallback
window.requestAnimationFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

$(function() {

  $(document).on('keydown', function(ev) {
    if (ev.which === 32 && !$(ev.target).is(':input')) {
      ev.preventDefault();
      if (pattern.paused) {
        pattern.play();
      } else {
        pattern.pause();
        $(document).trigger('pause');
      }
      return false;
    }
  });
});

(function() {

  var controls = [];

  window.control = function(regex, fn) {
    controls.push({
      regex : regex,
      fn : fn
    });

    return function() {
      fn.apply(null, arguments)
    };
  };

  window.handleUpdate = function(obj) {
    var current = controls.length;
    while(current--) {
      if (controls[current].regex.exec(obj.path)) {
        controls[current].fn(obj.payload || obj, obj);
        break;
      }
    }
  };

})();