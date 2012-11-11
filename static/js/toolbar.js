$(function() {
  var preloadPause = new Image();
  preloadPause.src = '/img/pause.png';

  $(document).on('play', function() {
    $('#header a.play img').attr('src', '/img/pause.png');
  });


  $(document).on('pause', function() {
    $('#header a.play img').attr('src', '/img/play.png');
  });


  var el = $('#header #toolbar');


  window.toolbar = {
    bpm : control(/toolbar\/bpm/, function(val) {
      $(':input[name=bpm]', el).val(val);
      $(':input[name=bpm]', el).change();
    }),
    volume : function(val) {
      localStorage.setItem('volume', val);

      val = parseInt(val);

      $(':input[name=volume]', el).val(val);
      $(':input[name=volume]', el).change();
      engine.gain.gain.value = val/100;
    },
    update : function(data) {
      delete data.path;
      Object.keys(data).forEach(function(key) {
        if (this[key]) {
          this[key](data[key]);
        }
      }.bind(this));
    }
  };

  if (localStorage.getItem('volume')) {
    toolbar.volume(localStorage.getItem('volume'));
  }

});