const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./authRoutes');
const itemRoutes = require('./itemRoutes');
const assignRoutes = require('./assignRoutes');
const responseRoutes = require('./responseRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const adminRoutes = require('./adminRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/items', itemRoutes);
router.use('/assignments', assignRoutes);
router.use('/responses', responseRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: 'v3',
    success: true,
    message: 'Core V3 API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

