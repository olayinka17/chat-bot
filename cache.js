const Redis = require("redis");
require("dotenv").config();

const redisClient = Redis.createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

redisClient.on("connect", () => {
  console.log("Redis connected successfully");
});

redisClient.on("error", (err) => {
  console.error("Error while connecting to redis:", err);
});

(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;