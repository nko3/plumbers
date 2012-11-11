(function() {
  var pattern = {


  };

  var el = $('#pattern .workarea table');
  $('#pattern .toolbar :input[name=size]').live('change keyup mouseup', function(ev) {
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

  pattern.createPattern = control(/pattern\/[\d]*/, function(obj, skipNotify) {
    // TODO: this is a potentially painful experience waiting to happen

    store.pattern.push(obj || {
      width: 8,
      instruments: []
    });

    current = store.pattern.length-1;

    !skipNotify && el.trigger('updated', {
      path: 'pattern/' + current,
      action : 'add',
      payload : store.pattern[store.pattern.length - 1]
    });

    pattern.render();
  }),

  pattern.collectSegments = function(path, array) {
    var parts = path.split('/');
    var ret = [];

    array.forEach(function(item) {
      parts[item] && ret.push(parseInt(parts[item], 10));
    });

    return ret;
  }

  pattern.instrumentVolume = control(/pattern.[\d]*.instruments.[\d]*.volume$/, function(obj, skipNotify) {
    if (skipNotify) {
      var parts = pattern.collectSegments(skipNotify.path, [1,3], true);
      var instrumentIndex = parts.pop();
      var patternIndex = parts.pop();

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
    var patternIndex = current
    if (skipNotify) {
      patternIndex = pattern.collectSegments(skipNotify.path, [1])[0];
    }

    if (!instrument.notes) {
      instrument.notes = [];
    }

    store.pattern[patternIndex].instruments.push(instrument);

    !skipNotify && el.trigger('updated', {
      path: 'pattern/' + current + '/instruments',
      action : 'add',
      payload : instrument
    });

    if (patternIndex === current) {
      pattern.render(store.pattern[current].instruments.length-1);
    }
  });

  pattern.removeInstrument = control(/pattern\/[\d]*\/instruments\/[\d]*$/, function(instrumentIndex, skipNotify) {
    var patternId = current;

    if (isNaN(instrumentIndex)) {
      var parts = pattern.collectSegments(skipNotify.path,[1,3]);

      instrumentIndex = parts.pop();
      patternId = parts.pop();
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
    var patternIndex = current;
    var instrumentIndex, noteIndex, value;

    if (skipNotify) {
      var parts = pattern.collectSegments(skipNotify.path, [1,3,5])[0];
      patternIndex = parts.pop();
      instrumentIndex = parts.pop();
      noteIndex = parts.pop();
      value = obj;
    } else {
      instrumentIndex = obj.y;
      noteIndex = obj.x;
      value = obj.on;
    }

    store.pattern[patternIndex].instruments[instrumentIndex].notes[noteIndex] = obj.on;

    if (obj.on) {
      note.addClass('on');
    } else {
      note.removeClass('on');
    }

    !skipNotify && el.trigger('updated', {
      path : [
        'pattern',
        patternIndex,
        'instruments',
        instrumentIndex,
        'notes',
        noteIndex
      ].join('/'),

      action : 'change',
      payload : obj.on,
      meta: obj
    });
  }),

  pattern.changeSize = control(/pattern.*width$/, function(width, skipNotify) {
    if (width < 2 || isNaN(width)) {
      return;
    }

    var patternIndex = current;
    if (skipNotify) {
      patternIndex = pattern.collectSegments(skipNotify.path, [1])[0]
    }

    sizeEl.val(width);

    store.pattern[patternIndex].width = width;

    !skipNotify && el.trigger('updated', {
      path: 'pattern/' + patternIndex + '/width',
      action: 'change',
      payload: width
    });

    pattern.render();
  });

  pattern.changePattern = function(index) {
    if (store.pattern[index]) {
      current = index;
      pattern.render();
      localStorage.setItem('pattern', index+1);
    }
  };

  $('#pattern .current').on('change keyup', function() {
    var el = $(this);

    var res = parseInt(el.val(), 10)-1;
    if (store.pattern[res]) {
      pattern.changePattern(res);
    }
  });

  var instrumentCache = {};

  pattern.render = function(instrument) {
    !instrument && el.html('');
    var p = store.pattern[current];
    var l = p.instruments ? p.instruments.length : 0;
    var i = instrument || 0;

    $('#pattern .total').text(store.pattern.length);
    $('#pattern .current').text(current+1);

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