const express = require('express');
const router = express.Router();
const {
  getUserAnalytics,
  getProgressStats,
  getLeaderboard
} = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/me', authMiddleware, getUserAnalytics);
router.get('/progress', authMiddleware, getProgressStats);
router.get('/leaderboard', getLeaderboard);

module.exports = router;

