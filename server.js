var
  ecstatic = require('ecstatic')(__dirname + '/static'),
  handlers = require('./lib/handlers'),
  crypto   = require('crypto'),
  guid = require('guid'),
  key = 'b11b974175724370b5bed497d23e8fea',
  base = 'http://www.freesound.org/api/',
  qs = require('querystring'),
  request = require('request'),
  db = require('mongoskin').db('user:password@ds039267.mongolab.com:39267/track?auto_reconnect=true'),
  httpHandler = function(req, res) {

    if (req.url.substring(0,6) === '/sound') {
      var parts = qs.parse(req.url.split('?').pop());
      console.log(base + 'sound/' + parts.id + '/serve?api_key=' + key);
      request(base + 'sounds/' + parts.id + '/serve?api_key=' + key).pipe(res);
      return;
    }

    if (req.method === 'GET' && req.url !== '/' && req.url.split('.').length === 1) {
      if (req.url.indexOf('/track/') === 0 && req.url.length > 7) {
        req.url = '/track.html'
      } else {
        req.url = req.url + '.html';
      }
    }

    if (req.method === 'POST' && req.url === '/track') {
      var shasum = crypto.createHash('sha1');
      shasum.update(guid.create().toString());
      var sha = shasum.digest('hex');

      db.collection('tracks').insert({
        _id : sha,
        pattern : [
          {
            width : 12,
            instruments : []
          }
        ]
      }, function() {

        res.writeHead(302, {
          Location: '/track/' + sha,
          'Content-length': ('/track/' + sha).length,
          'Content-type': 'text/plain'
        });

        res.end('/track/' + sha);
      });
      return;
    }

    ecstatic(req, res);
  },
  server = require('http').createServer(httpHandler),
  io = require('socket.io').listen(server);

server.listen(8000);

io.sockets.on('connection', function(socket) {
  var send = function(name, obj) {
    Object.keys(socket.manager.rooms).forEach(function(roomName) {
      if (roomName) {
        console.log('BROADCAST', roomName);
        socket.broadcast.to(roomName.replace('/','')).emit(name, obj);
      }
    });
  }

  socket.on('register', function(data) {
    var roomId = data.room;
    socket.join(data.room);
    io.sockets.in(data.room).emit('user/count', io.sockets.clients(data.room).length);
    db.collection('tracks').findOne({ _id : roomId }, function(err, rec) {
      if (rec) {
        delete rec._id;
        socket.emit('track', rec || 'null');
      }
    });

    socket.on('control/change', function(data) {
      console.log('control/change', data);
      send('control/change', data);

      process.nextTick(function() {

        db.collection('tracks').findOne({ _id : roomId }, function(err, rec) {
          if (!data.path) { return; }
          var where = rec;
          var parts = data.path.split('/');
          var action = data.action;
          var last = parts.pop();

          parts.forEach(function(part) {
            if (isNaN(part)) {
              if (where && !where[part]) {
                where[part] = {};
              }
              where = where[part];
            } else if (!where[part]) {
              where[part] = [];
              where = where[part];
            } else {
              where = where[parseInt(part, 10)];
            }
          });

          if (action === 'change') {
            if (isNaN(last)) {
              where[last] = data.payload;
            } else {
              where[parseInt(last, 10)] = data.payload;
            }
          } else if (action === 'delete') {
            console.log(where, last);
            if (Array.isArray(where)) {
              where.splice(last, 1);
            } else {
              delete where[last];
            }
          } else if (action === 'add') {
            if (!Array.isArray(where[last])) {
              where[last] = data.payload;
            } else {
              console.log('add array')
              where[last].push(data.payload);
            }
          }

          db.collection('tracks').save(rec, function() {}, {
            upsert : true,
            multi: false,
            safe: false
          });
        });
      });
    });
  });

  socket.on('disconnect', function() {
    if (socket.manager.rooms) {
      var rooms = socket.manager.rooms;
      Object.keys(rooms).forEach(function(roomName) {
        if (!roomName) { return; }
        socket.leave(roomName);

        process.nextTick(function() {
          if (io.sockets.manager.rooms[roomName]) {
            io.sockets.in(roomName.substring(1)).emit('user/count', io.sockets.manager.rooms[roomName].length);
          }
        });
      });
    }
  });
});
