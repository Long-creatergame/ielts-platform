import express from 'express';
import User from '../models/User.js';
import Test from '../models/Test.js';

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
router.post('/start', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { level, skill } = req.body;
    
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
      userId: user._id,
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

export default router;