/**
 * Mode Analytics Routes
 * API endpoints for tracking Academic vs General Training mode usage
 */

const express = require('express');
const auth = require('../middleware/authMiddleware');
const { 
  updateModeUsage, 
  getModeAnalytics, 
  getAllModeAnalytics,
  getModeTrend
} = require('../services/modeAnalyticsService');

const router = express.Router();

/**
 * Update mode usage statistics
 */
router.post('/update', auth, async (req, res) => {
  try {
    const { userId, mode, skill, band, testId } = req.body;
    
    // Verify user can only update their own data
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized access' 
      });
    }

    if (!mode || !skill || !band) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: mode, skill, band'
      });
    }

    const stats = await updateModeUsage(userId, mode, skill, band, testId);

    if (!stats) {
      return res.status(200).json({
        success: false,
        message: 'Failed to update mode analytics'
      });
    }

    res.json({
      success: true,
      data: stats,
      message: 'Mode analytics updated successfully'
    });
  } catch (error) {
    console.error('[Mode Analytics:Update] Error:', error.message);
    res.status(200).json({
      success: false,
      message: 'Failed to update mode analytics'
    });
  }
});

/**
 * Get mode analytics for a specific user
 */
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized access' 
      });
    }

    const analytics = await getModeAnalytics(userId);

    if (!analytics) {
      return res.status(200).json({
        success: false,
        message: 'Failed to fetch mode analytics',
        data: null
      });
    }

    res.json({
      success: true,
      data: analytics,
      message: 'Mode analytics retrieved successfully'
    });
  } catch (error) {
    console.error('[Mode Analytics:Get] Error:', error.message);
    res.status(200).json({
      success: false,
      message: 'Failed to fetch mode analytics',
      data: null
    });
  }
});

/**
 * Get mode trend for a user (admin or self)
 */
router.get('/trend/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { mode = 'academic' } = req.query;
    
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized access' 
      });
    }

    const trend = await getModeTrend(userId, mode);

    res.json({
      success: true,
      data: trend,
      message: 'Mode trend retrieved successfully'
    });
  } catch (error) {
    console.error('[Mode Analytics:Trend] Error:', error.message);
    res.status(200).json({
      success: false,
      message: 'Failed to fetch mode trend',
      data: null
    });
  }
});

/**
 * Get aggregated mode analytics for all users (admin only)
 */
router.get('/admin/summary', auth, async (req, res) => {
  try {
    // Admin check
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Admin access required' 
      });
    }

    const analytics = await getAllModeAnalytics();

    if (!analytics) {
      return res.status(200).json({
        success: false,
        message: 'Failed to fetch aggregated analytics',
        data: null
      });
    }

    res.json({
      success: true,
      data: analytics,
      message: 'Aggregated mode analytics retrieved successfully'
    });
  } catch (error) {
    console.error('[Mode Analytics:Admin] Error:', error.message);
    res.status(200).json({
      success: false,
      message: 'Failed to fetch aggregated analytics',
      data: null
    });
  }
});

module.exports = router;

