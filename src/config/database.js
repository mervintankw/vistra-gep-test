/**
 * Database Configuration
 * @description MongoDB connection setup with retry logic
 */

const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vistra_gep';

const connectDatabase = async () => {
  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  try {
    await mongoose.connect(MONGODB_URI, options);
    logger.info('Database connected successfully');

    mongoose.connection.on('error', (err) => {
      logger.error('Database connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Database disconnected');
    });

  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

const disconnectDatabase = async () => {
  await mongoose.disconnect();
  logger.info('Database disconnected');
};

module.exports = { connectDatabase, disconnectDatabase };
