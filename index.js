const app = require('express')();
const http = require('http').Server(app);
const path = require('path');
const io = require('socket.io')(http);

const {
  PORT = 3000,
} = process.env;

app.get('/', (req, res) => res.sendFile(path.resolve('index.html')));

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('chat message', (msg) => {
    console.log(`message: ${msg}`);
    io.emit('chat message', msg);
  });
});

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});