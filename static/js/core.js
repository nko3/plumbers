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
    console.log('ev', ev);
    if (ev.which === 32) {
      if (pattern.paused) {
        pattern.play();
      } else {
        pattern.pause();
      }
    }
  });
})
