(function() {

  window.track = {
    initialize : function initialize(data, path) {
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