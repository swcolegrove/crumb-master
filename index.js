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
  });
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

app.post('/update-room-name', (req, res) => {
  const { roomId, roomName } = req.body;
  let room = {
    roomId,
    roomName,
  };
  redisLib.updateRoomName(room).then(() => {
    res.send({ status: 200, message: 'Room name updated'});
  });
});

app.post('/cast-vote', (req, res) => {
  const { roomId, username, value } = req.body;
  if (roomId && username && value) {
    redisLib.addVoteToRoom({ roomId, username, vote: value }).then(roomData => {
      res.send({ status: 200, message: 'Vote cast'});
    }).catch((err) => {
      res.send({ status: 500, message: `Room vote error: ${err}`});
    });
  } else {
    res.send({ status: 500, message: `Required data not present`});
  }
});

redisLib.connectToClient().then(res => {
  io.on('connection', (socket) => {
    consoleMsg('a user connected');

    socket.on('disconnect', () => {
      consoleMsg('user disconnected');
    });

    socket.on('show vote change', ({ roomId, votesAreShown }) => {
      console.log('show vote change', votesAreShown); // eslint-disable-line
      io.emit(`showVotes change ${roomId}`, { votesAreShown });
    });

    socket.on('room:update', (msg) => {
      const { roomId } = msg;
      redisLib.getRoomData({ roomId }).then(roomData => {
        io.emit(`room updated ${roomId}`, roomData);
      }, consoleMsg);
    });
  });
});

http.listen(PORT, () => {
  consoleMsg(`listening on *:${PORT}`);
});
