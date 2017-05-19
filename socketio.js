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
          io.in(user.roomname).emit('leave room');
        }
      });
    });

    socket.on('set username', (username, callback) => {
      // check to see if anyone has that username
      socket.emit('testing', 'hi');
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

    socket.on('create game', (callback) => {
      User.findOne({ socketid: socket.id }, (err, user) => {
        if (user.roomname) {
          callback('Err', `${user.username} is already in a room!`);
          return;
        }
        const roomname = randomString(15);
        const board = new Board({
          roomname,
          currentTurn: 0,
          playerOneBoard: [4, 4, 4, 4, 4, 4, 0],
          playerTwoBoard: [4, 4, 4, 4, 4, 4, 0],
          playerOneId: user.socketid,
          playerTwoId: undefined,
          playerOneName: user.username,
          playerTwoName: undefined,
        });
        user.save((err, user) => {
          if (err) console.log(err);
        });
        board.save((err, board) => {
          console.log('new game: ' + roomname);
          user.getSocket(io).join(roomname);
          callback('success');
          socket.emit('player number', 1);
          io.in(roomname).emit('players', [board.playerOneName, 'Waiting for player', 1]);
        });
      });
    });

    socket.on('join game', (roomname, callback) => {
      Board.findOne({ roomname }, (err, board) => {
        User.findOne({ socketid: socket.id }, (err, user) => {
          if (user.roomname) {
            callback('Err', `${user.username} is already in a room!`);
            return;
          }
          user.roomname = roomname;
          user.save((err, user) => {
            if (err) console.log(err);
          });
          if (board.playerTwoId) {
            socket.join(roomname);
            callback('success');
            socket.emit('players', [board.playerOneName, board.playerTwoName]);
            socket.emit('games', [board.playerOneBoard, board.playerTwoBoard, board.currentTurn + 1]);
            return;
          }
          board.playerTwoId = user.socketid;
          board.playerTwoName = user.username;
          board.save((err, board) => {
            console.log('joined game: ' + roomname);
            user.getSocket(io).join(roomname);
            callback('success');
            io.in(roomname).emit('players', [board.playerOneName, board.playerTwoName]);
            io.in(roomname).emit('games', [board.playerOneBoard, board.playerTwoBoard, board.currentTurn + 1]);
            socket.emit('player number', 2);
          });
        });
      });
    });

    socket.on('leave room', () => {
      console.log('leave room');
      let roomname;
      Board.findOneAndRemove({ $or: [
        { playerOneId: socket.id },
        { playerTwoId: socket.id },
      ] }, (err, board) => {
        io.in(board.roomname).emit('leave room');
        User.findOne({ socketid: board.playerOneId }, (err, user) => {
          roomname = user.roomname;
          user.roomname = undefined;
          user.getSocket(io).leave(roomname);
          user.save((err, user) => { });
        });
        User.findOne({ socketid: board.playerTwoId }, (err, user) => {
          user.roomname = undefined;
          user.getSocket(io).leave(roomname);
          user.save((err, user) => { });
        });
      });
      console.log(roomname);
    });

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
        socket.emit('board', [board.playerOneBoard, board.playerTwoBoard, board.currentTurn + 1]);
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
        if (typeof board.PlayerTwoName === undefined) {
          callback('Error', 'You are not in game1!');
          return;
        }
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
        io.in(board.roomname).emit('games', [boardArray[0], boardArray[1], board.currentTurn]);
      });
    });

    socket.on('get games', (callback) => {
      Board.find({}, (err, boards) => {
        if (err) console.log(err);
        const games = [];
        for (let i = 0; i < boards.length; i += 1) {
          games.push([boards[i].playerOneName, boards[i].playerTwoName, boards[i].roomname]);
        }
        callback(err, games);
      });
    });
  });
};
