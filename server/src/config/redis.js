const Redis = require('ioredis');
const env = require('./env');
const logger = require('../utils/logger');

let redisClient = null;
let isRedisAvailable = false;

const initRedis = () => {
  if (env.USE_MEMORY_QUEUE) {
    logger.info('Using In-Memory Queue system (USE_MEMORY_QUEUE=true)');
    return null;
  }

  try {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.warn('Redis unavailable after 3 retries. Switching to in-memory queue fallback.');
          return null;
        }
        return Math.min(times * 200, 2000);
      }
    });

    redisClient.on('connect', () => {
      isRedisAvailable = true;
      logger.info(`Connected to Redis at ${env.REDIS_URL}`);
    });

    redisClient.on('error', (err) => {
      isRedisAvailable = false;
      logger.warn(`Redis connection error (${err.message}). Using in-memory fallback.`);
    });

    return redisClient;
  } catch (err) {
    logger.warn(`Failed to initialize Redis client: ${err.message}. Using in-memory fallback.`);
    return null;
  }
};

const getRedisClient = () => redisClient;
const isRedisConnected = () => isRedisAvailable;

module.exports = { initRedis, getRedisClient, isRedisConnected };
