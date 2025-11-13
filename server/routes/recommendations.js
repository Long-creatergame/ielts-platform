const express = require('express');
const User = require('../models/User');
const Test = require('../models/Test');
const AIPersonalization = require('../models/AIPersonalization');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Get practice recommendations
router.get('/practice', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's test history
    const tests = await Test.find({ userId }).sort({ createdAt: -1 });
    
    // Analyze user's performance
    const analysis = analyzeUserPerformance(tests);
    
    // Generate recommendations based on analysis
    const recommendations = generatePracticeRecommendations(analysis, userId);
    
    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error('Practice recommendations error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch recommendations' });
  }
});

// Get AI recommendations
router.get('/ai/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized access' });
    }
    
    // Get AI personalization data
    const personalization = await AIPersonalization.findOne({ userId });
    
    if (!personalization) {
      return res.json({ success: true, data: [] });
    }
    
    // Generate AI recommendations based on personalization
    const recommendations = generateAIRecommendations(personalization);
    
    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error('AI recommendations error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch AI recommendations' });
  }
});

// Action on recommendation
router.patch('/:recommendationId/action', auth, async (req, res) => {
  try {
    const { recommendationId } = req.params;
    const { action } = req.body;
    
    // For now, just return success
    // In a real implementation, you would track recommendation actions
    res.json({ 
      success: true, 
      message: `Recommendation ${action}ed successfully` 
    });
  } catch (error) {
    console.error('Recommendation action error:', error);
    res.status(500).json({ success: false, error: 'Failed to process action' });
  }
});

// Helper function to analyze user performance
function analyzeUserPerformance(tests) {
  const completedTests = tests.filter(test => test.status === 'completed');
  
  if (completedTests.length === 0) {
    return {
      hasData: false,
      skills: {
        reading: { score: 0, attempts: 0, trend: 'stable' },
        writing: { score: 0, attempts: 0, trend: 'stable' },
        listening: { score: 0, attempts: 0, trend: 'stable' },
        speaking: { score: 0, attempts: 0, trend: 'stable' }
      },
      overallScore: 0,
      totalTests: 0
    };
  }
  
  const skills = ['reading', 'writing', 'listening', 'speaking'];
  const skillAnalysis = {};
  
  skills.forEach(skill => {
    const skillTests = completedTests.filter(test => test.skill === skill);
    const scores = skillTests.map(test => test.bandScore || 0);
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    
    skillAnalysis[skill] = {
      score: Math.round(averageScore * 10) / 10,
      attempts: skillTests.length,
      trend: calculateTrend(scores)
    };
  });
  
  const overallScore = Object.values(skillAnalysis).reduce((sum, skill) => sum + skill.score, 0) / 4;
  
  return {
    hasData: true,
    skills: skillAnalysis,
    overallScore: Math.round(overallScore * 10) / 10,
    totalTests: completedTests.length
  };
}

// Helper function to calculate trend
function calculateTrend(scores) {
  if (scores.length < 2) return 'stable';
  
  const recent = scores.slice(0, Math.ceil(scores.length / 2));
  const older = scores.slice(Math.ceil(scores.length / 2));
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  
  const difference = recentAvg - olderAvg;
  
  if (difference > 0.5) return 'up';
  if (difference < -0.5) return 'down';
  return 'stable';
}

// Helper function to generate practice recommendations
function generatePracticeRecommendations(analysis, userId) {
  const recommendations = [];
  
  if (!analysis.hasData) {
    return [
      {
        _id: 'rec_1',
        title: 'Start with Reading Practice',
        description: 'Begin your IELTS journey with reading comprehension exercises',
        type: 'practice',
        priority: 'high',
        skill: 'reading',
        difficulty: 'beginner',
        estimatedTime: 30,
        actionUrl: `/quick-practice/reading`
      },
      {
        _id: 'rec_2',
        title: 'Try Listening Exercises',
        description: 'Practice listening skills with audio-based questions',
        type: 'practice',
        priority: 'high',
        skill: 'listening',
        difficulty: 'beginner',
        estimatedTime: 25,
        actionUrl: `/quick-practice/listening`
      }
    ];
  }
  
  // Find weakest skill
  const skills = Object.entries(analysis.skills);
  const weakestSkill = skills.reduce((min, [skill, data]) => 
    data.score < min.score ? { skill, ...data } : min, 
    { skill: 'reading', score: 10 }
  );
  
  // Generate recommendations based on weakest skill
  if (weakestSkill.score < 6.0) {
    recommendations.push({
      _id: `rec_${weakestSkill.skill}_1`,
      title: `Focus on ${weakestSkill.skill.charAt(0).toUpperCase() + weakestSkill.skill.slice(1)}`,
      description: `Your ${weakestSkill.skill} score is ${weakestSkill.score}. Practice more to improve.`,
      type: 'practice',
      priority: 'high',
      skill: weakestSkill.skill,
      difficulty: 'intermediate',
      estimatedTime: 45,
      actionUrl: `/quick-practice/${weakestSkill.skill}`
    });
  }
  
  // Add general recommendations
  recommendations.push(
    {
      _id: 'rec_general_1',
      title: 'Take a Full Practice Test',
      description: 'Test your overall IELTS skills with a complete practice test',
      type: 'test',
      priority: 'medium',
      skill: 'all',
      difficulty: 'advanced',
      estimatedTime: 180,
      actionUrl: '/test/start'
    },
    {
      _id: 'rec_general_2',
      title: 'Review Test History',
      description: 'Analyze your previous test results to identify patterns',
      type: 'analysis',
      priority: 'low',
      skill: 'all',
      difficulty: 'any',
      estimatedTime: 15,
      actionUrl: '/test-history'
    }
  );
  
  return recommendations;
}

// Helper function to generate AI recommendations
function generateAIRecommendations(personalization) {
  const recommendations = [];
  
  // Generate recommendations based on weaknesses
  if (personalization.weaknesses && personalization.weaknesses.length > 0) {
    personalization.weaknesses.forEach((weakness, index) => {
      recommendations.push({
        _id: `ai_rec_weakness_${index}`,
        title: `Improve ${weakness.area}`,
        description: weakness.description || `Focus on improving your ${weakness.area} skills`,
        type: 'ai',
        priority: 'high',
        skill: weakness.skill || 'general',
        difficulty: weakness.level || 'intermediate',
        estimatedTime: weakness.estimatedTime || 30,
        actionUrl: weakness.actionUrl || '/dashboard'
      });
    });
  }
  
  // Generate recommendations based on strengths
  if (personalization.strengths && personalization.strengths.length > 0) {
    personalization.strengths.forEach((strength, index) => {
      recommendations.push({
        _id: `ai_rec_strength_${index}`,
        title: `Maintain ${strength.area}`,
        description: `Keep practicing ${strength.area} to maintain your strong performance`,
        type: 'ai',
        priority: 'low',
        skill: strength.skill || 'general',
        difficulty: 'advanced',
        estimatedTime: 20,
        actionUrl: strength.actionUrl || '/dashboard'
      });
    });
  }
  
  // Add general AI recommendations
  if (recommendations.length === 0) {
    recommendations.push({
      _id: 'ai_rec_general_1',
      title: 'AI Study Plan',
      description: 'Let AI create a personalized study plan for you',
      type: 'ai',
      priority: 'medium',
      skill: 'all',
      difficulty: 'any',
      estimatedTime: 60,
      actionUrl: '/dashboard?tab=ai-personalization'
    });
  }
  
  return recommendations;
}

module.exports = router;
