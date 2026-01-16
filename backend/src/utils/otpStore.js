const { client: redisClient } = require("../config/redis");
const logger = require("./logger");

const isRedisEnabled =
  typeof process.env.REDIS_URL === "string" &&
  process.env.REDIS_URL.trim() !== "" &&
  process.env.REDIS_URL.trim().toLowerCase() !== "disabled";

const memoryStore = new Map();

const keyForPhone = (phone) => `otp:${phone}`;

const setMemory = (key, value, ttlSeconds) => {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  memoryStore.set(key, { value, expiresAt });
};

const getMemory = (key) => {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
};

const delMemory = (key) => {
  memoryStore.delete(key);
};

const setOtp = async (phone, payload, ttlSeconds = 300) => {
  const key = keyForPhone(phone);

  if (isRedisEnabled && typeof redisClient.setEx === "function") {
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(payload));
    return;
  }

  setMemory(key, payload, ttlSeconds);
  logger.info("OTP stored in memory (Redis disabled)");
};

const getOtp = async (phone) => {
  const key = keyForPhone(phone);

  if (isRedisEnabled && typeof redisClient.get === "function") {
    const stored = await redisClient.get(key);
    return stored ? JSON.parse(stored) : null;
  }

  return getMemory(key);
};

const deleteOtp = async (phone) => {
  const key = keyForPhone(phone);

  if (isRedisEnabled && typeof redisClient.del === "function") {
    await redisClient.del(key);
    return;
  }

  delMemory(key);
};

module.exports = { setOtp, getOtp, deleteOtp };
