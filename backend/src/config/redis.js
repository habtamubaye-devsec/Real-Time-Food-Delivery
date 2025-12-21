const redis = require("redis");
const logger = require("../utils/logger");

const isRedisEnabled =
  typeof process.env.REDIS_URL === "string" &&
  process.env.REDIS_URL.trim() !== "" &&
  process.env.REDIS_URL.trim().toLowerCase() !== "disabled";

const disabledClient = {
  isOpen: false,
  on: () => {},
  connect: async () => {},
  get: async () => null,
  set: async () => null,
  setEx: async () => null,
  del: async () => null,
};

const client = isRedisEnabled
  ? redis.createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
      },
    })
  : disabledClient;

if (isRedisEnabled) {
  client.on("error", (err) => {
    logger.error(`Redis error: ${err.message}`);
  });

  client.on("connect", () => {
    logger.info("Redis connected successfully");
  });
}

const connectRedis = async () => {
  try {
    if (!isRedisEnabled) {
      logger.info('Redis disabled (set REDIS_URL to enable)');
      return;
    }
    await client.connect();
  } catch (err) {
    logger.error(`Redis connection error: ${err.message}`);
  }
};

module.exports = { client, connectRedis };
