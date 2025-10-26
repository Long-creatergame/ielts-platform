const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Get today's daily challenge
router.get('/', async (req, res) => {
  try {
    // Simple auth check
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Mock challenge for now - will be replaced with real generation
    const today = new Date().toDateString();
    const skills = ['reading', 'writing', 'listening', 'speaking'];
    const skill = skills[new Date().getDay() % 4]; // Different skill each day

    const challenge = {
      id: `challenge-${today}`,
      skill: skill,
      duration: skill === 'writing' ? 10 : 8,
      questions: skill === 'writing' ? 1 : 5,
      points: 10,
      description: `Complete this ${skill} exercise to improve your skills and maintain your streak!`
    };

    // Get user streak (mock for now)
    const streak = 0; // TODO: Calculate from user data
    
    res.json({
      challenge,
      streak,
      completed: false // TODO: Check if completed today
    });

  } catch (error) {
    console.error('Daily challenge error:', error);
    res.status(500).json({ error: 'Failed to fetch daily challenge' });
  }
});

// Complete a daily challenge
router.post('/complete', async (req, res) => {
  try {
    const { challengeId, score, timeSpent } = req.body;

    // TODO: Update user streak
    // TODO: Add points to user
    // TODO: Mark challenge as completed

    res.json({
      success: true,
      message: 'Challenge completed!',
      pointsEarned: 10,
      streakUpdated: true
    });

  } catch (error) {
    console.error('Complete challenge error:', error);
    res.status(500).json({ error: 'Failed to complete challenge' });
  }
});

module.exports = router;
