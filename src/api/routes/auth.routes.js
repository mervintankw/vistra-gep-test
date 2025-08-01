/**
 * Authentication Routes
 * @description Handles user authentication endpoints
 */

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { validateLogin, validateRegister } = require('../middleware/validators');
const { rateLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting to auth routes
router.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }));

/**
 * @route POST /api/v1/auth/register
 * @description Register a new user
 * @access Public
 */
router.post('/register', validateRegister, AuthController.register);

/**
 * @route POST /api/v1/auth/login
 * @description Authenticate user and return token
 * @access Public
 */
router.post('/login', validateLogin, AuthController.login);

/**
 * @route POST /api/v1/auth/refresh
 * @description Refresh access token
 * @access Public
 */
router.post('/refresh', AuthController.refreshToken);

/**
 * @route POST /api/v1/auth/logout
 * @description Logout user and invalidate token
 * @access Private
 */
router.post('/logout', AuthController.logout);

/**
 * @route POST /api/v1/auth/forgot-password
 * @description Request password reset email
 * @access Public
 */
router.post('/forgot-password', AuthController.forgotPassword);

/**
 * @route POST /api/v1/auth/reset-password
 * @description Reset password with token
 * @access Public
 */
router.post('/reset-password/:token', AuthController.resetPassword);

module.exports = router;
