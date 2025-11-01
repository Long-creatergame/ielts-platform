/**
 * User Preferences Routes
 * Handles saving and retrieving user learning preferences
 */

const express = require('express');
const UserPreferences = require('../models/UserPreferences');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user preferences
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    let preferences = await UserPreferences.findOne({ userId });
    
    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = await UserPreferences.create({
        userId,
        tone: 'academic',
        focusSkills: [],
        topics: [],
        targetBand: req.user.targetBand || 6.5,
        difficulty: 'adaptive',
        practiceTimePerDay: 45,
        preferredTestLength: 'full',
        aiStyle: 'encouraging',
        dailyReminder: true,
        weeklyReport: true
      });
    }
    
    return res.json({
      success: true,
      preferences
    });
  } catch (error) {
    console.error('❌ Error fetching preferences:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch preferences'
    });
  }
});

// Save/Update user preferences
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const preferencesData = req.body;
    
    // Validate required fields
    if (preferencesData.targetBand && (preferencesData.targetBand < 0 || preferencesData.targetBand > 9)) {
      return res.status(400).json({
        success: false,
        message: 'Target band must be between 0 and 9'
      });
    }
    
    // Update or create preferences
    const preferences = await UserPreferences.findOneAndUpdate(
      { userId },
      {
        ...preferencesData,
        updatedAt: new Date()
      },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    );
    
    console.log('✅ User preferences saved:', preferences._id);
    
    return res.json({
      success: true,
      preferences,
      message: 'Preferences saved successfully'
    });
  } catch (error) {
    console.error('❌ Error saving preferences:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save preferences'
    });
  }
});

module.exports = router;
