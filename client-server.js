'use strict';

const express = require('express');
const CLIENT_PORT = process.env.CLIENT_PORT || 8080;

let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
app.use(express.static('./dist'));

app.get('/', function(req, res){
  res.sendfile('./index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('keypress', (key) => {
    console.log(key);
  });
});

http.listen(CLIENT_PORT, function(){
  console.log('Client server listening on port ' + CLIENT_PORT);
});

