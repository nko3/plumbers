(function() {
  function Engine() {
    this.context = new webkitAudioContext();


  };

  Engine.prototype = {

    play : function() {

    },

    getBPM : function() {
      return parseInt($(':input[name=bpm]').val(), 10);
    }

  };


  window.engine = new Engine();

})();