const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
require('./routes')(app); // maps which url should go where
require('./socketio')(io); // websocket handler

http.listen(3000, () => {
  console.log('listening on *:3000');
});
