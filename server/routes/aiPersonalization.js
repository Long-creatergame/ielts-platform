const express = require('express');
const auth = require('../middleware/auth');
const AIPersonalizationService = require('../services/aiPersonalizationService');
const AIPersonalization = require('../models/AIPersonalization');
// mockData removed for production deploy

const router = express.Router();

// Initialize AI personalization for user
router.post('/initialize', auth, async (req, res) => {
  try {
    const personalization = await AIPersonalizationService.initializePersonalization(req.user._id);
    
    res.json({
      success: true,
      data: personalization,
      message: 'AI personalization initialized successfully'
    });
  } catch (error) {
    console.error('Initialize personalization error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Analyze learning patterns and update AI profile
router.post('/analyze', auth, async (req, res) => {
  try {
    const personalization = await AIPersonalizationService.analyzeLearningPatterns(req.user._id);
    
    res.json({
      success: true,
      data: personalization,
      message: 'Learning patterns analyzed successfully'
    });
  } catch (error) {
    console.error('Analyze patterns error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get personalized recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const recommendations = await AIPersonalizationService.getPersonalizedRecommendations(req.user._id);
    
    res.json({
      success: true,
      data: recommendations,
      message: 'Personalized recommendations retrieved successfully'
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get personalized study plan
router.get('/study-plan', auth, async (req, res) => {
  try {
    const studyPlan = await AIPersonalizationService.getPersonalizedStudyPlan(req.user._id);
    
    res.json({
      success: true,
      data: studyPlan,
      message: 'Personalized study plan retrieved successfully'
    });
  } catch (error) {
    console.error('Get study plan error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update user progress
router.post('/progress', auth, async (req, res) => {
  try {
    const { skill, score, timeSpent, questionsAnswered, accuracy, improvement } = req.body;
    
    const progressData = {
      skill,
      score,
      timeSpent,
      questionsAnswered,
      accuracy,
      improvement
    };
    
    const personalization = await AIPersonalizationService.updateProgress(req.user._id, progressData);
    
    res.json({
      success: true,
      data: personalization,
      message: 'Progress updated successfully'
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get AI profile
router.get('/profile', auth, async (req, res) => {
  try {
    const personalization = await AIPersonalization.findOne({ userId: req.user._id });
    
    if (!personalization) {
      const newPersonalization = await AIPersonalizationService.initializePersonalization(req.user._id);
      return res.json({
        success: true,
        data: newPersonalization,
        message: 'AI profile created successfully'
      });
    }
    
    res.json({
      success: true,
      data: personalization,
      message: 'AI profile retrieved successfully'
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update recommendation status
router.patch('/recommendations/:recommendationId', auth, async (req, res) => {
  try {
    const { recommendationId } = req.params;
    const { status } = req.body;
    
    const personalization = await AIPersonalization.findOne({ userId: req.user._id });
    
    if (!personalization) {
      return res.status(404).json({
        success: false,
        error: 'Personalization profile not found'
      });
    }
    
    const recommendation = personalization.recommendations.id(recommendationId);
    
    if (!recommendation) {
      return res.status(404).json({
        success: false,
        error: 'Recommendation not found'
      });
    }
    
    recommendation.status = status;
    if (status === 'completed') {
      recommendation.completedAt = new Date();
    }
    
    await personalization.save();
    
    res.json({
      success: true,
      data: recommendation,
      message: 'Recommendation status updated successfully'
    });
  } catch (error) {
    console.error('Update recommendation status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get learning analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const personalization = await AIPersonalization.findOne({ userId: req.user._id });
    
    if (!personalization) {
      return res.status(404).json({
        success: false,
        error: 'Personalization profile not found'
      });
    }
    
    const analytics = {
      learningAnalytics: personalization.learningAnalytics,
      progressHistory: personalization.progressHistory.slice(-10), // Last 10 sessions
      strengths: personalization.aiProfile.strengths,
      weaknesses: personalization.aiProfile.weaknesses,
      learningPatterns: personalization.aiProfile.learningPatterns
    };
    
    res.json({
      success: true,
      data: analytics,
      message: 'Learning analytics retrieved successfully'
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
