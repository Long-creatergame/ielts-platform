/**
 * AI Master Routes
 * Unified endpoints for all Cambridge AI services
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  processTestSubmission,
  processAdaptivePractice,
  getUnifiedAIInsights
} = require('../controllers/aiMasterController');
const {
  syncEmotionAcrossModules,
  applyToMotivation,
  applyToAdaptivePractice
} = require('../services/emotionSync/EmotionSyncController');

/**
 * POST /api/ai-master/test-submission
 * Complete test evaluation pipeline
 */
router.post('/test-submission', auth, async (req, res) => {
  try {
    const { testResult } = req.body;
    const userId = req.user._id;

    if (!testResult) {
      return res.status(400).json({
        success: false,
        error: 'Test result data is required'
      });
    }

    const result = await processTestSubmission(userId, testResult);

    return res.json({
      success: result.success,
      data: result.data,
      timestamp: result.timestamp
    });
  } catch (error) {
    console.error('[AI Master Route] Test submission error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server error processing test submission'
    });
  }
});

/**
 * POST /api/ai-master/adaptive-practice
 * Adaptive practice with emotion sync
 */
router.post('/adaptive-practice', auth, async (req, res) => {
  try {
    const { skill, performance, mode = 'academic' } = req.body;
    const userId = req.user._id;

    if (!skill || !performance) {
      return res.status(400).json({
        success: false,
        error: 'Skill and performance data are required'
      });
    }

    // Process adaptive practice
    const result = await processAdaptivePractice(userId, skill, performance, mode);

    // Sync emotion across modules
    try {
      const syncResult = await syncEmotionAcrossModules(userId, {
        ...performance,
        skill: skill,
        accuracy: performance.correct / performance.total || 0
      });

      // Apply emotion sync to other modules
      await applyToMotivation(userId, syncResult.syncData);
      await applyToAdaptivePractice(userId, syncResult.syncData);

      result.data.emotionSync = syncResult.syncData;
    } catch (syncError) {
      console.error('[AI Master Route] Emotion sync error:', syncError.message);
      // Don't fail the request if sync fails
    }

    return res.json({
      success: result.success,
      data: result.data,
      timestamp: result.timestamp
    });
  } catch (error) {
    console.error('[AI Master Route] Adaptive practice error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server error processing adaptive practice'
    });
  }
});

/**
 * GET /api/ai-master/insights
 * Get unified AI insights
 */
router.get('/insights', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const insights = await getUnifiedAIInsights(userId);

    return res.json({
      success: insights.success,
      data: insights.data,
      timestamp: insights.timestamp
    });
  } catch (error) {
    console.error('[AI Master Route] Insights error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server error fetching AI insights'
    });
  }
});

/**
 * POST /api/ai-master/emotion-sync
 * Sync emotion across all modules
 */
router.post('/emotion-sync', auth, async (req, res) => {
  try {
    const { performance } = req.body;
    const userId = req.user._id;

    if (!performance) {
      return res.status(400).json({
        success: false,
        error: 'Performance data is required'
      });
    }

    const syncResult = await syncEmotionAcrossModules(userId, performance);

    // Apply to all modules
    await applyToMotivation(userId, syncResult.syncData);
    await applyToAdaptivePractice(userId, syncResult.syncData);

    return res.json({
      success: true,
      data: syncResult.syncData,
      timestamp: syncResult.timestamp
    });
  } catch (error) {
    console.error('[AI Master Route] Emotion sync error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server error syncing emotion'
    });
  }
});

module.exports = router;
