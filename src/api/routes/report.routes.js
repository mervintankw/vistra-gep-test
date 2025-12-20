/**
 * Report Routes
 * @description Endpoints for generating reports
 */

const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/report.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/v1/reports/entity-summary
 * @description Get entity summary by jurisdiction
 * @access Private
 */
router.get('/entity-summary', ReportController.getEntitySummary);

/**
 * @route GET /api/v1/reports/compliance
 * @description Get compliance status report
 * @access Private
 */
router.get('/compliance', ReportController.getComplianceReport);

/**
 * @route GET /api/v1/reports/type-distribution
 * @description Get entity type distribution
 * @access Private
 */
router.get('/type-distribution', ReportController.getTypeDistribution);

/**
 * @route GET /api/v1/reports/ownership/:entityId
 * @description Get ownership structure for an entity
 * @access Private
 */
router.get('/ownership/:entityId', ReportController.getOwnershipReport);

/**
 * @route POST /api/v1/reports/export
 * @description Export report as CSV/Excel
 * @access Private - Manager/Admin
 */
router.post('/export', authorize('admin', 'manager'), ReportController.exportReport);

/**
 * @route GET /api/v1/reports/dashboard-stats
 * @description Get dashboard statistics
 * @access Private
 */
router.get('/dashboard-stats', ReportController.getDashboardStats);

module.exports = router;
