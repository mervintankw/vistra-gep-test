/**
 * Authentication Middleware
 * @description JWT verification and role-based access control
 */

const AuthService = require('../../services/auth.service');
const User = require('../../models/User');
const { AppError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = AuthService.verifyToken(token);

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      throw new AppError('User not found', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403);
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    logger.warn(`Authentication failed: ${error.message}`);
    next(error);
  }
};

/**
 * Check if user has required role(s)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Authorization failed for user ${req.user.email}: required ${roles}, has ${req.user.role}`);
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

/**
 * Optional authentication - attach user if token present
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = AuthService.verifyToken(token);
      const user = await User.findById(decoded.userId).select('-password');

      if (user && user.isActive) {
        req.user = user;
        req.token = token;
      }
    }
  } catch (error) {
    // Ignore token errors for optional auth
  }
  next();
};

module.exports = { authenticate, authorize, optionalAuth };
