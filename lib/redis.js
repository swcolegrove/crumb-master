const bluebird = require('bluebird');
const redis = require('redis');

const REDIS_URL = process.env.REDIS_URL;

bluebird.promisifyAll(redis.RedisClient.prototype);
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

const createRoom = roomId => {

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
  deleteRoom,
  createRoom,
};
