const express = require('express');
const User = require('../models/User');

const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/upsell/recommendation/:userId - Get personalized upsell recommendation
router.get('/recommendation/:userId', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    // Simple recommendation logic based on user's current level
    let recommendation = {
      skill: 'Writing',
      message: 'Hãy thử Writing Master Pack để cải thiện kỹ năng viết của bạn!',
      package: 'premium'
    };

    if (user.currentLevel === 'A1' || user.currentLevel === 'A2') {
      recommendation = {
        skill: 'Listening',
        message: 'Listening là kỹ năng quan trọng để bắt đầu học IELTS. Hãy thử gói Standard!',
        package: 'standard'
      };
    } else if (user.currentLevel === 'B1' || user.currentLevel === 'B2') {
      recommendation = {
        skill: 'Speaking',
        message: 'Speaking sẽ giúp bạn đạt band cao hơn. Hãy thử gói Ultimate!',
        package: 'ultimate'
      };
    }

    res.json({
      message: 'Upsell recommendation fetched successfully',
      recommendation
    });
  } catch (error) {
    console.error('Upsell recommendation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;