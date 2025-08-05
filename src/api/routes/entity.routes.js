/**
 * Entity Routes
 * @description REST endpoints for entity management
 */

const express = require('express');
const router = express.Router();
const EntityController = require('../controllers/entity.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validateEntity } = require('../middleware/validators');

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/v1/entities
 * @description Get all entities with filtering and pagination
 * @access Private
 */
router.get('/', EntityController.list);

/**
 * @route GET /api/v1/entities/:id
 * @description Get entity by ID
 * @access Private
 */
router.get('/:id', EntityController.getById);

/**
 * @route POST /api/v1/entities
 * @description Create a new entity
 * @access Private - Admin/Manager
 */
router.post('/', authorize('admin', 'manager'), validateEntity, EntityController.create);

/**
 * @route PUT /api/v1/entities/:id
 * @description Update an entity
 * @access Private - Admin/Manager
 */
router.put('/:id', authorize('admin', 'manager'), validateEntity, EntityController.update);

/**
 * @route DELETE /api/v1/entities/:id
 * @description Delete an entity
 * @access Private - Admin only
 */
router.delete('/:id', authorize('admin'), EntityController.delete);

/**
 * @route GET /api/v1/entities/:id/hierarchy
 * @description Get entity hierarchy tree
 * @access Private
 */
router.get('/:id/hierarchy', EntityController.getHierarchy);

/**
 * @route GET /api/v1/entities/compliance/alerts
 * @description Get entities with compliance alerts
 * @access Private
 */
router.get('/compliance/alerts', EntityController.getComplianceAlerts);

module.exports = router;
