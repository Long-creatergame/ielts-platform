/**
 * Practice Routes
 * API endpoints for adaptive practice system
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { handleAdaptivePractice, getPracticeSummary } = require('../services/adaptivePracticeService');

/**
 * POST /api/practice/adaptive
 * Submit practice performance and get adaptive feedback
 */
router.post('/adaptive', auth, async (req, res) => {
  try {
    const { skill, performance, mode = 'academic' } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!skill) {
      return res.status(400).json({
        success: false,
        error: 'Skill is required'
      });
    }

    if (!['reading', 'listening', 'writing', 'speaking'].includes(skill)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid skill. Must be reading, listening, writing, or speaking.'
      });
    }

    if (!performance || typeof performance.correct === 'undefined' || typeof performance.total === 'undefined') {
      return res.status(400).json({
        success: false,
        error: 'Performance data (correct, total) is required'
      });
    }

    // Handle adaptive practice
    const result = await handleAdaptivePractice(userId, skill, performance, mode);

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[Practice Route] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server error processing adaptive practice'
    });
  }
});

/**
 * GET /api/practice/summary
 * Get practice session summary for user
 */
router.get('/summary', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { skill } = req.query; // Optional skill filter

    const summary = await getPracticeSummary(userId, skill || null);

    return res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('[Practice Summary Route] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server error fetching practice summary'
    });
  }
});

/**
 * GET /api/practice/session/:skill
 * Get specific practice session for a skill
 */
router.get('/session/:skill', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { skill } = req.params;
    const { mode = 'academic' } = req.query;

    const PracticeSession = require('../models/PracticeSession');
    const session = await PracticeSession.findOne({ userId, skill, mode });

    if (!session) {
      return res.json({
        success: true,
        data: {
          exists: false,
          message: 'No practice session found for this skill'
        }
      });
    }

    const accuracy = session.totalQuestions > 0 
      ? (session.correctAnswers / session.totalQuestions * 100).toFixed(1)
      : 0;

    return res.json({
      success: true,
      data: {
        exists: true,
        skill: session.skill,
        mode: session.mode,
        currentBand: parseFloat(session.currentDifficulty.toFixed(1)),
        bandEstimate: parseFloat(session.bandEstimate.toFixed(1)),
        accuracy: parseFloat(accuracy),
        streak: session.streak,
        totalQuestions: session.totalQuestions,
        correctAnswers: session.correctAnswers,
        lastHint: session.aiHints[session.aiHints.length - 1] || null,
        recentHints: session.aiHints.slice(-5),
        lastUpdated: session.lastUpdated,
        performanceHistory: session.performanceHistory.slice(-10)
      }
    });
  } catch (error) {
    console.error('[Practice Session Route] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server error fetching practice session'
    });
  }
});

module.exports = router;
