$(() => {
  const socket = io();

  $('#setUsernameButton').click(() => {
    socket.emit('set username', $('#setUsername').val(), (err, msg) => {
      console.log(`${err}: ${msg}`);
    });
    $('#setUsername').val('');
    return false;
  });

  $('#createGameButton').click(() => {
    socket.emit('create game', $('#createGame').val(), (err, msg) => {
      console.log(`${err}: ${msg}`);
    });
    $('#createGame').val('');
    return false;
  });

  $('#leaveRoomButton').click(() => {
    socket.emit('leave room', (err, msg) => {
      console.log(`${err}: ${msg}`);
    });
    return false;
  });

  $('#getBoard').click(() => {
    socket.emit('start game');
    return false;
  });

  $('#makeMove').click(() => {
    socket.emit('make move', 2, (err, msg) => {
      console.log(`${err}: ${msg}`);
    });
    return false;
  });

  socket.on('join game', (msg) => {
    console.log(msg);
  });

  socket.on('exit game', (msg) => {
    console.log(msg);
    console.log('The other player has left the game.');
  });

  socket.on('board', (board) => {
    console.log(board);
  });
});
