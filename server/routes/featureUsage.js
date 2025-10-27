const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Track feature usage
router.post('/track', auth, async (req, res) => {
  try {
    const { feature, action } = req.body;
    const userId = req.user._id;
    
    if (!feature || !action) {
      return res.status(400).json({ error: 'Feature and action are required' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user has access to the feature
    const hasAccess = user.paid || user.plan === 'paid';
    
    // For free users, check limitations
    if (!hasAccess) {
      switch (feature) {
        case 'ai_practice':
          // Check daily limit
          const today = new Date().toDateString();
          const lastPracticeDate = user.lastAiPracticeDate?.toDateString();
          
          if (lastPracticeDate !== today) {
            // Reset daily counter
            user.aiPracticeUsedToday = 0;
            user.lastAiPracticeDate = new Date();
          }
          
          if (user.aiPracticeUsedToday >= 1) {
            return res.status(403).json({ 
              error: 'Daily AI practice limit reached',
              limit: 1,
              used: user.aiPracticeUsedToday
            });
          }
          break;
          
        case 'test_submission':
          if (user.freeTestsUsed >= user.freeTestsLimit) {
            return res.status(403).json({ 
              error: 'Free test limit reached',
              limit: user.freeTestsLimit,
              used: user.freeTestsUsed
            });
          }
          break;
          
        default:
          // Premium features
          return res.status(403).json({ 
            error: 'Premium feature requires subscription',
            feature: feature
          });
      }
    }
    
    // Track usage
    switch (feature) {
      case 'ai_practice':
        user.aiPracticeUsedToday += 1;
        user.lastAiPracticeDate = new Date();
        break;
        
      case 'test_submission':
        user.freeTestsUsed += 1;
        break;
        
      case 'weakness_analysis':
        user.featureUsage.weaknessAnalysis += 1;
        break;
        
      case 'ai_personalization':
        user.featureUsage.aiPersonalization += 1;
        break;
        
      case 'advanced_recommendations':
        user.featureUsage.advancedRecommendations += 1;
        break;
    }
    
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Feature usage tracked',
      usage: {
        aiPracticeUsedToday: user.aiPracticeUsedToday,
        freeTestsUsed: user.freeTestsUsed,
        freeTestsLimit: user.freeTestsLimit
      }
    });
    
  } catch (error) {
    console.error('Feature usage tracking error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's feature usage stats
router.get('/stats', auth, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      stats: {
        freeTestsUsed: user.freeTestsUsed,
        freeTestsLimit: user.freeTestsLimit,
        aiPracticeUsedToday: user.aiPracticeUsedToday,
        lastAiPracticeDate: user.lastAiPracticeDate,
        featureUsage: user.featureUsage,
        isPaid: user.paid || user.plan === 'paid'
      }
    });
    
  } catch (error) {
    console.error('Get feature stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
