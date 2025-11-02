const express = require('express');
const User = require('../models/User');
const Test = require('../models/Test');
const CachedFeedback = require('../models/CachedFeedback');
const auth = require('../middleware/auth');
const { generateIELTSTest } = require('../controllers/testGeneratorController');
const aiScoringService = require('../services/aiScoringService');
const crypto = require('crypto');
const OpenAI = require('openai');
const router = express.Router();

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// New AI-powered test generation endpoint
router.post('/generate-test', auth, generateIELTSTest);

// Check if user can start a test (paywall logic)
router.get('/can-start', auth, async (req, res) => {
  try {
    const user = req.user;
    
    // TEMPORARY: ALL TESTS UNLOCKED FOR TESTING
    return res.json({ 
      allowed: true, 
      isFree: false,
      message: 'All features unlocked'
    });
    
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
    console.error('[TestCanStart] Error:', error.message);
    return res.status(200).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Start a test (increment free trial if applicable)
router.post('/start', auth, async (req, res) => {
  try {
    const user = req.user;
    const { level, skill } = req.body;
    
    // TEMPORARY: ALL TESTS UNLOCKED FOR TESTING
    // Check if user can start test
    // if (user.freeTestsUsed >= user.freeTestsLimit && !user.paid) {
    //   return res.status(403).json({ 
    //     paywall: true,
    //     message: `Free trial completed (${user.freeTestsUsed}/${user.freeTestsLimit} used). Payment required to continue.`,
    //     upgradeUrl: '/pricing'
    //   });
    // }

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
      data: {
        testId: test._id,
        level,
        skill
      },
      message: 'Test started successfully'
    });
  } catch (error) {
    console.error('[TestStart] Error:', error.message);
    return res.status(200).json({ 
      success: false,
      message: 'Failed to start test. Please try again.'
    });
  }
});

// Submit a test with AI feedback for Writing/Speaking
router.post('/submit', auth, async (req, res) => {
  try {
    const user = req.user;
    
    // Safety checks
    if (!user || !user._id) {
      console.warn('[TestSubmit] Missing userId');
      return res.status(200).json({
        success: false,
        message: 'Missing user ID — please re-login'
      });
    }
    
    // Support both new and legacy payloads
    let { level, overallBand, skillScores, skillBands, testAnswers, completed, skill, answers, timeSpent } = req.body || {};
    
    // Validate answers exist
    if (!testAnswers && !answers) {
      console.warn('[TestSubmit] No answers provided');
      return res.status(200).json({
        success: false,
        message: 'No answers submitted. Please complete the test before submitting.'
      });
    }

    // If client sent minimal payload (skill + answers), adapt it
    if (!testAnswers && answers) {
      testAnswers = answers;
    }
    
    // Additional safety checks
    if (!testAnswers && !answers) {
      console.warn('[TestSubmit] All answer fields missing');
      return res.status(200).json({
        success: false,
        message: 'No answers provided. Please complete the test before submitting.'
      });
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
    
    // Fix: Use skillBands from frontend if available, otherwise use skillScores as band scores
    if (!skillBands && !skillScores) {
      const base = 6.5;
      skillBands = {
        reading: skill === 'reading' ? base : base,
        listening: skill === 'listening' ? base : base,
        writing: skill === 'writing' ? base : base,
        speaking: skill === 'speaking' ? base : base,
      };
      skillScores = {
        reading: skill === 'reading' ? base : base,
        listening: skill === 'listening' ? base : base,
        writing: skill === 'writing' ? base : base,
        speaking: skill === 'speaking' ? base : base,
      };
    } else if (!skillBands && skillScores) {
      // If only skillScores is provided, use it for both skillBands and skillScores
      skillBands = skillScores;
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
      skill: skill || 'mixed',
      totalBand: totalBand, // Required field in schema
      skillScores: formattedSkillScores,
      skillBands: skillBands, // Use skillBands from frontend
      answers: testAnswers,
      completed: completed || true,
      isPaid: user.paid,
      resultLocked: !user.paid,
      price: user.paid ? 0 : 29000,
      dateTaken: new Date(),
      durationSeconds: typeof timeSpent === 'number' ? timeSpent : undefined
    });

    await test.save();
    console.info('[MongoDB:Saved] Test', test._id, 'for user', user._id);

    // Generate AI feedback for Writing or Speaking tests with caching
    let aiFeedback = null;
    if (skill === 'writing' || skill === 'speaking') {
      try {
        const writingAnswers = typeof testAnswers === 'object' && testAnswers.writing 
          ? (Array.isArray(testAnswers.writing) ? testAnswers.writing.join(' ') : testAnswers.writing)
          : (typeof testAnswers === 'string' ? testAnswers : '');
        
        if (writingAnswers && writingAnswers.length > 50) {
          // Create hash for caching
          const essayHash = crypto.createHash('md5').update(writingAnswers.trim()).digest('hex');
          
          // Try to get from cache first
          let cachedFeedback = null;
          try {
            const cached = await CachedFeedback.findOne({ hash: essayHash });
            if (cached) {
              cached.usageCount += 1;
              cached.lastUsed = new Date();
              await cached.save();
            cachedFeedback = cached.feedback;
            console.info('[MongoDB:Cached] Loaded feedback for hash:', essayHash.substring(0, 8));
          }
        } catch (cacheError) {
          console.warn('[MongoDB:CacheError] Lookup failed:', cacheError.message);
        }
          
          // If cached, use it; otherwise generate new
          if (cachedFeedback) {
            aiFeedback = cachedFeedback;
          } else {
            // Generate new feedback with retry logic
            let attempt = 0;
            let success = false;
            
            while (!success && attempt < 3) {
              attempt++;
              try {
                const feedbackResult = await aiScoringService.scoreWriting(writingAnswers, skill === 'writing' ? 'Task 2' : 'Part 2');
                
                if (feedbackResult.success && feedbackResult.data && feedbackResult.data.overall) {
                  aiFeedback = feedbackResult.data;
                  success = true;
                  
                  // Cache the feedback
                  try {
                    await CachedFeedback.create({
                      hash: essayHash,
                      feedback: aiFeedback,
                      usageCount: 1
                    });
                    console.info('[MongoDB:Cached] Saved feedback for hash:', essayHash.substring(0, 8));
                  } catch (saveError) {
                    // Non-critical if cache save fails
                    console.warn('[MongoDB:SaveError] Cache save failed:', saveError.message);
                  }
                }
              } catch (aiError) {
                console.error('[AI:Attempt', attempt, ']', aiError.message);
                if (attempt < 3) {
                  // Wait before retry (exponential backoff)
                  await new Promise(resolve => setTimeout(resolve, attempt * 1500));
                }
              }
            }
            
            if (!success) {
              console.error('[AI:Failed] All 3 attempts failed');
              aiFeedback = { error: true, message: 'AI feedback unavailable. Please try again later.' };
            }
          }
          
          // Save feedback to test
          if (aiFeedback) {
            test.feedback = JSON.stringify(aiFeedback);
            await test.save();
            console.info('[AI:Generated] Essay scored', test._id, 'Overall:', aiFeedback.overall || 'N/A');
          }
        }
      } catch (feedbackError) {
        console.error('[AI:Error]', feedbackError.message);
        // Continue even if feedback fails
      }
    }

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
        completed: test.completed,
        feedback: aiFeedback // Include AI feedback if available
      },
      message: 'Test results saved successfully'
    });
  } catch (error) {
    console.error('[TestSubmit] Error:', error.message);
    return res.status(200).json({ 
      success: false,
      message: 'Internal error while submitting test. Please try again later.'
    });
  }
});

