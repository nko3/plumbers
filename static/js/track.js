(function() {

  window.track = {
    initialize : function initialize(data, path) {

      // start preloading all of the instrument samples

      var pending = 0, collected = 0;

      data.pattern && data.pattern.forEach(function(pattern) {
        pattern.instruments.forEach(function(instrument) {
          if (!instrument.play) {

            if (instrument.type === 'sample') {
              // TODO: SHOW SPINNER
              pending++;

              $(document).trigger('preloading');

              freesound.createSamplePlay(instrument.id, function(err, play) {
                collected++;
                $(document).trigger('preloading', { pending: pending, collected: collected });
                instrument.play = play;
              });
            }
          }
        });
      });

      // pull some stuff out of local storage
      var patternIndex = parseInt(localStorage.getItem('pattern'), 10) || 0;
      // TODO: clean this up
      $('#pattern :input.current').val(patternIndex);
      $('#pattern :input.current').change();

      var path = path || '';
      var dataPath = path.substring(1);

      if (Array.isArray(data)) {
        $('[data-path=\'' + dataPath + '\']').trigger('change', data);
      } else if (data.length) {
        // leaf

        path = path.substring(1);
        $('[data-path=\'' + dataPath + '\']').val(data);
        $('[data-path=\'' + dataPath + '\']').trigger('change', data);
      } else {
        for (var key in data) {
          initialize(data[key], path+'/'+key);
        }
      }
    }
  }
})();