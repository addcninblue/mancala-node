const database = require('./database');

const User = database.User;
const Board = database.Board;

module.exports = (io) => {
  function randomString(length) {
    return (Math.random().toString(36) + '00000000000000000').slice(2, length + 2);
  }
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
        if (user.roomname) {
          Board.findOneAndRemove({ roomname: user.roomname }, (err, board) => {
          });
          io.in(user.roomname).emit('exit game');
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
              console.log('new user: ' + updatedUser.username);
              callback('success', 'Username set');
              if (err) console.log(err);
            });
          } else {
            callback('error', 'You have already set a username!');
          }
        });
      });
    });

    socket.on('create game', (otherUsername, callback) => {
      User.findOne({ socketid: socket.id }, (err, user) => {
        if (user) {
          User.findOne({ username: otherUsername }, (err, user2) => {
            if (!user2) {
              callback('Err', 'Invalid user!');
              return;
            } else if (user.roomname) {
              callback('Err', `${user.username} is already in a room!`);
              return;
            } else if (user2.roomname) {
              callback('Err', `${user2.username} is already in a room!`);
              return;
            }
            const roomname = randomString(15);
            const board = new Board({
              roomname,
              currentTurn: 0,
              playerOneBoard: [4, 4, 4, 4, 4, 4, 0],
              playerTwoBoard: [4, 4, 4, 4, 4, 4, 0],
              playerOneId: user.socketid,
              playerTwoId: user2.socketid,
            });
            user.roomname = roomname;
            user.save((err, user) => {
              if (err) console.log(err);
            });
            user2.roomname = roomname;
            user.save((err, user) => {
              if (err) console.log(err);
            });
            board.save((err, board) => {
              console.log('new game: ' + roomname);
              user.getSocket(io).join(roomname);
              user2.getSocket(io).join(roomname);
              io.in(roomname).emit('join game', `You have joined room ${roomname}`);
            });
          });
        }
      });
    });

    socket.on('leave room', (callback) => {
      // User.findOneAndDelete({ }) // TODO
      // if (socket.id in users && users[socket.id][2]) {
      //   users[socket.id][2] = null;
      //   console.log('left');
      // } else {
      //   console.log('a');
      //   callback('error', "you're not in a room");
      // }
    });

    // socket.on('start game', () => {
    //   const board = new Board({
    //     roomNumber,
    //     currentTurn: 0,
    //     playerOneBoard: [4, 4, 4, 4, 4, 4, 0],
    //     playerTwoBoard: [4, 4, 4, 4, 4, 4, 0],
    //   });
    //   Board.remove({ roomNumber }, () => {});
    //   board.save((err, board) => {
    //     if (err) console.error(err);
    //     console.log([board.playerOneBoard, board.playerTwoBoard]);
    //   });
    // });

    socket.on('get board', (callback) => {
      Board.findOne({ $or: [
        { playerOneId: socket.id },
        { playerTwoId: socket.id },
      ] }, (err, board) => {
        if (board == null) {
          callback('Err', 'You are not in game!');
          return;
        }
        console.log(board);
        socket.emit('board', board.getBoard());
      });
    });

    socket.on('make move', (move, callback) => {
      move = parseInt(move);
      if (move > 5 || move < 0) {
        callback('invalid', 'the move was invalid');
        return;
      }
      Board.findOne({ $or: [
        { playerOneId: socket.id },
        { playerTwoId: socket.id },
      ] }, (err, board) => {
        if (board == null) {
          callback('Error', 'You are not in game!');
          return;
        }
        let boardArray;
        let goAgain;
        const row = (board.playerOneId === socket.id) ? 0 : 1;
        if (row !== board.currentTurn) {
          callback('invalid', 'it\'s not your turn');
          return;
        }
        [boardArray, goAgain] = board.move(row, move);
        const currentTurn = goAgain ? board.currentTurn : (board.currentTurn + 1) % 2;
        const doc = {
          currentTurn,
          playerOneBoard: boardArray[0],
          playerTwoBoard: boardArray[1],
        };
        Board.findOneAndUpdate({ $or: [
          { playerOneId: socket.id },
          { playerTwoId: socket.id },
        ] }, doc, (err, raw) => {
          if (err) {
            console.log('err');
            console.log(raw);
          }
        });
        User.findOne({ socketid: socket.id }, function(err, user) {
          const username = user.username;
          io.in(board.roomname).emit('board', [username, boardArray]);
        });
      });
    });
  });
};
