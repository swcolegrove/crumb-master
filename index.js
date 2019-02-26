const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const io = require('socket.io')(http);
const serveStatic = require('serve-static');
const uuidv4 = require('uuid/v4');
const redisLib = require('./lib/redis.js');

app.use(express.json());
app.use(express.urlencoded());

const {
  PORT = 3000,
} = process.env;

app.use(serveStatic(path.join(__dirname, 'dist')));

// eslint-disable-next-line
const consoleMsg = msg => console.log(msg);

app.post('/destroy', (req, res) => {
  redisLib.flushKeys().then(() => {
    res.send({ status: 200, message: 'Its all gone' });
  });
});

app.post('/create-room', (req, res) => {
  // 1. create room uuid & use as redis hash key
  // 2. Set room-name
  const { roomName } = req.body;
  const roomId = uuidv4();
  let room = {
    roomId,
    roomName,
  };
  redisLib.createRoom(room).then(() => {
    res.send({ status: 200, roomData: room });
  })
});

app.post('/join-room', (req, res) => {
  // 1. Join room
  // 2. Add current user with vote none as key value pair on the hash
  const { username, roomId } = req.body;
  let room = {
    roomId,
    username,
    vote: '-',
  };
  redisLib.joinRoom(room).then((roomData) => {
    res.send({ status: 200, roomData });
  })
});

app.get('/room-data/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  redisLib.getRoomData({ roomId }).then(roomData => {
    res.send(roomData);
  }, consoleMsg);
});

app.post('/sendMessage', (req, res) => {
  const msg = req.body.message;
  redisLib.addMessage(msg).then(() => {
    res.send({ status: 200, message: 'message sent' })
  }, consoleMsg);
});

app.get('/messages', function(req, res) {
  redisLib.getMessages().then(messages => {
    res.send(messages);
  }, consoleMsg);
});

redisLib.connectToClient().then(res => {
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

    socket.on('room join', (msg) => {
      const { username, roomId } = msg;
      let room = {
        roomId,
        username,
        vote: '-',
      };
      redisLib.joinRoom(room).then((roomData) => {
        io.emit(`room ${roomId}`, roomData);
      })
    });

    socket.on('room vote', (msg) => {
      const { roomId, username, value } = msg;
      if (roomId && username && value) {
        redisLib.addVoteToRoom({ roomId, username, vote: value }).then(roomData => {
          io.emit(`room ${roomId}`, roomData);
          // TODO: If all votes are in, time to show votes
          // io.emit(`show votes ${roomId}`);
        }).catch((err) => {
          console.log(`room vote error: ${err}`); // eslint-disable-line
        });
      } else {
        console.log('Required data not present'); // eslint-disable-line
      }
    });
  });
});

http.listen(PORT, () => {
  consoleMsg(`listening on *:${PORT}`);
});
