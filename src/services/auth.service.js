/**
 * Authentication Service
 * @description Business logic for authentication operations
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logger } = require('../utils/logger');
const { AppError } = require('../utils/errors');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

class AuthService {
  /**
   * Register a new user
   */
  async register(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const user = await User.create(userData);
    const tokens = this.generateTokens(user);

    logger.info(`New user registered: ${user.email}`);
    return { user, ...tokens };
  }

  /**
   * Authenticate user
   */
  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403);
    }

    user.lastLogin = new Date();
    await user.save();

    const tokens = this.generateTokens(user);
    logger.info(`User logged in: ${user.email}`);

    return { user, ...tokens };
  }

  /**
   * Generate access and refresh tokens
   */
  generateTokens(user) {
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId: user._id, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Verify and decode token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken) {
    const decoded = this.verifyToken(refreshToken);

    if (decoded.type !== 'refresh') {
      throw new AppError('Invalid refresh token', 401);
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    return this.generateTokens(user);
  }
}

module.exports = new AuthService();
