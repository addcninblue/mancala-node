// set up mongoose
const mongoose = require('mongoose');
// // q
// mongoose.Promise = require('q').Promise;
// // native promises
// mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/mancala'); // DEV
mongoose.connect(mongodbUri, options); // PRODUCTION; key redacted
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// board schema
const boardSchema = mongoose.Schema({
  roomname: { type: String, unique: true },
  currentTurn: Number,
  playerOneBoard: [Number],
  playerTwoBoard: [Number],
  playerOneId: String,
  playerTwoId: String,
  playerOneName: String,
  playerTwoName: String,
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
  let goAgain = false;
  if (row === initialRow) {
    if (position === 6) {  // if ends up in own space
      goAgain = true;
    } else if (board[row][position] === 1 && board[(row + 1) % 2][numCols - position - 2] > 0) {
      board[row][6] += board[row][position] + board[(row + 1) % 2][numCols - position - 2];
      board[row][position] = 0;
      board[(row + 1) % 2][numCols - position - 2] = 0;
      goAgain = false;
    }
  }
  return [board, goAgain];
};

boardSchema.methods.getBoard = function () {
  return [this.playerOneBoard, this.playerTwoBoard];
};

const Board = mongoose.model('Board', boardSchema);
db.on('error', console.error.bind(console, 'connection error:'));

// users schema
const userSchema = mongoose.Schema({
  socketid: { type: String, unique: true },
  username: String,
  roomname: String,
});

userSchema.methods.getSocket = function (io) {
  return io.sockets.connected[this.socketid];
};

const User = mongoose.model('User', userSchema);
db.on('error', console.error.bind(console, 'connection error:'));

Board.remove({}, function(err) {
  console.log('users cleared');
});

User.remove({}, function(err) {
  console.log('boards cleared');
});

module.exports = {
  Board,
  User,
};
