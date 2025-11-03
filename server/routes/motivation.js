/**
 * Motivation Routes
 * API endpoints for AI motivation and learning continuity
 */

const express = require('express');
const auth = require('../middleware/auth');
const { 
  generateMotivationMessage, 
  updateMotivationProfile, 
  getMotivationSummary 
} = require('../services/aiMotivationService');
const Motivation = require('../models/Motivation');
const User = require('../models/User');

const router = express.Router();

/**
 * Get latest motivation message for user
 */
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user can only access their own data
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized access' 
      });
    }

    const user = await User.findById(userId);
    const userLevel = user?.currentLevel || 'B1';

    const message = await generateMotivationMessage(userId, userLevel);

    res.json({
      success: true,
      data: message,
      message: 'Motivation message generated successfully'
    });
  } catch (error) {
    console.error('[Motivation:Get] Error:', error.message);
    res.status(200).json({
      success: false,
      message: 'Failed to generate motivation message',
      data: null
    });
  }
});

/**
 * Get motivation summary (streaks, achievements, history)
 */
router.get('/summary/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized access' 
      });
    }

    const summary = await getMotivationSummary(userId);

    res.json({
      success: true,
      data: summary,
      message: 'Motivation summary retrieved successfully'
    });
  } catch (error) {
    console.error('[Motivation:Summary] Error:', error.message);
    res.status(200).json({
      success: false,
      message: 'Failed to fetch motivation summary',
      data: null
    });
  }
});

/**
 * Update motivation profile
 */
router.patch('/update/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized access' 
      });
    }

    const motivation = await updateMotivationProfile(userId, updates);

    if (!motivation) {
      return res.status(200).json({
        success: false,
        message: 'Failed to update motivation profile'
      });
    }

    res.json({
      success: true,
      data: motivation,
      message: 'Motivation profile updated successfully'
    });
  } catch (error) {
    console.error('[Motivation:Update] Error:', error.message);
    res.status(200).json({
      success: false,
      message: 'Failed to update motivation profile'
    });
  }
});

/**
 * Record user activity (call this after test completion)
 */
router.post('/activity/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized access' 
      });
    }

    let motivation = await Motivation.findOne({ userId });
    
    if (!motivation) {
      motivation = new Motivation({ userId });
    }

    // Update last active and streak
    const now = new Date();
    const lastActive = motivation.lastActive || now;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastActiveDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
    
    const diffDays = Math.floor((today - lastActiveDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Already active today, maintain streak
      motivation.streakDays = Math.max(motivation.streakDays || 0, 1);
    } else if (diffDays === 1) {
      // Active yesterday, continue streak
      motivation.streakDays = (motivation.streakDays || 0) + 1;
    } else {
      // New streak
      motivation.streakDays = 1;
    }

    // Update longest streak
    if (motivation.streakDays > motivation.longestStreak) {
      motivation.longestStreak = motivation.streakDays;
    }

    motivation.lastActive = now;
    await motivation.save();

    console.log(`[Motivation] Activity recorded for user ${userId}, streak: ${motivation.streakDays}`);

    res.json({
      success: true,
      data: {
        streakDays: motivation.streakDays,
        longestStreak: motivation.longestStreak
      },
      message: 'Activity recorded successfully'
    });
  } catch (error) {
    console.error('[Motivation:Activity] Error:', error.message);
    res.status(200).json({
      success: false,
      message: 'Failed to record activity'
    });
  }
});

module.exports = router;

