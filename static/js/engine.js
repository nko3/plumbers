(function() {
  function Engine() {
    this.context = new webkitAudioContext();
    this.gain = this.context.createGainNode();
    this.gain.connect(this.context.destination);
    this.destination = this.gain;
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