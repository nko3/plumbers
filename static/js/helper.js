$(function() {
  var el = $('#helper .input :input');
  var timer = null;

  el.on('keyup', function() {
    clearTimeout(timer);
    timer = setTimeout(function() {
      console.log('trigger');
      freesound.search(el.val(), function(err, data) {
        // populate the list

        var results = $('#helper .results .list');
        results.html('');

        data.sounds.forEach(function(sound) {
          console.log(sound);
          var f = sound.original_filename.replace(/\..*$/,'').replace(/[_-]/g, ' ').toLowerCase();

          results.append([
            '<li class="sample" data-url="',
            //sound.
            '" style="background: url(\'' + sound.spectral_m +'\') 50% 50% no-repeat">',
            '<a href="#" class="preview" data-url="' + sound['preview-lq-mp3'] + '">|></a> ',
            '<a href="#" class="add" data-url="' + sound.serve + '">' + f + '</a>',
            '</li>'
          ].join(''));
        });
      });
    }, 300);
  });

  // TODO: hide the helper

  $('#helper .results li.sample a.add').live('click', function() {
    var sample = $(this);
    freesound.sound(sample.data('url'), function(sound) {
      // TODO: cache
      pattern.addInstrument({
        name: sample.text(),
        type: 'sample',
        url: sample.data('url'),
        play : function() {
          sound.cloneNode().play();
        }
      });
    });
    return false;
  });

  $('#helper .results li.sample a.preview').live('click', function() {
    var el = $(this);
    el.parents('li').addClass('playing');
    freesound.preview(el.data('url'), function() {
      console.log('DONE')
      el.parents('li').removeClass('playing');
    });

    return false;
  });

  window.helper = {}

});