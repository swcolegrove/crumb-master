const bluebird = require('bluebird');
const redis = require('redis');

const REDIS_URL = process.env.REDIS_URL;

bluebird.promisifyAll(redis);
bluebird.promisifyAll(redis.Multi.prototype);

const connectToClient = () => {
  return new Promise((resolve, reject) => {
    let client = redis.createClient(REDIS_URL);

    client.on("error", () => {
      reject("Redis Connection failed");
    });

    client.on("connect", () => {
      resolve(client);
    });
  });
};

const quitClient = client => {
  client.quit();
};

const getRoomData = ({ roomId }) => {
  return new Promise((resolve, reject) => {
    connectToClient().then(client => {
      client.hgetall(roomId, (err, votes) => {
        quitClient(client);
        if (!err) {
          resolve(votes);
        } else {
          reject(err);
        }
      });
    },
    err => {
      reject(`Redis connection failed: ${err}`);
    });
  });
};

const createRoom = ({ roomId, roomName }) => {
  return new Promise((resolve, reject) => {
    connectToClient().then(client => {
      client.hmset(roomId, 'room-name', roomName, (err) => {
        if (!err) {
          client.hgetall(roomId, (err, votes) => {
            quitClient(client);
            if (!err) {
              resolve(votes);
            } else {
              reject(`Could not get room data after creating: ${err}`);
            }
          });
        } else {
          quitClient(client);
          reject(err);
        }
      });
    },
    err => {
      reject("Redis connection failed: " + err);
    });
  });
};
const updateRoomName = createRoom;

const joinRoom = ({ roomId, username, vote }) => {
  console.log('joinRoom or addVoteToRoom', roomId, username, vote);
  return new Promise((resolve, reject) => {
    connectToClient().then(client => {
      client.hmset(roomId, username, vote, (err) => {
        if (!err) {
          // resolve(getRoomData(room.roomId));
          client.hgetall(roomId, (err, votes) => {
            quitClient(client);
            if (!err) {
              resolve(votes);
            } else {
              reject(`Could not get room data after joining: ${err}`);
            }
          });
        } else {
          quitClient(client);
          reject(`Could not join room: ${err}`);
        }
      });
    }, err => {
      reject(`Redis connection failed: ${err}`);
    });
  });
};

const addVoteToRoom = joinRoom;

const flushKeys = () => {
  return new Promise((resolve, reject) => {
    connectToClient().then(client => {
      client.flushall((err, res) => {
        quitClient(client);
        if (!err) {
          resolve(res);
        } else {
          reject(err);
        }
      });
    },
    err => {
      reject("Redis connection failed: " + err);
    });
  });
};

module.exports = {
  connectToClient,
  createRoom,
  addVoteToRoom,
  joinRoom,
  getRoomData,
  flushKeys,
  updateRoomName,
};
