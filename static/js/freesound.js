(function() {
  var key = 'b11b974175724370b5bed497d23e8fea';
  var base = 'http://www.freesound.org/api/';

  window.freesound = {
    search : function(terms, fn) {
      $.getJSON(base + 'sounds/search?f=duration:[0 TO 3] type:mp3&q=' + escape(terms) + '&api_key=' + key + '&callback=?', function(d) {
        fn(null, d);
      });
    },

    preview : function(url, fn) {
      var a = new Audio();
      a.src = url;
      a.addEventListener('ended', fn);
      a.addEventListener('error', fn);
      a.load();
      a.play();
    },

    sound : function(url, fn) {
      var a = new Audio();
      a.src = url + '?api_key=' + key;
      a.load();
      fn(a);
    },

    createSamplePlay : function(id, fn) {
      var request = new XMLHttpRequest();
      request.open('GET',  "/sound/?id=" + id, true);
      request.responseType = 'arraybuffer';

      // Decode asynchronously
      request.onload = function() {
        engine.context.decodeAudioData(request.response, function(buffer) {
          var pause = function() {
            this && this.noteOff && this.noteOff(0);
          };

          var play = function(when) {

            when = when || 0;
            var source = engine.context.createBufferSource();
            source.buffer = buffer;

            // TODO: fix this, as it is leaky
            $(document).one('pause', pause.bind(source));

            var volume = this.volume || 100;
            source.gain.value = volume/100;

            source.connect(engine.destination);
            source.noteOn(when);
          }
          fn(null, play);
        }, fn);
      }
      request.send();
    }
  };
})();
