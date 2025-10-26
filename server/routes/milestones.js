const express = require('express');
const User = require('../models/User');
const Test = require('../models/Test');
const router = express.Router();

// Check and return any new milestones achieved
router.get('/check', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-key-change-this-in-production');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const milestones = [];
    
    // Get user test statistics
    const totalTests = await Test.countDocuments({ userId: user._id, completed: true });
    const tests = await Test.find({ userId: user._id, completed: true })
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Check milestones based on test count
    if (totalTests >= 1 && !user.milestones?.first_test) {
      milestones.push('first_test');
    }
    if (totalTests >= 10 && !user.milestones?.ten_tests) {
      milestones.push('ten_tests');
    }
    if (totalTests >= 25 && !user.milestones?.twenty_five_tests) {
      milestones.push('twenty_five_tests');
    }
    if (totalTests >= 50 && !user.milestones?.fifty_tests) {
      milestones.push('fifty_tests');
    }

    // Check band improvement milestones
    if (tests.length >= 2) {
      const recentScore = tests[0]?.score?.overall || 0;
      const previousScore = tests[1]?.score?.overall || 0;
      const improvement = recentScore - previousScore;

      if (improvement >= 1.0 && !user.milestones?.one_band_improvement) {
        milestones.push('one_band_improvement');
      } else if (improvement >= 0.5 && !user.milestones?.half_band_improvement) {
        milestones.push('half_band_improvement');
      }
    }

    // Check streak milestones
    const streak = user.streakDays || 0;
    if (streak >= 30 && !user.milestones?.thirty_day_streak) {
      milestones.push('thirty_day_streak');
    } else if (streak >= 7 && !user.milestones?.seven_day_streak) {
      milestones.push('seven_day_streak');
    }

    // Check if target band reached
    const latestTest = tests[0];
    if (latestTest && latestTest.score?.overall >= user.targetBand && !user.milestones?.target_reached) {
      milestones.push('target_reached');
    }

    // Update user milestones
    if (milestones.length > 0) {
      const updatedMilestones = user.milestones || {};
      milestones.forEach(milestone => {
        updatedMilestones[milestone] = new Date();
      });
      
      await User.findByIdAndUpdate(user._id, {
        $set: { milestones: updatedMilestones }
      });
    }

    res.json({
      milestones,
      totalTests,
      streak,
      targetBand: user.targetBand,
      currentBand: tests[0]?.score?.overall || 0
    });

  } catch (error) {
    console.error('Milestone check error:', error);
    res.status(500).json({ error: 'Failed to check milestones' });
  }
});

// Get all user achievements
router.get('/achievements', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-key-change-this-in-production');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const achievements = user.milestones || {};
    
    res.json({
      achievements,
      totalAchievements: Object.keys(achievements).length
    });

  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Failed to get achievements' });
  }
});

module.exports = router;
