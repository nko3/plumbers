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
  var togglePlay = function(ev) {
    if (!ev.keyCode || (ev.which === 32 && !$(ev.target).is(':input'))) {
      ev.preventDefault();
      if (pattern.paused) {
        $(document).trigger('play');
        pattern.play();
      } else {
        pattern.pause();
        $(document).trigger('pause');
      }
      return false;
    }
  }


  $(document).on('keydown', togglePlay);
  $('#header .play').click(togglePlay);


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