const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./authRoutes');
const itemsRoutes = require('./itemsRoutes');
const assignRoutes = require('./assignRoutes');
const responseRoutes = require('./responseRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const systemRoutes = require('./systemRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/items', itemsRoutes);
router.use('/assign', assignRoutes);
router.use('/responses', responseRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/system', systemRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: 'core-v3-final',
    success: true,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;

