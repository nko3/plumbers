(function() {
  var pattern = {};
  var el = $('#pattern .workarea table');
  $('#pattern .toolbar :input').live('change keyup mouseup', function(ev) {
    pattern.changeSize(parseInt($(this).val(), 10));
  });

  $('#pattern').on('change', function(ev, data) {
    if (!data) { return };

    data.instruments.forEach(function(instrument) {
      if (!instrument.play) {

        if (instrument.type === 'sample') {
          // TODO: SHOW SPINNER
          freesound.createSamplePlay(instrument.id, function(err, play) {
            instrument.play = play;
          });
        }
      }
    });

    pattern.render();
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


  $('[data-path="pattern/instruments/volume"]').live('updated', function(ev, obj) {
    var el = $(this);

    ev.stopImmediatePropagation();
    // inject other bits
    obj.path = ['pattern', current, 'instruments', el.parents('tr').index(), 'volume'].join('/');
    obj.meta = {
      value : obj.payload,
      index: el.parents('tr').index(),
      pattern: current
    };

    pattern.instrumentVolume(obj);

    el.parents('.sync:first').trigger('updated', {
      path : obj.path,
      action : 'change',
      payload: obj.payload
    });

    return false;
  });

  pattern.instrumentVolume = control(/pattern.[\d]*.instruments.[\d]*.volume$/, function(obj, skipNotify) {
    if (skipNotify) {
      var parts = skipNotify.path.split('/');

      parts.pop();
      var instrumentIndex = parseInt(parts.pop(), 10);
      parts.pop()
      var patternIndex = parseInt(parts.pop(), 10);

      store.pattern[patternIndex].instruments[instrumentIndex].volume = obj;

      if (patternIndex === current) {
        $('#pattern .instrument:nth(' + instrumentIndex + ') .volume').val(skipNotify.payload);
        $('#pattern .instrument:nth(' + instrumentIndex + ') .volume').change();
      }
    } else {
      store.pattern[obj.meta.pattern].instruments[obj.meta.index].volume = obj.payload;
    }
  });



  var current = 0;
  pattern.bind = function(name, obj) {
    if (!store[name]) {
      store[name] = obj || defaults;
    }
    current = name;
    this.render();
  }

  pattern.addInstrument = control(/pattern\/[\d]*\/instruments$/, function(instrument, skipNotify) {
    if (!instrument.notes) {
      instrument.notes = [];
    }

    store.pattern[current].instruments.push(instrument);

    !skipNotify && el.trigger('updated', {
      path: 'pattern/' + current + '/instruments',
      action : 'add',
      payload : instrument
    });

    pattern.render(store.pattern[current].instruments.length-1);
  });

  pattern.removeInstrument = control(/pattern\/[\d]*\/instruments\/[\d]*$/, function(instrumentIndex, skipNotify) {
    var patternId = current;

    if (isNaN(instrumentIndex)) {
      var parts = instrumentIndex.path.split('/');
      instrumentIndex = parseInt(parts.pop(), 10);
      parts.pop();
      patternId = parseInt(parts.pop(), 10);
    }
    store.pattern[patternId].instruments.splice(instrumentIndex, 1);

    !skipNotify && el.trigger('updated', {
      path: 'pattern/'+ patternId + '/instruments/' + instrumentIndex,
      action : 'delete'
    });

    $('#pattern .workarea tr:nth(' + instrumentIndex + ')').remove();
  });

  pattern.toggleNote = control(/pattern.*notes\/[\d]*/, function(obj, skipNotify) {
    var note = $('#pattern .workarea tr:nth(' + obj.y + ') td:nth(' + obj.x + ') .note');

    var instrument = store.pattern[current].instruments[obj.y].notes[obj.x] = obj.on;

    if (obj.on) {
      note.addClass('on');
    } else {
      note.removeClass('on');
    }

    !skipNotify && el.trigger('updated', {
      path : ['pattern', current, 'instruments', obj.y, 'notes', obj.x].join('/'),
      action : 'change',
      payload : obj
    });
  }),

  pattern.changeSize = control(/pattern.*width$/, function(width, skipNotify) {
    if (width < 2 || isNaN(width)) {
      return;
    }

    sizeEl.val(width);

    store.pattern[current].width = width;
    // TODO: clean off the old bits in each instrument

    !skipNotify && el.trigger('updated', {
      path: 'pattern/' + current + '/width',
      action: 'change',
      payload: width
    });

    pattern.render();
  });

  var instrumentCache = {};

  pattern.render = function(instrument) {
    !instrument && el.html('');
    var p = store.pattern[current];
    var l = p.instruments.length;
    var i = instrument || 0;

    sizeEl.val(p.width);

    if (typeof instrument !== 'undefined') {
      l = i+1;
    }

    for (i; i<l; i++) {
      var tr = '<tr><td class="instrument sync"><input data-path="pattern/instruments/volume" type="text" class="volume knob" data-min="0" data-max="100" data-width="40" data-height="40" value="' + (p.instruments[i].volume || 50) + '" /><a href="#" class="delete">X</a> ' + (p.instruments[i].name || 'unknown') + '</td>';
      for (var j=0; j<p.width; j++) {
        var on = (p.instruments[i] && p.instruments[i].notes[j+1]) ? ' on' : '';
        tr +='<td><div class="note' + on + '"></div></td>';
      }
      tr += '</tr>';
      el.append(tr);
    }
    $('.knob').knob(defaultKnobOpts);
  };

  pattern.update = function(obj) {
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
    this.paused = false;
    var last = 0;
    window.requestAnimationFrame(function c(a) {
      !pattern.paused && window.requestAnimationFrame(c);

      var bpm = engine.getBPM();
      var now = window.performance.webkitNow();

      if (now - last > (1000*60)/(bpm*4)) {
        var rows = $('#pattern .workarea tr');
        $('td.playing', rows).removeClass('playing');
        pattern.where++;

        rows.each(function() {
          $('td:nth(' + pattern.where + ')', this).addClass('playing');
        });

        if (pattern.where > store.pattern[current].width) {
          pattern.where = 0;
        }
        last = now;


        store.pattern[current].instruments.forEach(function(instrument) {
          if (instrument.notes[pattern.where]) {
            instrument.play && instrument.play();
          }
        });


      }
    });
  };
  pattern.paused = true;
  pattern.pause = function() {
    $('td.playing').removeClass('playing');
    pattern.paused = true;
  }

  window.pattern = pattern;

})();