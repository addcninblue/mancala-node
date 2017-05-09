var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var usernames = {}; // username    -> socket.id
var users = {};     // socket.id   -> [socket, username, roomname]
var rooms = [];     // room+number -> [socket, socket]

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html')
});

app.get('/index.js', function(req, res){
  res.sendFile(__dirname + '/public/index.js')
});

app.get('/index.css', function(req, res){
  res.sendFile(__dirname + '/public/index.css')
});

io.on('connection', function(socket){
  console.log('a user connected');
  users[socket.id] = [socket, null, null];

  socket.on('disconnect', function(){
    console.log('a user disconnected');

    var username = users[socket.id][1]
    var roomName = users[socket.id][2]

    io.in(roomName).emit('exit game');
  })

  socket.on('set username', function(userName, callback){
    if(!(userName in usernames) && users[socket.id][1] === null){
      usernames[userName] = socket.id;
      users[socket.id][2] = userName;
      console.log('Username: ' + userName);
    } else {
      callback('error', 'You have already set a username!');
      console.log('Error: ' + userName);
    }
  })

  socket.on('create game', function(otherUsername, callback){
    if(!(otherUsername in usernames)){
      callback('error', 'This is not a valid player!');
      return;
    }
    // adds two users to room
    var roomNumber = (rooms.indexOf(null) == -1) ? rooms.length : rooms.indexOf(null);
    rooms[roomNumber] = [socket, users[usernames[otherUsername]][0]];
    users[socket.id][2] = "room" + roomNumber;
    users[usernames[otherUsername]][2] = "room" + roomNumber;
    socket.join("room" + roomNumber);
    users[usernames[otherUsername]][0].join("room" + roomNumber);
    io.in("room" + roomNumber).emit('join game', 'You have joined room ' + roomNumber);

    console.log('created game: ' + roomNumber);
  })

  socket.on('get board', function(){
    board = [[1,2,3],[2,3,4]];
    socket.emit('board', board);
  });

  socket.on('make move', function(move, callback){
    if(users[socket.id][3]){
      callback('invalid', 'the move was invalid');
    }
    board = [[1,2,3],[2,3,4]];
    setTimeout(function(){
      io.in(users[socket.id][2]).emit('board', board);
    }, 5000);
  })

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
