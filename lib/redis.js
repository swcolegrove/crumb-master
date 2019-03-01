const bluebird = require('bluebird');
const redis = require('redis');
const { camel } = require('to-case');

const REDIS_URL = process.env.REDIS_URL;

const reservedKeys = [
  'room-name',
  'show-votes',
  'is-locked',
  'story-text',
];

const roomDataFromCache = cacheData => Object.entries(cacheData || {})
  .reduce((acc, [key, value]) => {
    if (reservedKeys.includes(key)) {
      acc[camel(key)] = value;
    } else {
      acc.votes[key] = value;
    }

    return acc;
  }, { votes: {} });

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
          resolve(roomDataFromCache(votes));
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
      client
      .multi()
      .hmset(roomId, 'room-name', roomName, 'show-votes', false, 'is-locked', false, 'story-text', '')
      .hgetall(roomId)
      .execAsync()
      .then(res => {
        quitClient(client);
        resolve(roomDataFromCache(res[1]));
      }, err => {
        quitClient(client);
        reject(`Error creating room: ${err}`);
      });
    },
    err => {
      reject("Redis connection failed: " + err);
    });
  });
};
const updateRoomName = createRoom;

const joinRoom = ({ roomId, username, vote }) => {
  return new Promise((resolve, reject) => {
    connectToClient().then(client => {
      client
      .multi()
      .hmset(roomId, username, vote)
      .hgetall(roomId)
      .execAsync()
      .then(res => {
        quitClient(client);
        resolve(roomDataFromCache(res[1]));
      }, err => {
        quitClient(client);
        reject(`Error joining room or getting data: ${err}`);
      });
    }, err => {
      reject(`Redis connection failed: ${err}`);
    });
  });
};
const addVoteToRoom = joinRoom;

const updateStory = ({ roomId, storyText, username }) => {
  return new Promise((resolve, reject) => {
    connectToClient().then(client => {
      client
        .multi()
        .hmset(roomId, 'story-text', storyText)
        .hgetall(roomId)
        .execAsync()
        .then(res => {
          quitClient(client);
          resolve(roomDataFromCache(res[1]));
        }, err => {
          quitClient(client);
          reject(`Error joining room or getting data: ${err}`);
        });
    }, err => {
      reject(`Redis connection failed: ${err}`);
    });
  });
};

const clearVotes = ({ roomId, username }) => {
  return new Promise((resolve, reject) => {
    connectToClient().then(client => {
      client
        .multi()
        .hgetall(roomId)
        .execAsync()
        .then(res => {
          const resetKeys = [];
          Object.keys(res[0])
            .filter(key => !reservedKeys.includes(key))
            .forEach((key) => {
              resetKeys.push(key, '-');
            })
            resetKeys.push('is-locked', false, 'show-votes', false);
          client
            .multi()
            .hmset(roomId, resetKeys)
            .hgetall(roomId)
            .execAsync()
            .then((res) => {
              quitClient(client);
              resolve(roomDataFromCache(res[1]));
            }, err => {
              quitClient(client);
              reject(`Error clearing votes for room: ${err}`);
            });
        }, err => {
          quitClient(client);
          reject(`Error joining room or getting data: ${err}`);
        });
    }, err => {
      reject(`Redis connection failed: ${err}`);
    });
  });
};

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

const leaveRoom = ({ roomId, username }) => {
  return new Promise((resolve, reject) => {
    connectToClient().then(client => {
      client
      .multi()
      .hdel(roomId, username)
      .hgetall(roomId)
      .execAsync()
      .then(res => {
        quitClient(client);
        resolve(roomDataFromCache(res[1]));
      },
      err => {
        quitClient(client);
        reject(err);
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
  clearVotes,
  joinRoom,
  getRoomData,
  flushKeys,
  updateRoomName,
  updateStory,
  leaveRoom,
};
