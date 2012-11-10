(function() {
  var store = {
    initial : {
      width : 12,
      instruments : []
    }
  };

  var el = $('#pattern .workarea table');
  $('#pattern .toolbar :input').live('change keyup mouseup', function(ev) {
    console.log('change event');
    pattern.changeSize(parseInt($(this).val(), 10));
  });
  var sizeEl = $('#pattern .toolbar :input[name=size]');
  var addInstrumentEl = $('#pattern .toolbar a.add');
  addInstrumentEl.click(function() {
    pattern.addInstrument({ name : 'woooah' });
    return false;
  });

  $('#pattern .workarea td a.delete').live('click', function() {
    var el = $(this);
    pattern.removeInstrument(el.parents('tr').index());
    return false;
  });

  $('#pattern .workarea td .note').live('click', function() {
    var el = $(this);
    pattern.toggleNote({
      on: !el.hasClass('on'),
      y: el.parents('tr').index(),
      x: el.parents('td').index()
    });
  });


  var defaults = {
    width : 12,
    instruments : []
  };

  var pattern = {};
  var current = 'initial';
  pattern.bind = function(name, obj) {
    if (!store[name]) {
      store[name] = obj || defaults;
    }
    current = name;
    this.render();
  }

  pattern.addInstrument = function(instrument, skipNotify) {
    if (!instrument.notes) {
      instrument.notes = [];
    }

    store[current].instruments.push(instrument);

    !skipNotify && this.notify({
      method : 'add',
      instrument : instrument
    });

    this.render(store[current].instruments.length-1);
  };

  pattern.removeInstrument = function(instrumentIndex, skipNotify) {
    store[current].instruments.splice(instrumentIndex, 1);

    !skipNotify && this.notify({
      method : 'remove',
      instrument : instrumentIndex
    });

    $('#pattern .workarea tr:nth(' + instrumentIndex + ')').remove();
  };

  pattern.toggleNote = function(obj, skipNotify) {
    var note = $('#pattern .workarea tr:nth(' + obj.y + ') td:nth(' + obj.x + ') .note');

    var instrument = store[current].instruments[obj.y].notes[obj.x] = obj.on;

    if (obj.on) {
      note.addClass('on');
    } else {
      note.removeClass('on');
    }

    !skipNotify && this.notify({
      method : 'toggle',
      note : obj
    });
  },

  pattern.changeSize = function(width, skipNotify) {
    if (width < 2 || isNaN(width)) {
      return;
    }

    sizeEl.val(width);

    store[current].width = width;
    // TODO: clean off the old bits in each instrument

    !skipNotify && this.notify({
      method: 'change',
      size: width
    });

    this.render();
  };

  pattern.render = function(instrument) {
    !instrument && el.html('');
    var p = store[current];
    var l = p.instruments.length;
    var i = instrument || 0;

    if (typeof instrument !== 'undefined') {
      l = i+1;
    }
console.log(instrument, i, l);
    for (i; i<l; i++) {
      var tr = '<tr><td class="instrument"><a href="#" class="delete">X</a> ' + (p.instruments[i].name || 'unknown') + '</td>';
      for (var j=0; j<p.width; j++) {
        var on = (p.instruments[i] && p.instruments[i][j]) ? ' on' : '';
        tr +='<td><div class="note' + on + '"></div></td>';
      }
      tr += '</tr>';
      el.append(tr);
    }
  };

  pattern.notify = function(changeHash) {
    el.trigger('updated', {
      path : 'pattern/' + current,
      changes : [changeHash]
    });
  };

  pattern.update = function(obj) {
    console.log('ready to update pattern')
    var patternName = obj.path.split('/')[1];

    // update
    obj.changes.forEach(function(change) {
      var last = Object.keys(change)[1];
      var cased = last.substring(0,1).toUpperCase() + last.substring(1);
      this[change.method + cased](change[last], true);

    }.bind(this));
  };


  pattern.where = 0;
  pattern.play = function() {
    pattern.where = 0;
    console.log('play');
    this.paused = false;
    var last = 0;
    window.requestAnimationFrame(function c(a) {
      !pattern.paused && window.requestAnimationFrame(c);

      var bpm = engine.getBPM();
      var now = window.performance.webkitNow();

      if (now - last > (1000*60)/(bpm*4)) {

        store[current].instruments.forEach(function(instrument) {
          if (instrument.notes[pattern.where]) {
            instrument.play();
          }
        });

        var rows = $('#pattern .workarea tr');
        rows.each(function() {
          $('td:nth(' + pattern.where + ')', this).removeClass('playing');
        });
        pattern.where++;

        rows.each(function() {
          $('td:nth(' + pattern.where + ')', this).addClass('playing');
        });

        if (pattern.where > store[current].width) {
          pattern.where = 0;
        }
        last = now;
      }


    });
  };
  pattern.paused = true;
  pattern.pause = function() {
    console.log('pause');
    $('td.playing').removeClass('playing');
    pattern.paused = true;
  }

  window.pattern = pattern;

})();