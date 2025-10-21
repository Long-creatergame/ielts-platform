const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Test = require('../models/Test');
const auth = require('../middleware/auth');

// Check if user can start a test (paywall logic)
router.get('/can-start', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check free trial usage
    if (user.freeTestsUsed < 1) {
      return res.json({ 
        allowed: true, 
        isFree: true,
        message: 'You can start your free trial test'
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
router.post('/start', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { level, skill } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user can start test
    if (user.freeTestsUsed >= 1 && !user.paid) {
      return res.status(403).json({ 
        paywall: true,
        message: 'Payment required to start test',
        upgradeUrl: '/pricing'
      });
    }

    // Create new test
    const test = new Test({
      userId,
      level,
      skill,
      isPaid: user.paid,
      resultLocked: !user.paid,
      price: user.paid ? 0 : 29000
    });

    await test.save();

    // Increment free trial usage if this is free test
    if (user.freeTestsUsed < 1) {
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

// Get user's tests
router.get('/mine', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const tests = await Test.find({ userId })
      .sort({ dateTaken: -1 })
      .select('-answers');

    res.json({ tests });
  } catch (error) {
    console.error('Get user tests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
