/**
 * Feedback Routes
 * API endpoints for AI feedback generation and retrieval
 */

const express = require('express');
const { generateFeedback, getFeedback } = require('../services/aiFeedbackService');
const AIFeedback = require('../models/AIFeedback');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * Generate AI feedback for Writing or Speaking
 */
router.post('/generate', auth, async (req, res) => {
  try {
    const user = req.user;
    const { testId, skill, text, level } = req.body;

    // Validation
    if (!testId || !skill || !text) {
      console.warn('[Feedback:Generate] Missing required fields');
      return res.status(200).json({
        success: false,
        message: 'Missing required fields: testId, skill, text'
      });
    }

    if (!['writing', 'speaking'].includes(skill)) {
      console.warn('[Feedback:Generate] Invalid skill');
      return res.status(200).json({
        success: false,
        message: 'Invalid skill. Must be "writing" or "speaking"'
      });
    }

    const userId = user._id || user.id;
    const userLevel = level || user.currentLevel || 'B1';

    console.log(`[Feedback:Generate] User: ${user.email}, Skill: ${skill}, TestId: ${testId}`);

    // Generate feedback
    const feedback = await generateFeedback({
      userId,
      testId,
      skill,
      text,
      level: userLevel
    });

    if (!feedback) {
      return res.status(200).json({
        success: false,
        message: 'AI feedback generation failed. Please try again.'
      });
    }

    return res.json({
      success: true,
      data: feedback,
      message: 'AI feedback generated successfully'
    });
  } catch (error) {
    console.error('[Feedback:Generate] Error:', error.message);
    return res.status(200).json({
      success: false,
      message: 'Internal error while generating feedback'
    });
  }
});

/**
 * Get existing feedback for a test
 */
router.get('/:testId/:skill', auth, async (req, res) => {
  try {
    const user = req.user;
    const { testId, skill } = req.params;

    const userId = user._id || user.id;

    const feedback = await getFeedback(userId, testId, skill);

    if (!feedback) {
      return res.status(200).json({
        success: false,
        message: 'No feedback found for this test',
        data: null
      });
    }

    return res.json({
      success: true,
      data: feedback,
      message: 'Feedback retrieved successfully'
    });
  } catch (error) {
    console.error('[Feedback:Get] Error:', error.message);
    return res.status(200).json({
      success: false,
      message: 'Internal error while retrieving feedback',
      data: null
    });
  }
});

/**
 * Get feedback history for a user
 */
router.get('/history/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { skill, sortBy = 'newest' } = req.query;

    console.log(`[Feedback:History] Fetching for user ${userId}, skill: ${skill || 'all'}`);

    // Build query
    const query = { userId };
    if (skill && ['writing', 'speaking'].includes(skill)) {
      query.skill = skill;
    }

    // Build sort
    let sort = { createdAt: -1 }; // Default: newest first
    if (sortBy === 'oldest') {
      sort = { createdAt: 1 };
    } else if (sortBy === 'highest-band') {
      // This requires aggregation, simplified here
      sort = { createdAt: -1 };
    }

    // Fetch feedbacks
    const feedbacks = await AIFeedback.find(query)
      .sort(sort)
      .limit(20);

    // Format history
    const history = feedbacks.map((fb) => {
      const bandValues = Object.values(fb.bandBreakdown).filter(v => v > 0);
      const averageBand = bandValues.length > 0
        ? (bandValues.reduce((sum, val) => sum + val, 0) / bandValues.length).toFixed(1)
        : 0;

      return {
        _id: fb._id,
        testId: fb.testId,
        skill: fb.skill,
        bandBreakdown: fb.bandBreakdown,
        averageBand: parseFloat(averageBand),
        date: fb.createdAt,
        level: fb.level || 'B1',
        aiMessage: fb.aiMessage || 'Keep practicing for better results.'
      };
    });

    console.log(`[Feedback:History] ✅ Loaded ${history.length} feedback records`);

    return res.json({
      success: true,
      data: {
        userId,
        history
      },
      message: 'Feedback history retrieved successfully'
    });
  } catch (error) {
    console.error('[Feedback:History] Error:', error.message);
    return res.status(200).json({
      success: false,
      message: 'Failed to fetch feedback history',
      data: { history: [] }
    });
  }
});

module.exports = router;

