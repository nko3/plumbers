(function() {
  window.progress = {
    show : function(message) {
      $('#overlay').show();
    },
    update : function(obj) {
      var percent = Math.floor((obj.collected/obj.pending)*100) + '%';

      $('#overlay .progress .inner .percent').text(percent);

      $('#overlay .progress .bar').css('width', percent);


    },
    hide : function() {
      $('#overlay .progress').fadeOut('slow', function() {
        $('#overlay').fadeOut(function() {
          progress.update({ collected: 0, pending: 1 });
          $('#overlay .progress').show();
        });
      });
    }
  }


  $(document).bind('preloading', function(ev, obj) {
    if (!obj) {
      progress.show();
    } else if (obj.pending <= obj.collected) {
      progress.update(obj);
      progress.hide();
    } else {
      progress.update(obj);
    }
  });


})();