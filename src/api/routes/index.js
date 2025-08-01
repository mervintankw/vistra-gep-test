/**
 * API Routes Index
 * @description Central routing configuration
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const entityRoutes = require('./entity.routes');
const reportRoutes = require('./report.routes');

// Auth routes (public)
router.use('/auth', authRoutes);

// Protected routes
router.use('/users', userRoutes);
router.use('/entities', entityRoutes);
router.use('/reports', reportRoutes);

// API info
router.get('/', (req, res) => {
  res.json({
    name: 'Vistra GEP API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      entities: '/api/v1/entities',
      reports: '/api/v1/reports'
    }
  });
});

module.exports = router;
