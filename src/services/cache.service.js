/**
 * Cache Service
 * @description Redis caching layer for improved performance
 */

const { createClient } = require('redis');
const { logger } = require('../utils/logger');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.defaultTTL = 3600; // 1 hour
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    if (this.isConnected) return;

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    try {
      this.client = createClient({ url: redisUrl });

      this.client.on('error', (err) => {
        logger.error('Redis error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis connected');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      logger.warn('Redis connection failed, caching disabled:', error.message);
    }
  }

  /**
   * Get value from cache
   */
  async get(key) {
    if (!this.isConnected) return null;

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key, value, ttl = this.defaultTTL) {
    if (!this.isConnected) return false;

    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key) {
    if (!this.isConnected) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async deletePattern(pattern) {
    if (!this.isConnected) return false;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      logger.error('Cache deletePattern error:', error);
      return false;
    }
  }

  /**
   * Cache wrapper for functions
   */
  async remember(key, ttl, callback) {
    const cached = await this.get(key);
    if (cached) {
      return cached;
    }

    const result = await callback();
    await this.set(key, result, ttl);
    return result;
  }

  /**
   * Generate cache key from parameters
   */
  generateKey(prefix, ...args) {
    const suffix = args.map(arg => {
      if (typeof arg === 'object') {
        return JSON.stringify(arg);
      }
      return String(arg);
    }).join(':');

    return `${prefix}:${suffix}`;
  }

  /**
   * Invalidate entity-related cache
   */
  async invalidateEntity(entityId) {
    await this.deletePattern(`entity:${entityId}*`);
    await this.delete('entity:list');
    await this.delete('dashboard:stats');
  }
}

module.exports = new CacheService();
