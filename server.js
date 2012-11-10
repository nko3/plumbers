var
  ecstatic = require('ecstatic')(__dirname + '/static'),
  handlers = require('./lib/handlers'),
  crypto   = require('crypto'),
  guid = require('guid'),
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

// TODO: write to DB

      res.writeHead(302, {
        Location: '/track/' + sha,
        'Content-length': ('/track/' + sha).length,
        'Content-type': 'text/plain'
      });

      res.end('/track/' + sha);
      return;
    }

    ecstatic(req, res);
  },
  server = require('http').createServer(httpHandler),
  io = require('socket.io').listen(server);

server.listen(8000);

io.sockets.on('connection', function(socket) {

  socket.on('register', function(data) {
    socket.join(data.room);
    io.sockets.in(data.room).emit('user/count', io.sockets.clients(data.room).length);
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


