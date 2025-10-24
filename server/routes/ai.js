const express = require('express');
const aiScoringService = require('../services/aiScoringService.js');
const recommendationService = require('../services/recommendationService.js');
const auth = require('../middleware/auth.js');

const router = express.Router();

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