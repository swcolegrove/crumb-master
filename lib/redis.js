const bluebird = require('bluebird');
const redis = require('redis');

const REDIS_URL = process.env.REDIS_URL;

bluebird.promisifyAll(redis);
bluebird.promisifyAll(redis.Multi.prototype);

const connectToClient = () => {
  return new Promise((resolve, reject) => {
    let connector = redis.createClient(REDIS_URL);

    connector.on("error", () => {
      reject("Redis Connection failed");
    });

    connector.on("connect", () => {
      resolve(connector);
    });
  });
};

const getRoomData = ({ roomId }) => {
  return new Promise((resolve, reject) => {
    connectToClient().then(
      res => {
        res
          .hgetall(roomId, (err, votes) => {
            if (!err) {
              resolve(votes);
            } else {
              reject(err);
            }
          });
      },
      err => {
        reject(`Redis connection failed: ${err}`);
      }
    );
  });
};

const createRoom = ({ roomId, roomName }) => {
  return new Promise((resolve, reject) => {
    connectToClient().then(res => {
      res
        .hmset(roomId, 'room-name', roomName, (err) => {
          if (!err) {
            res.hgetall(roomId, (err, votes) => {
              if (!err) {
                resolve(votes);
              } else {
                reject(`Could not get room data after creating: ${err}`);
              }
            });
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

const joinRoom = ({ roomId, username, vote }) => {
  console.log('joinRoom or addVoteToRoom', roomId, username, vote);
  return new Promise((resolve, reject) => {
    connectToClient().then(res => {
      res
        .hmset(roomId, username, vote, (err) => {
          if (!err) {
            // resolve(getRoomData(room.roomId));
            res.hgetall(roomId, (err, votes) => {
              if (!err) {
                resolve(votes);
              } else {
                reject(`Could not get room data after joining: ${err}`);
              }
            });
          } else {
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
    connectToClient().then(
      res => {
        res
          .flushall((err, res) => {
            if (!err) {
              resolve(res);
            } else {
              reject(err);
            }
          });
      },
      err => {
        reject("Redis connection failed: " + err);
      }
    );
  });
};

const deleteRoom = room => {
  return new Promise((resolve, reject) => {
    connectToClient().then(
      res => {
        res
          .del(room)
          .execAsync()
          .then(
            res => {
              resolve(res);
            },
            err => {
              reject(err);
            }
          );
      },
      err => {
        reject("Redis connection failed: " + err);
      }
    );
  });
};



module.exports = {
  connectToClient,
  createRoom,
  addVoteToRoom,
  joinRoom,
  getRoomData,
  flushKeys,
};
