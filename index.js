const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const io = require('socket.io')(http);
const serveStatic = require('serve-static');
const { connectToClient, addMessage, getMessages, createRoom, getRoom } = require('./lib/redis.js');

app.use(express.json());
app.use(express.urlencoded());

const {
  PORT = 3000,
} = process.env;

app.use(serveStatic(path.join(__dirname, 'dist')));

// eslint-disable-next-line
const consoleMsg = msg => console.log(msg);

app.get('/ping', (req, res) => {
  res.send({ success: true });
});

app.post('/create-room', (req, res) => {
  // 1. create room uuid & use as redis hash key
  // 2. Add current user with vote none as key value pair on the hash
  const userName = JSON.stringify(req.body.name);
  createRoom({ userName }).then((roomId) => {
    res.send({ status: 200, roomId, userName });
  }).catch((err) => {
    console.log('CreateRoom', err); // eslint-disable-line
    res.status(500).send({ userName, err });
  });
});

app.get('/get-room/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  getRoom({ roomId }).then((votes) => {
    res.send({ roomId, votes });
  }).catch((err) => {
    res.status(500).send({ roomId, err });
  });
});

app.post('/sendMessage', (req, res) => {
  const msg = JSON.stringify(req.body.message);
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
