const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Check if user can start a test
router.get('/can-start', auth, async (req, res) => {
  try {
    const user = req.user;
    
    // User can start test if:
    // 1. They have a paid plan, OR
    // 2. They have trial plan and haven't used trial yet
    const allowed = user.plan === 'paid' || (user.plan === 'trial' && !user.isTrialUsed);
    
    res.json({ allowed });
  } catch (error) {
    console.error('Can start test error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit test (marks trial as used if applicable)
router.post('/submit', auth, async (req, res) => {
  try {
    const user = req.user;
    const { skill } = req.body;

    if (!skill) {
      return res.status(400).json({ error: 'Skill is required' });
    }

    // Check if user can submit
    const canSubmit = user.plan === 'paid' || (user.plan === 'trial' && !user.isTrialUsed);
    
    if (!canSubmit) {
      return res.status(403).json({ error: 'Cannot submit test. Trial used or insufficient permissions.' });
    }

    // Add test to user's tests array
    user.tests.push({ skill });
    
    // Mark trial as used if this is a trial user
    if (user.plan === 'trial' && !user.isTrialUsed) {
      user.isTrialUsed = true;
    }

    await user.save();

    res.json({ 
      message: 'Test submitted successfully',
      isTrialUsed: user.isTrialUsed,
      plan: user.plan
    });
  } catch (error) {
    console.error('Submit test error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's tests
router.get('/mine', auth, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      tests: user.tests,
      isTrialUsed: user.isTrialUsed,
      plan: user.plan
    });
  } catch (error) {
    console.error('Get user tests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

