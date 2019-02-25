const bluebird = require('bluebird');
const redis = require('redis');
const uuidv4 = require('uuid/v4');

const REDIS_URL = process.env.REDIS_URL;

bluebird.promisifyAll(redis);
bluebird.promisifyAll(redis.Multi.prototype);

const secondsInADay = 60 * 60 * 24;

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

const getMessages = () => {
  return new Promise((resolve, reject) => {
    connectToClient().then(res => {
        res.lrangeAsync("messages", 0, -1).then(
          messages => {
            resolve(messages);
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

const createRoom = ({ roomId = uuidv4(), userName }) => {
  return new Promise((resolve, reject) => {
    connectToClient().then(res => {
      res.getAsync(roomId).then((serializedVotes) => {
        if (!serializedVotes) {
          res
            .setAsync(roomId, JSON.stringify({ [userName]: null }), 'EX', secondsInADay)
            .then(() => {
              resolve(roomId);
            }, err => {
              reject(`Error creating empty room ${roomId}: ${err}`);
            });
        } else {
          reject(`RoomId ${roomId} already exists`);
        }
      }, err => {
        reject(err);
      });
    }).catch(err => {
      reject(`Redis connection failed: ${err}`);
    });
  });
};

const getRoom = ({ roomId }) => {
  return new Promise((resolve, reject) => {
    connectToClient().then(res => {
      res.getAsync(roomId).then((serializedVotes) => {
        try {
          const votes = JSON.parse(serializedVotes);
          resolve(votes);
        } catch (err) {
          reject(`Redis getRoom data corrupted. ${err}`);
        }
      }).catch(err => {
        reject(`GetRoom error: ${err}`);
      });
    }, err => {
      reject(`Redis connection failed: ${err}`);
    });
  });
};

const addVoteToRoom = ({ roomId, userName, value }) => {
  return new Promise((resolve, reject) => {
    connectToClient().then(res => {
      res.get(roomId).then((serializedVotes) => {
        try {
          const votes = JSON.parse(serializedVotes);
          votes[userName] = value;
          res
            .set(roomId, JSON.stringify(votes), 'EX', secondsInADay)
            .then(() => {
              resolve(votes);
            }, err => {
              reject(`Error setting new votes: ${err}`);
            })
        } catch (err) {
          reject(`Redis data corrupted. Best reset. ${err}`);
        }
      }, err => {
        reject(`Error retrieving votes: ${err}`);
      });
    }, err => {
      reject(`Redis connection failed: ${err}`);
    });
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

const addMessage = message => {
  return new Promise((resolve, reject) => {
    connectToClient().then(
      res => {
        res
          .multi()
          .rpush("messages", message)
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

const getActiveUsers = () => {
  return new Promise((resolve, reject) => {
    connectToClient().then(
      res => {
        res.smembersAsync("users").then(
          users => {
            resolve(users);
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

const addActiveUser = user => {
  return new Promise((resolve, reject) => {
    connectToClient().then(
      res => {
        res
          .multi()
          .sadd("users", user)
          .execAsync()
          .then(
            res => {
              if (res[0] === 1) {
                resolve("User added");
              }

              reject("User already in list");
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

const removeActiveUser = user => {
  return new Promise((resolve, reject) => {
    connectToClient().then(
      res => {
        res
          .multi()
          .srem("users", user)
          .execAsync()
          .then(
            res => {
              if (res === 1) {
                resolve("User removed");
              }
              reject("User is not in list");
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
  addMessage,
  getMessages,
  getActiveUsers,
  addActiveUser,
  removeActiveUser,
  createRoom,
  getRoom,
  addVoteToRoom,
  deleteRoom,
};
