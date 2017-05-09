const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
require('./routes')(app);
const Game = require('./mancala');

const usernames = {}; // username    -> socket.id
const users = {};     // socket.id   -> [socket, username, roomname]
const rooms = [];     // room+number -> [socket, socket, game]

const game = new Game();
game.start();

io.on('connection', (socket) => {
  console.log('a user connected');
  users[socket.id] = [socket, null, null];

  socket.on('disconnect', () => {
    console.log('a user disconnected');

    const username = users[socket.id][1];
    const roomName = users[socket.id][2];

    io.in(roomName).emit('exit game');
  });

  socket.on('set username', (userName, callback) => {
    if (!(userName in usernames) && users[socket.id][1] === null) {
      usernames[userName] = socket.id;
      users[socket.id][2] = userName;
      console.log(`Username: ${userName}`);
    } else {
      callback('error', 'You have already set a username!');
      console.log(`Error: ${userName}`);
    }
  });

  socket.on('create game', (otherUsername, callback) => {
    if (!(otherUsername in usernames)) {
      callback('error', 'This is not a valid player!');
      return;
    }
    // adds two users to room
    const roomNumber = (rooms.indexOf(null) === -1) ? rooms.length : rooms.indexOf(null);
    rooms[roomNumber] = [socket, users[usernames[otherUsername]][0]];
    users[socket.id][2] = `room${roomNumber}`;
    users[usernames[otherUsername]][2] = `room${roomNumber}`;
    socket.join(`room${roomNumber}`);
    users[usernames[otherUsername]][0].join(`room${roomNumber}`);
    io.in(`room${roomNumber}`).emit('join game', `You have joined room ${roomNumber}`);
    console.log(`created game: ${roomNumber}`);
  });

  socket.on('leave room', (callback) => {
    if (socket.id in users && users[socket.id][2]) {
      users[socket.id][2] = null;
      console.log('left');
    } else {
      console.log('a');
      callback('error', "you're not in a room");
    }
  });

  socket.on('get board', () => {
    this.board = [[1, 2, 3], [2, 3, 4]];
    socket.emit('board', this.board);
  });

  socket.on('make move', (move, callback) => {
    if (users[socket.id][3]) {
      callback('invalid', 'the move was invalid');
    }
    this.board = [[1, 2, 3], [2, 3, 4]];
    setTimeout(() => {
      io.in(users[socket.id][2]).emit('board', this.board);
    }, 5000);
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
