/**
 * User Routes
 * @description User management endpoints
 */

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/v1/users/me
 * @description Get current user profile
 * @access Private
 */
router.get('/me', UserController.getProfile);

/**
 * @route PUT /api/v1/users/me
 * @description Update current user profile
 * @access Private
 */
router.put('/me', UserController.updateProfile);

/**
 * @route PUT /api/v1/users/me/password
 * @description Change password
 * @access Private
 */
router.put('/me/password', UserController.changePassword);

/**
 * @route GET /api/v1/users
 * @description List all users (admin only)
 * @access Private - Admin
 */
router.get('/', authorize('admin'), UserController.listUsers);

/**
 * @route GET /api/v1/users/:id
 * @description Get user by ID
 * @access Private - Admin
 */
router.get('/:id', authorize('admin'), UserController.getUserById);

/**
 * @route PUT /api/v1/users/:id
 * @description Update user (admin only)
 * @access Private - Admin
 */
router.put('/:id', authorize('admin'), UserController.updateUser);

/**
 * @route DELETE /api/v1/users/:id
 * @description Deactivate user (admin only)
 * @access Private - Admin
 */
router.delete('/:id', authorize('admin'), UserController.deactivateUser);

module.exports = router;
