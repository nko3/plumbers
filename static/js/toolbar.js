(function() {
  var el = $('#toolbar');


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


  $(':input.volume', el).knob({
    fgColor: defaultKnobOpts.fgColor,
    bgColor: defaultKnobOpts.bgColor,
    thickness : defaultKnobOpts.thickness,
    change : toolbar.volume,
    release : toolbar.volume
  });

  if (localStorage.getItem('volume')) {
    toolbar.volume(localStorage.getItem('volume'));
  }

})();