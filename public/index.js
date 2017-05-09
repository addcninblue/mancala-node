$(function () {
  var socket = io();

  $('#setUsernameButton').click(function(){
    socket.emit('set username', $('#setUsername').val(), function(err, msg){
      console.log(err + ": " + msg);
    });
    $('#setUsername').val('');
    return false;
  });

  $('#createGameButton').click(function(){
    socket.emit('create game', $('#createGame').val(), function(err, msg){
      console.log(err + ": " + msg);
    });
    $('#createGame').val('');
    return false;
  });

  $('#getBoard').click(function(){
    socket.emit('get board');
    return false;
  });

  $('#makeMove').click(function(){
    socket.emit('make move', 2, function(err, msg){
      console.log(err + ": " + msg);
    });
    return false;
  });

  socket.on('join game', function(msg){
    console.log(msg);
  });

  socket.on('exit game', function(msg){
    console.log("The other player has left the game.")
  })

  socket.on('board', function(board){
    console.log(board);
  });

});
