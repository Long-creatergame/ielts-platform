const express = require('express');
const { processAI, isAvailable } = require('../services/aiService.js');
const aiScoringService = require('../services/aiScoringService.js'); // Keep for backward compatibility
const recommendationService = require('../services/recommendationService.js');
const { generateLearningPath, getLearningPath } = require('../controllers/learningPathController.js');
const { generateAISummary } = require('../services/aiSummaryService.js');
const { runAISupervision } = require('../services/aiSupervisorService.js');
const { handleAIEmotionFeedback, getEngagementSummary, updateEngagementMetrics } = require('../services/aiEngagementService.js');
const auth = require('../middleware/auth.js');

const router = express.Router();

// Learning Path endpoints
router.post('/learning-path', auth, generateLearningPath);
router.get('/learning-path', auth, getLearningPath);

// AI Scoring endpoints
router.post('/score', auth, async (req, res) => {
  try {
    const { skill, answer, taskType } = req.body;
    const userId = req.user._id;

    if (!skill || !answer) {
      return res.status(400).json({ 
        success: false, 
        error: 'Skill and answer are required' 
      });
    }

    if (!['writing', 'speaking'].includes(skill.toLowerCase())) {
      return res.status(400).json({ 
        success: false, 
        error: 'AI scoring is only available for Writing and Speaking' 
      });
    }

    let result;
    // Use unified AI service
    if (skill.toLowerCase() === 'writing') {
      result = await processAI('writing', {
        essay: answer,
        taskType: taskType || 'Task 2',
        level: req.user?.currentLevel || 'B1',
        options: {},
      });
    } else {
      result = await processAI('speaking', {
        transcript: answer,
        taskType: taskType || 'Part 2',
        level: req.user?.currentLevel || 'B1',
        options: {},
      });
    }

    res.json({
      success: true,
      data: result.data,
      source: result.source,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Scoring Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'AI scoring service unavailable' 
    });
  }
});

// Generate practice questions
router.post('/practice-questions', auth, async (req, res) => {
  try {
    const { skill, level } = req.body;
    const userId = req.user._id;

    if (!skill) {
      return res.status(400).json({ 
        success: false, 
        error: 'Skill is required' 
      });
    }

    const result = await aiScoringService.generatePracticeQuestions(
      skill, 
      level || 'intermediate'
    );

    res.json({
      success: true,
      data: result.data,
      source: result.source,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Practice Questions Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Practice questions service unavailable' 
    });
  }
});

// Get personalized recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await recommendationService.generateRecommendations(userId);

    res.json({
      success: true,
      data: result.data,
      analysis: result.analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Recommendations Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Recommendations service unavailable' 
    });
  }
});

// Get AI Supervisor Report for user
router.get('/supervisor/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user can only access their own report
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized access' 
      });
    }

    const report = await runAISupervision(userId);

    if (!report) {
      return res.json({
        success: false,
        message: 'Unable to generate AI supervisor report',
        data: null
      });
    }

    res.json({
      success: true,
      data: report,
      message: 'AI supervisor report generated successfully'
    });

  } catch (error) {
    console.error('[AI Supervisor] Error:', error.message);
    res.json({
      success: false,
      message: 'Failed to generate AI supervisor report',
      data: null
    });
  }
});

// Get AI Summary for user
router.get('/summary/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user can only access their own summary
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized access' 
      });
    }

    // Get user level for appropriate tone
    const userLevel = req.user.currentLevel || 'B1';

    const summary = await generateAISummary(userId, userLevel);

    if (!summary) {
      return res.json({
        success: false,
        message: 'No feedback history found. Complete Writing or Speaking tests to receive AI insights.',
        data: null
      });
    }

    res.json({
      success: true,
      data: summary,
      message: 'AI summary generated successfully'
    });

  } catch (error) {
    console.error('[AI Summary] Error:', error.message);
    res.json({
      success: false,
      message: 'Failed to generate AI summary',
      data: null
    });
  }
});

// Get AI service status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      aiAvailable: isAvailable,
      features: {
        scoring: true,
        recommendations: true,
        practiceQuestions: true,
        emotion: true
      },
      timestamp: new Date().toISOString()
    }
  });
});

// AI Emotion & Engagement endpoints

/**
 * POST /api/ai/emotion
 * Get AI emotion feedback based on performance
 */
router.post('/emotion', auth, async (req, res) => {
  try {
    const { performance } = req.body;
    const userId = req.user._id;
    const userName = req.user.name || req.user.email?.split('@')[0] || 'Student';

    if (!performance) {
      return res.status(400).json({
        success: false,
        error: 'Performance data is required'
      });
    }

    const result = await handleAIEmotionFeedback(userId, userName, performance);

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[AI Emotion] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server error processing emotion feedback'
    });
  }
});

/**
 * GET /api/ai/engagement/summary
 * Get user's engagement summary
 */
router.get('/engagement/summary', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const summary = await getEngagementSummary(userId);

    return res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('[AI Engagement Summary] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server error fetching engagement summary'
    });
  }
});

/**
 * POST /api/ai/engagement/metrics
 * Update engagement metrics after practice session
 */
router.post('/engagement/metrics', auth, async (req, res) => {
  try {
    const { metrics } = req.body;
    const userId = req.user._id;

    if (!metrics) {
      return res.status(400).json({
        success: false,
        error: 'Metrics data is required'
      });
    }

    const result = await updateEngagementMetrics(userId, metrics);

    return res.json({
      success: result,
      message: result ? 'Engagement metrics updated' : 'Failed to update metrics'
    });
  } catch (error) {
    console.error('[AI Engagement Metrics] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server error updating engagement metrics'
    });
  }
});

module.exports = router;