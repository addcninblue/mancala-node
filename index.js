const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
require('./routes')(app);
// const Game = require('./mancala');

const usernames = {}; // username    -> socket.id
const users = {};     // socket.id   -> [socket, username, roomname]
const rooms = [];     // room+number -> [socket, socket, game]

// set up mongoose
mongoose.connect('mongodb://localhost/boards');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
const boardSchema = mongoose.Schema({
  roomNumber: Number,
  playerOneBoard: [Number],
  playerTwoBoard: [Number],
});

boardSchema.methods.move = function (initialRow, initialPosition) {
  const board = [this.playerOneBoard, this.playerTwoBoard];
  const numCols = 7;
  let position = initialPosition;
  let row = initialRow;
  let stones = board[row][position];
  board[row][position] = 0;
  while (stones > 0) {
    position += 1;
    if (row !== initialRow && position === numCols - 1) { // if ends up in enemy home
      position += 1;
    }
    row = (row + Math.floor(position / numCols)) % 2; // integer division
    position %= numCols;
    board[row][position] += 1;
    stones -= 1;
  }
  if (row === initialRow) {
    if (position === 6) {  // if ends up in own space
      return [board, false];
    } else if (board[row][position] === 0 && board[(row + 1) % 2][numCols - position - 2] > 0) {
      board[row][6] += board[row][position] + board[(row + 1) % 2][numCols - position - 2];
      board[row][position] = 0;
      board[(row + 1) % 2][numCols - position - 2] = 0;
      return [board, true];
    }
  }
  return [board, true];
};

boardSchema.methods.getBoard = function () {
  return [this.playerOneBoard, this.playerTwoBoard];
};

const Board = mongoose.model('Board', boardSchema);
db.on('error', console.error.bind(console, 'connection error:'));

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

  socket.on('start game', () => {
    const roomNumber = users[socket.id][2].substring(4);
    const board = new Board({
      roomNumber,
      playerOneBoard: [4, 4, 4, 4, 4, 4, 0],
      playerTwoBoard: [4, 4, 4, 4, 4, 4, 0],
    });
    board.save((err, board) => {
      if (err) console.error(err);
      console.log([board.playerOneBoard, board.playerTwoBoard]);
    });
  });

  socket.on('get board', () => {
    this.board = [[1, 2, 3], [2, 3, 4]];
    socket.emit('board', this.board);
  });

  socket.on('make move', (move, callback) => {
    const roomNumber = users[socket.id][2].substring(4);
    if (users[socket.id][3]) {
      callback('invalid', 'the move was invalid');
      return;
    }
    Board.findOne({ roomNumber }, (err, board) => {
      let goAgain;
      [board, goAgain] = board.move(1, move); // TODO playerNumber
      io.in(users[socket.id][2]).emit('board', board);
    });
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
