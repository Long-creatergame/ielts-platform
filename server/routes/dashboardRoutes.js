const express = require('express');
const { getDashboardData } = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Dashboard routes
router.get('/', getDashboardData);

module.exports = router;
