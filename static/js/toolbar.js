(function() {
  window.toolbar = {
    bpm : control(/toolbar\/bpm/, function(val) {
      $(':input[name=bpm]').val(val);
      $(':input[name=bpm]').change();
    }),
    update : function(data) {
      delete data.path;
      Object.keys(data).forEach(function(key) {
        if (this[key]) {
          this[key](data[key]);
        }
      }.bind(this));
    }
  }
})();