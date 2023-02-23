const express = require('express');

const app = express();
const http = require('http').Server(app);
const path = require('path');
const io = require('socket.io')(http);
const serveStatic = require('serve-static');
const uuidv4 = require('uuid/v4');
const redisLib = require('./lib/redis.js');
const utils = require('./utils');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const {
  PORT = 3000,
} = process.env;

app.use(serveStatic(path.join(__dirname, 'dist')));

// eslint-disable-next-line
const consoleMsg = (...msg) => console.log(...msg);

// app.post('/destroy', (req, res) => {
//   redisLib.flushKeys().then(() => {
//     res.send({ status: 200, message: 'Its all gone' });
//   }).catch((err) => {
//     res.status(500).send({ message: `Error flushing redis: ${err}`});
//   });
// });

app.post('/create-room', (req, res) => {
  // 1. create room uuid & use as redis hash key
  // 2. Set room-name
  const { roomName } = req.body;
  const roomId = uuidv4();
  const room = {
    roomId,
    roomName,
  };
  redisLib.createRoom(room).then(() => {
    res.send({ status: 200, roomData: room });
  }).catch(err => {
    res.status(500).send({ message: `Error creating room: ${err}` });
  });
});

app.post('/join-room', (req, res) => {
  // 1. Join room
  // 2. Add current user with vote none as key value pair on the hash
  const { username, roomId } = req.body;
  const room = {
    roomId,
    username,
    vote: '-',
  };
  redisLib.joinRoom(room).then(roomData => {
    res.send({ status: 200, roomData });
  }).catch(err => {
    res.status(500).send({ message: `Error joining room: ${err}` });
  });
});

app.get('/room-data/:roomId', (req, res) => {
  const { roomId } = req.params;
  redisLib.getRoomData({ roomId }).then(roomData => {
    res.send(roomData);
  }).catch(err => {
    res.status(500).send({ message: `Error getting room data: ${err}` });
  });
});

app.post('/update-room-name', (req, res) => {
  const { roomId, roomName } = req.body;
  const room = {
    roomId,
    roomName,
  };
  redisLib.updateRoomName(room).then(() => {
    res.send({ status: 200, message: 'Room name updated' });
  }).catch(err => {
    res.status(500).send({ message: `Room update error: ${err}` });
  });
});

app.post('/cast-vote', (req, res) => {
  const { roomId, username, value } = req.body;
  if (roomId && username && value) {
    redisLib.addVoteToRoom({ roomId, username, vote: value }).then(() => {
      res.send({ status: 200, message: 'Vote cast' });
    }).catch(err => {
      res.status(500).send({ message: `Room vote error: ${err}` });
    });
  } else {
    res.status(500).send({ message: 'Required data not present' });
  }
});

app.post('/set-vote-visibility', (req, res) => {
  const { roomId, showVotes } = req.body;
  if (roomId && typeof utils.toBoolean(showVotes) === 'boolean') {
    redisLib.addVoteToRoom({ roomId, username: 'show-votes', vote: showVotes }).then(() => {
      res.send({ status: 200, message: 'Vote visibility set' });
    }).catch(err => {
      res.status(500).send({ message: `Room vote visibility error: ${err}` });
    });
  } else {
    res.status(400).send({ message: 'Required data not present' });
  }
});

app.post('/set-lock', (req, res) => {
  const { roomId, isLocked } = req.body;
  if (roomId && typeof utils.toBoolean(isLocked) === 'boolean') {
    redisLib.addVoteToRoom({ roomId, username: 'is-locked', vote: isLocked }).then(() => {
      res.send({ status: 200, message: 'Vote lock set' });
    }).catch(err => {
      res.status(500).send({ message: `Room lock error: ${err}` });
    });
  } else {
    res.status(400).send({ message: 'Required data not present' });
  }
});

app.post('/clear-votes', (req, res) => {
  const { roomId, username } = req.body;
  if (roomId, username) {
    redisLib.clearVotes({ roomId, username }).then(() => {
      res.status(200).send({ status: 200 });
    });
  } else {
    res.status(400).send({ message: 'Required data not present' });
  }
});

redisLib.connectToClient().then(res => {
  io.on('connection', socket => {
    consoleMsg('a user connected');
    const connectionInfo = {
      socketId: socket.id,
      username: '',
      roomId: '',
    };

    socket.on('disconnect', () => {
      const { roomId, username } = connectionInfo;
      if (roomId) {
        redisLib.leaveRoom({ roomId, username }).then(roomData => {
          io.emit(`room:${roomId}:changed`, roomData);
        }).catch(err => {
          consoleMsg(`Error leaving room: ${err}`);
        });
      }
    });

    socket.on('room:joined', userData => {
      // Won't this set it for everybody?
      connectionInfo.username = userData.username;
      connectionInfo.roomId = userData.roomId;
    });

    socket.on('show vote change', ({ roomId, votesAreShown }) => {
      consoleMsg('show vote socket', votesAreShown);
      io.emit(`room:${roomId}:showVotes change`, { votesAreShown });
    });

    socket.on('room:update', msg => {
      const { roomId } = msg;
      redisLib.getRoomData({ roomId }).then(roomData => {
        io.emit(`room:${roomId}:changed`, roomData);
      }).catch(err => {
        consoleMsg(`Room update error: ${err}`);
      });
    });

    socket.on('timerEvent', msg => {
      const { roomId, eventName } = msg;
      io.emit(`room:${roomId}:timerEvent`, eventName);
    });

    socket.on('room story update', ({ roomId, storyText, username }) => {
      if (roomId && !utils.isNullOrUndefined(storyText)) {
        redisLib.updateStory({ roomId, storyText, username });
        io.emit(`room story ${roomId}`, { storyText });
      } else {
        consoleMsg('Required room story update data not present');
      }
    });
  });
}).catch(err => {
  consoleMsg(err);
});

http.listen(PORT, () => {
  consoleMsg(`listening on *:${PORT}`);
});
