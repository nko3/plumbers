var
  ecstatic = require('ecstatic')(__dirname + '/static'),
  handlers = require('./lib/handlers'),
  crypto   = require('crypto'),
  guid = require('guid'),
  db = require('mongoskin').db('user:password@ds039267.mongolab.com:39267/track?auto_reconnect=true'),
  httpHandler = function(req, res) {

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
        _id : sha
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
      socket.broadcast.to(roomName).emit(name, obj);
    });
  }


  socket.on('register', function(data) {
    var roomId = data.room;
    socket.join(data.room);
    io.sockets.in(data.room).emit('user/count', io.sockets.clients(data.room).length);
    db.collection('tracks').findOne({ _id : roomId }, function(err, rec) {
      delete rec._id;
      socket.emit('track', rec || 'null');
    });

    socket.on('control/change', function(data) {
      send('control/change', data);

      process.nextTick(function() {
        data._id = roomId;
        db.collection('tracks').save(data, function() {}, {
          upsert : true,
          multi: false,
          safe: false
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


