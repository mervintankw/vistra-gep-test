/**
 * Rate Limiter Middleware
 * @description Configurable rate limiting for API endpoints
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { createClient } = require('redis');
const { logger } = require('../../utils/logger');

// Redis client for distributed rate limiting
let redisClient = null;

const initRedis = async () => {
  if (process.env.REDIS_URL && !redisClient) {
    try {
      redisClient = createClient({ url: process.env.REDIS_URL });
      await redisClient.connect();
      logger.info('Redis connected for rate limiting');
    } catch (error) {
      logger.warn('Redis connection failed, using memory store', error.message);
    }
  }
  return redisClient;
};

/**
 * Create rate limiter with configurable options
 */
const rateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests',
      message: 'Please try again later',
      retryAfter: null
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        ...options.message,
        retryAfter: Math.ceil(options.windowMs / 1000)
      });
    }
  };

  const config = { ...defaultOptions, ...options };

  // Use Redis store if available
  if (redisClient) {
    config.store = new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
      prefix: 'rl:'
    });
  }

  return rateLimit(config);
};

/**
 * Strict rate limiter for sensitive endpoints
 */
const strictRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    error: 'Too many attempts',
    message: 'Please wait before trying again'
  }
});

/**
 * API rate limiter with higher limits
 */
const apiRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60 // 60 requests per minute
});

module.exports = { rateLimiter, strictRateLimiter, apiRateLimiter, initRedis };
