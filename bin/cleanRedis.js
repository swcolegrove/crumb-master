const redisLib = require('../lib/redis.js');
/* eslint-disable no-console */

redisLib.flushKeys().then(() => {
  console.log('All keys flushed');
}).catch((err) => {
  console.log(`Error flushing keys: ${err}`);
});
