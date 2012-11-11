(function() {
  var pattern = {};

  var el = $('#pattern .workarea');
  $('#pattern .toolbar :input[name=size]').live('change keyup mouseup', function(ev) {
    pattern.changeSize(parseInt($(this).val(), 10));
  });

  $('#pattern').on('change', function(ev, data) {
    pattern.render();
  });

  var sizeEl = $('#pattern .toolbar :input[name=size]');
  var addInstrumentEl = $('#pattern .toolbar a.add');
  addInstrumentEl.click(function() {
    pattern.addInstrument({ name : 'woooah' });
    return false;
  });

  $('#pattern .workarea a.delete').live('click', function() {
    var el = $(this);
    pattern.removeInstrument(el.parents('.row').index('.row'));
    return false;
  });

  $('#pattern .workarea .note').live('click', function() {
    var el = $(this);
    pattern.toggleNote({
      on: !el.hasClass('on'),
      y: el.parents('.row').index('.row'),
      x: el.index() -1
    });
  });


  $('[data-path="pattern/instruments/volume"]').live('updated', function(ev, obj) {
    var el = $(this);

    ev.stopImmediatePropagation();
    // inject other bits
    obj.path = ['pattern', current, 'instruments', el.parents('.row').index('.row'), 'volume'].join('/');
    obj.meta = {
      value : obj.payload,
      index: el.parents('.row').index('.row'),
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
      var patternIndex = parts.shift();
      var instrumentIndex = parts.shift();


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
      patternId = parts.shift();
      instrumentIndex = parts.shift();

    }

    store.pattern[patternId].instruments.splice(instrumentIndex, 1);

    !skipNotify && el.trigger('updated', {
      path: 'pattern/'+ patternId + '/instruments/' + instrumentIndex,
      action : 'delete'
    });

    $('#pattern .workarea .row:nth(' + instrumentIndex + ')').remove();
  });

  pattern.toggleNote = control(/pattern.*notes\/[\d]*/, function(obj, skipNotify) {
    var patternIndex = current;
    var instrumentIndex, noteIndex, value;

    if (skipNotify) {
      var parts = pattern.collectSegments(skipNotify.path, [1,3,5]);
      patternIndex = parts.shift();
      instrumentIndex = parts.shift();
      noteIndex = parts.shift();
      value = skipNotify.payload;
    } else {
      instrumentIndex = obj.y;
      noteIndex = obj.x;
      value = obj.on;
    }
    var note = $('#pattern .workarea .row:nth(' + instrumentIndex + ') .note:nth(' + noteIndex + ')');

    store.pattern[patternIndex].instruments[instrumentIndex].notes[noteIndex] = value;

    if (value) {
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
      payload : value,
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
      var row = '<div class="row"><div class="instrument sync"><input data-path="pattern/instruments/volume" type="text" class="volume knob" data-min="0" data-max="100" data-width="81" data-height="81" value="' + (p.instruments[i].volume || 50) + '" /><a href="#" class="delete"><img src="/img/delete.png" height="25" /></a> <span class="name">' + (p.instruments[i].name || 'unknown') + '</span></div>';
      for (var j=0; j<p.width; j++) {
        var on = (p.instruments[i] && p.instruments[i].notes[j]) ? ' on' : '';
        row +='<div class="note' + on + '"></div>';
      }
      row += '</div>';
      var trEl = $(row);
      $('.knob', trEl).knob(defaultKnobOpts).each(function() {
        $(this).addClass('knob-container');
      });
      el.append(trEl);
    }
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
        var rows = $('#pattern .workarea .row');
        $('.note.playing', rows).removeClass('playing');

        rows.each(function() {
          $('.note:nth(' + pattern.where + ')', this).addClass('playing');
        });

        last = now;

        store.pattern[current].instruments.forEach(function(instrument) {
          if (instrument.notes[pattern.where]) {
            instrument.play && instrument.play();
          }
        });

        pattern.where++;
        if (pattern.where > store.pattern[current].width) {
          pattern.where = 0;
        }


      }
    });
  };
  pattern.paused = true;
  pattern.pause = function() {
    $('.note.playing').removeClass('playing');
    pattern.paused = true;
  }

  window.pattern = pattern;

})();