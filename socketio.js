const database = require('./database');

const User = database.User;
const Board = database.Board;

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('a user connected');
    const user = new User({
      socketid: socket.id,
    });
    user.save((err, user) => {
      if (err) console.log(err);
    });

    socket.on('disconnect', () => {
      console.log('a user disconnected');

      User.findOneAndRemove({ socketid: socket.id }, (err, user) => {
        if (err) console.log("could not delete user");
        console.log(user);
        if (user.roomname) {
          io.in(roomname).emit('exit game');
        }
      });
    });

    socket.on('set username', (username, callback) => {
      // check to see if anyone has that username
      if (username === '') {
        callback('error', 'Empty string');
        return;
      }
      User.findOne({ username }, (err, user) => {
        if (user) {
          callback('error', 'Someone else has that username!');
          return;
        }
        // find user to add username to
        User.findOne({ socketid: socket.id }, (err, user) => {
          // check if user currently has a username
          if (!(user.username)) {
            user.username = username;
            // save user with new username
            user.save((err, updatedUser) => {
              console.log(updatedUser.username);
              if (err) console.log(err);
            });
          } else {
            callback('error', 'You have already set a username!');
          }
        });
      });
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
      users[socket.id][3] = 0;
      users[usernames[otherUsername]][3] = 1;
      socket.join(`room${roomNumber}`);
      users[usernames[otherUsername]][0].join(`room${roomNumber}`);
      io.in(`room${roomNumber}`).emit('join game', `You have joined room ${roomNumber}`);
      console.log(`created game: ${roomNumber}`);
    });

    socket.on('leave room', (callback) => {
      // User.findOneAndDelete({ }) // TODO
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
        currentTurn: 0,
        playerOneBoard: [4, 4, 4, 4, 4, 4, 0],
        playerTwoBoard: [4, 4, 4, 4, 4, 4, 0],
      });
      Board.remove({ roomNumber }, () => {});
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
        let boardArray;
        let goAgain;
        [boardArray, goAgain] = board.move(1, move); // TODO playerNumber
        const row = goAgain ? board.row : (board.row + 1) % 2;
        const doc = {
          row,
          playerOneBoard: boardArray[0],
          playerTwoBoard: boardArray[1],
        };
        Board.findOneAndUpdate({ roomNumber }, doc, (err, raw) => {
          if (err) {
            console.log("err");
            console.log(raw);
          }
        });
        io.in(users[socket.id][2]).emit('board', boardArray);
      });
    });
  });
};
