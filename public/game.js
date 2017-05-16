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
    socket.emit('get board', (err, msg) => {
      console.log(`${err}: ${msg}`);
    });
    return false;
  });

  $('#startGame').click(() => {
    socket.emit('start game');
    return false;
  });

  $('#makeMoveButton').click(() => {
    socket.emit('make move', $('#makeMove').val(), (err, msg) => {
      console.log(`${err}: ${msg}`);
    });
    $('#makeMove').val('');
    return false;
  });

  socket.on('join game', (msg) => {
    console.log(msg);
  });

  socket.on('exit game', (msg) => {
    console.log(msg);
    console.log('The other player has left the game.');
  });

  socket.on('board', (data) => {
    const board = data[1];
    console.log(data);
    $('body').append(data[0] + '<br>');
    $('body').append(board[0].reverse() + '<br>');
    $('body').append(board[1] + '<br>');
    $('body').append('<br>');
    console.log(board);
  });
});