// Get user's tests
router.get('/mine', auth, async (req, res) => {
  try {
    const user = req.user;
    const tests = await Test.find({ userId: user._id })
      .sort({ dateTaken: -1 })
      .select('-answers');
    
    return res.json({ 
      success: true,
      data: tests,
      count: tests.length 
    });
  } catch (error) {
    console.error('[TestsMine] Error:', error.message);
    return res.status(200).json({ 
      success: false,
      message: 'Failed to fetch tests',
      data: [],
      count: 0
    });
  }
});

// Get a specific test by id (for result page refresh/deep link)
router.get('/:id', auth, async (req, res) => {
  try {
    const user = req.user;
    const testId = req.params.id;
    const test = await Test.findOne({ _id: testId, userId: user._id });
    
    if (!test) {
      console.warn('[TestResult] Test not found:', testId);
      return res.status(404).json({ 
        success: false, 
        message: 'Test not found' 
      });
    }
    
    // Parse feedback if it exists
    let parsedFeedback = null;
    if (test.feedback) {
      try {
        parsedFeedback = typeof test.feedback === 'string' 
          ? JSON.parse(test.feedback) 
          : test.feedback;
      } catch (e) {
        console.warn('Could not parse feedback:', e.message);
      }
    }
    
    // Sanitize missing fields to prevent client-side errors
    const safeTest = {
      _id: test._id,
      userId: test.userId,
      level: test.level,
      skillBands: test.skillBands || {
        reading: null,
        listening: null,
        writing: null,
        speaking: null,
      },
      totalBand: test.totalBand || 0,
      feedback: parsedFeedback,
      coachMessage: test.coachMessage || '',
      completed: test.completed,
      dateTaken: test.dateTaken,
      skill: test.skill,
      answers: test.answers
    };
    return res.status(200).json({
      success: true,
      data: safeTest
    });
  } catch (error) {
    console.error('[TestResult] Error:', error.message);
    return res.status(200).json({
      success: false,
      message: 'Failed to fetch test result'
    });
  }
});

module.exports = router;