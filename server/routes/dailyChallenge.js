const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Get today's daily challenge
router.get('/', async (req, res) => {
  try {
    // Auth check
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

    // Generate daily challenge based on day of week
    const today = new Date();
    const dayOfWeek = today.getDay();
    const skills = ['reading', 'writing', 'listening', 'speaking'];
    const skill = skills[dayOfWeek % 4];

    // Challenge types based on skill
    const challenges = {
      reading: {
        duration: 8,
        questions: 5,
        description: 'Complete 5 reading comprehension questions to improve your understanding.'
      },
      writing: {
        duration: 10,
        questions: 1,
        description: 'Write a short essay or task response to practice your writing skills.'
      },
      listening: {
        duration: 8,
        questions: 5,
        description: 'Listen to audio and answer 5 comprehension questions.'
      },
      speaking: {
        duration: 8,
        questions: 3,
        description: 'Practice speaking with 3 conversation topics and get AI feedback.'
      }
    };

    const challengeData = challenges[skill] || challenges.reading;

    // Calculate streak
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const streakDays = user.streakDays || 0;
    
    // Check if completed today
    const completedToday = false; // TODO: Check from database

    const challenge = {
      id: `challenge-${today.toDateString()}`,
      skill: skill,
      duration: challengeData.duration,
      questions: challengeData.questions,
      points: 10,
      description: challengeData.description
    };

    res.json({
      challenge,
      streak: streakDays,
      completed: completedToday
    });

  } catch (error) {
    console.error('Daily challenge error:', error);
    res.status(500).json({ error: 'Failed to fetch daily challenge' });
  }
});

// Complete a daily challenge
router.post('/complete', async (req, res) => {
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

    const { challengeId, score, timeSpent } = req.body;

    // Update user streak
    const today = new Date();
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    let newStreak = user.streakDays || 0;
    
    if (!lastActive) {
      // First time
      newStreak = 1;
    } else if (lastActive >= todayStart) {
      // Already completed today
      newStreak = user.streakDays || 0;
    } else if (lastActive >= new Date(todayStart.getTime() - 24 * 60 * 60 * 1000)) {
      // Yesterday - continue streak
      newStreak = (user.streakDays || 0) + 1;
    } else {
      // Streak broken - restart
      newStreak = 1;
    }

    // Add points
    const pointsEarned = score >= 7 ? 15 : score >= 6 ? 10 : 5;
    const newPoints = (user.points || 0) + pointsEarned;

    // Update user
    await User.findByIdAndUpdate(user._id, {
      $set: {
        lastActiveDate: today,
        streakDays: newStreak,
        points: newPoints
      }
    });

    res.json({
      success: true,
      message: 'Challenge completed!',
      pointsEarned,
      streakUpdated: true,
      newStreak,
      totalPoints: newPoints
    });

  } catch (error) {
    console.error('Complete challenge error:', error);
    res.status(500).json({ error: 'Failed to complete challenge' });
  }
});

module.exports = router;
