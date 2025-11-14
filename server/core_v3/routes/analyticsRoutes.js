const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/user/:userId', authMiddleware, analyticsController.getUserAnalytics);
router.get('/leaderboard', analyticsController.getLeaderboard);

module.exports = router;

