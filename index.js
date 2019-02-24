const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const io = require('socket.io')(http);
const serveStatic = require('serve-static');
const uuidv4 = require('uuid/v4');
const { connectToClient, addMessage, getMessages, joinRoom,
  getRoomData, flushKeys } = require('./lib/redis.js');

app.use(express.json());
app.use(express.urlencoded());

const {
  PORT = 3000,
} = process.env;

app.use(serveStatic(path.join(__dirname, 'dist')));

// eslint-disable-next-line
const consoleMsg = msg => console.log(msg);

app.post('/destroy', (req, res) => {
  flushKeys().then(() => {
    res.send({ status: 200, message: 'Its all gone' });
  });
});

app.post('/join-room', (req, res) => {
  // 1. create room uuid & use as redis hash key
  // 2. Add current user with vote none as key value pair on the hash
  const username = req.body.name;
  const roomId = req.body.roomId ? req.body.roomId : uuidv4();
  const room = {
    roomId,
    username,
    vote: '-',
  };
  joinRoom(room).then((roomData) => {
    res.send({ status: 200, roomData });
  })
});


app.get('/room-data/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  getRoomData(roomId).then(roomData => {
    res.send(roomData);
  }, consoleMsg);
});

app.post('/sendMessage', (req, res) => {
  const msg = req.body.message;
  addMessage(msg).then(() => {
    res.send({ status: 200, message: 'message sent' })
  }, consoleMsg);
});

app.get('/messages', function(req, res) {
  getMessages().then(messages => {
    res.send(messages);
  }, consoleMsg);
});

connectToClient().then(res => {
  io.on('connection', (socket) => {
    consoleMsg('a user connected');
    res.subscribe("chatMessages");

    socket.on('disconnect', () => {
      consoleMsg('user disconnected');
    });

    socket.on('chat message', (msg) => {
      consoleMsg(`message: ${msg}`);
      io.emit('chat message', msg);
    });
  });
});

http.listen(PORT, () => {
  consoleMsg(`listening on *:${PORT}`);
});
