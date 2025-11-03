const express = require('express');
const aiScoringService = require('../services/aiScoringService.js');
const recommendationService = require('../services/recommendationService.js');
const { generateLearningPath, getLearningPath } = require('../controllers/learningPathController.js');
const { generateAISummary } = require('../services/aiSummaryService.js');
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
    if (skill.toLowerCase() === 'writing') {
      result = await aiScoringService.scoreWriting(answer, taskType);
    } else {
      result = await aiScoringService.scoreSpeaking(answer, taskType);
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
      aiAvailable: aiScoringService.isAvailable,
      features: {
        scoring: true,
        recommendations: true,
        practiceQuestions: true
      },
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = router;