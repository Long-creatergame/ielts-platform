const express = require('express');
const User = require('../models/User');
const Test = require('../models/Test');

const router = express.Router();

// Auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-key-change-this-in-production');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Check if user can start a test (paywall logic)
router.get('/can-start', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    // Check free trial usage
    if (user.freeTestsUsed < user.freeTestsLimit) {
      return res.json({ 
        allowed: true, 
        isFree: true,
        message: `You can start your free trial test (${user.freeTestsUsed}/${user.freeTestsLimit} used)`
      });
    }

    // Check if user has paid access
    if (user.paid) {
      return res.json({ 
        allowed: true, 
        isFree: false,
        message: 'You have paid access to all tests'
      });
    }

    // User has used free trial but hasn't paid
    return res.json({ 
      allowed: false, 
      paywall: true,
      message: 'Free trial completed. Payment required to continue.',
      upgradeUrl: '/pricing'
    });
  } catch (error) {
    console.error('Test start check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start a test (increment free trial if applicable)
router.post('/start', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { level, skill } = req.body;
    
    // Check if user can start test
    if (user.freeTestsUsed >= user.freeTestsLimit && !user.paid) {
      return res.status(403).json({ 
        paywall: true,
        message: `Free trial completed (${user.freeTestsUsed}/${user.freeTestsLimit} used). Payment required to continue.`,
        upgradeUrl: '/pricing'
      });
    }

    // Create new test
    const test = new Test({
      userId: user._id,
      level,
      skill,
      isPaid: user.paid,
      resultLocked: !user.paid,
      price: user.paid ? 0 : 29000
    });

    await test.save();

    // Emit realtime update to user room
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(String(user._id)).emit('test:started', {
          testId: test._id,
          level,
          skill,
          timestamp: Date.now()
        });
      }
    } catch (_) {}

    // Increment free trial usage if this is free test
    if (user.freeTestsUsed < user.freeTestsLimit && !user.paid) {
      user.freeTestsUsed += 1;
      await user.save();
    }

    res.json({
      success: true,
      testId: test._id,
      message: 'Test started successfully'
    });
  } catch (error) {
    console.error('Test start error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit test results
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { level, overallBand, skillScores, testAnswers, completed } = req.body;
    
    // Create new test with results
    const test = new Test({
      userId: user._id,
      level,
      overallBand,
      skillScores,
      answers: testAnswers,
      completed,
      isPaid: user.paid,
      resultLocked: !user.paid,
      price: user.paid ? 0 : 29000,
      dateTaken: new Date()
    });

    await test.save();

    // Emit realtime update for test result + analytics + leaderboard
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(String(user._id)).emit('test:completed', {
          testId: test._id,
          overallBand,
          skillScores,
          timestamp: Date.now()
        });
      }
    } catch (_) {}

    // Send test completion email
    try {
      const emailService = require('../services/emailService');
      emailService.sendTestCompletionEmail(user, test).catch(err => {
        console.error('Test completion email error:', err);
      });
    } catch (_) {}

    // Track analytics (best-effort)
    try {
      const fetch = require('node-fetch');
      fetch(`${process.env.FRONTEND_URL || 'http://localhost:4000'}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'test_complete',
          userId: String(user._id),
          timestamp: Date.now(),
          data: { overallBand, skillScores }
        })
      }).catch(() => {});
    } catch (_) {}

    // Award leaderboard points (best-effort)
    try {
      const fetch = require('node-fetch');
      const points = Math.round((overallBand || 0) * 10);
      fetch(`${process.env.FRONTEND_URL || 'http://localhost:4000'}/api/leaderboard/add-points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': req.header('Authorization') || '' },
        body: JSON.stringify({ points })
      }).catch(() => {});
    } catch (_) {}

    // Update user statistics
    user.totalTests += 1;
    if (user.totalTests === 1) {
      user.averageBand = overallBand;
    } else {
      user.averageBand = ((user.averageBand * (user.totalTests - 1)) + overallBand) / user.totalTests;
    }
    await user.save();

    res.json({
      success: true,
      test: {
        _id: test._id,
        level: test.level,
        overallBand: test.overallBand,
        skillScores: test.skillScores,
        dateCompleted: test.dateTaken,
        completed: test.completed
      },
      message: 'Test results saved successfully'
    });
  } catch (error) {
    console.error('Test submit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's tests
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const tests = await Test.find({ userId: user._id })
      .sort({ dateTaken: -1 })
      .select('-answers');

    res.json({ tests });
  } catch (error) {
    console.error('Get user tests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;