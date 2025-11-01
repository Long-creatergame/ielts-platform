const express = require('express');
const User = require('../models/User');
const Test = require('../models/Test');
const auth = require('../middleware/auth');
const router = express.Router();

// Check if user can start a test (paywall logic)
router.get('/can-start', auth, async (req, res) => {
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
router.post('/start', auth, async (req, res) => {
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

    return res.json({
      success: true,
      testId: test._id,
      message: 'Test started successfully'
    });
  } catch (error) {
    console.error('Test start error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Submit test results
router.post('/submit', auth, async (req, res) => {
  try {
    const user = req.user;
    console.log('🧩 Submit test - User from token:', user?._id, user?.email);
    
    // Support both new and legacy payloads
    let { level, overallBand, skillScores, testAnswers, completed, skill, answers, timeSpent } = req.body || {};

    // If client sent minimal payload (skill + answers), adapt it
    if (!testAnswers && answers) {
      testAnswers = answers;
    }
    if (!level) {
      level = user?.currentLevel || 'A2';
    }
    if (!completed) {
      completed = true;
    }
    if (!overallBand) {
      // Simple heuristic default; real scoring handled elsewhere
      overallBand = 6.5;
    }
    if (!skillScores) {
      const base = 6.5;
      skillScores = {
        reading: skill === 'reading' ? base : base,
        listening: skill === 'listening' ? base : base,
        writing: skill === 'writing' ? base : base,
        speaking: skill === 'speaking' ? base : base,
      };
    }
    
    // Convert skillScores to match Test model schema
    // Frontend sends: { reading: 7.0, listening: 6.5, ... }
    // Model expects: { reading: { correct: X, total: Y }, ... }
    let formattedSkillScores = {};
    if (typeof skillScores === 'object' && skillScores !== null) {
      Object.entries(skillScores).forEach(([skill, score]) => {
        // If already in model format, use as-is
        if (typeof score === 'object' && 'correct' in score) {
          formattedSkillScores[skill] = score;
        } else {
          // Convert band score to correct/total format
          // Use score as "correct" and estimate total
          formattedSkillScores[skill] = {
            correct: typeof score === 'number' ? score : 0,
            total: 40 // Assume 40 questions per skill
          };
        }
      });
    }

    // Convert overallBand to totalBand (required field)
    const totalBand = overallBand || 6.5;

    // Create new test with results
    const test = new Test({
      userId: user._id,
      level: level || user.currentLevel || 'A2',
      totalBand: totalBand, // Required field in schema
      skillScores: formattedSkillScores,
      skillBands: skillScores, // Store raw band scores for easy access
      answers: testAnswers,
      completed: completed || true,
      isPaid: user.paid,
      resultLocked: !user.paid,
      price: user.paid ? 0 : 29000,
      dateTaken: new Date(),
      durationSeconds: typeof timeSpent === 'number' ? timeSpent : undefined
    });

    await test.save();
    console.log(`✅ Test saved to MongoDB: ${test._id} for user ${user._id}`);
    console.log('✅ Test saved successfully with skillBands:', skillScores);
    console.log('✅ Mongo persistence fixed successfully');

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

    // Update user statistics (only if totalBand is a number for calculation)
    user.totalTests += 1;
    const numericBand = typeof totalBand === 'number' ? totalBand : parseFloat(totalBand);
    if (!isNaN(numericBand)) {
      if (user.totalTests === 1) {
        user.averageBand = numericBand;
      } else {
        user.averageBand = ((user.averageBand * (user.totalTests - 1)) + numericBand) / user.totalTests;
      }
    }
    await user.save();

    return res.json({
      success: true,
      testId: test._id, // Use testId for frontend compatibility
      test: {
        _id: test._id,
        level: test.level,
        overallBand: totalBand,
        skillScores: skillScores, // Return raw skillScores
        dateCompleted: test.dateTaken,
        completed: test.completed
      },
      message: 'Test results saved successfully'
    });
  } catch (error) {
    console.error('❌ Test submit error:', error);
    console.error('❌ Error stack:', error.stack);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's tests
router.get('/mine', auth, async (req, res) => {
  try {
    const user = req.user;
    console.log('🔍 Fetching tests for user:', user._id);
    
    const tests = await Test.find({ userId: user._id })
      .sort({ dateTaken: -1 })
      .select('-answers');
    
    console.log(`✅ Found ${tests.length} tests for user ${user._id}`);
    return res.json({ tests });
  } catch (error) {
    console.error('Get user tests error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific test by id (for result page refresh/deep link)
router.get('/:id', auth, async (req, res) => {
  try {
    const user = req.user;
    const testId = req.params.id;
    console.log('🔍 Fetching test result for:', testId, 'user:', user._id);
    
    const test = await Test.findOne({ _id: testId, userId: user._id });
    
    if (!test) {
      console.warn('⚠️ Test not found:', testId, 'for user:', user._id);
      return res.status(404).json({ 
        success: false, 
        message: 'Test not found' 
      });
    }
    
    console.log('✅ Test result fetched successfully:', testId);
    return res.status(200).json({ 
      success: true, 
      test: test 
    });
  } catch (error) {
    console.error('❌ Error fetching test result:', error.message);
    console.error('❌ Error stack:', error.stack);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
});

module.exports = router;