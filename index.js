const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const io = require('socket.io')(http);
const serveStatic = require('serve-static');
const { connectToClient, addMessage, getMessages } = require('./lib/redis.js');

app.use(express.json());
app.use(express.urlencoded());

const {
  PORT = 3000,
} = process.env;

app.use(serveStatic(path.join(__dirname, 'dist')));

// eslint-disable-next-line
const consoleMsg = msg => console.log(msg);

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
