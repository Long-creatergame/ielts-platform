const express = require('express');
const OpenAI = require('openai');
const User = require('../models/User');
const Test = require('../models/Test');
const authMiddleware = require('./auth.js');

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate personalized skill improvement recommendations
router.post('/generate-recommendations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { skill, testResults, currentLevel } = req.body;

    // Get user's test history
    const userTests = await Test.find({ 
      userId, 
      completed: true 
    }).sort({ dateTaken: -1 }).limit(10);

    if (userTests.length === 0) {
      return res.json({
        recommendations: [],
        message: 'Complete more tests to get personalized recommendations'
      });
    }

    // Analyze user's performance patterns
    const performanceAnalysis = analyzeUserPerformance(userTests, skill);
    
    // Generate AI-powered recommendations
    const recommendations = await generateAIRecommendations(
      performanceAnalysis, 
      skill, 
      currentLevel
    );

    // Save recommendations to user profile
    await User.findByIdAndUpdate(userId, {
      $push: {
        aiRecommendations: {
          skill,
          recommendations,
          generatedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      }
    });

    res.json({
      success: true,
      recommendations,
      performanceAnalysis
    });

  } catch (error) {
    console.error('AI recommendations error:', error);
    res.status(500).json({ 
      error: 'Failed to generate recommendations',
      details: error.message 
    });
  }
});

// Get user's current recommendations
router.get('/my-recommendations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { skill } = req.query;

    const user = await User.findById(userId).select('aiRecommendations');
    
    if (!user || !user.aiRecommendations) {
      return res.json({ recommendations: [] });
    }

    // Filter by skill if specified
    let recommendations = user.aiRecommendations;
    if (skill) {
      recommendations = recommendations.filter(rec => rec.skill === skill);
    }

    // Remove expired recommendations
    const validRecommendations = recommendations.filter(
      rec => new Date(rec.expiresAt) > new Date()
    );

    res.json({
      success: true,
      recommendations: validRecommendations
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Track user progress on recommendations
router.post('/track-progress', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { recommendationId, action, completed } = req.body;

    // Update user's recommendation progress
    await User.findOneAndUpdate(
      { 
        _id: userId,
        'aiRecommendations._id': recommendationId 
      },
      {
        $set: {
          'aiRecommendations.$.progress': {
            action,
            completed,
            updatedAt: new Date()
          }
        }
      }
    );

    res.json({ success: true, message: 'Progress tracked successfully' });

  } catch (error) {
    console.error('Track progress error:', error);
    res.status(500).json({ error: 'Failed to track progress' });
  }
});

// Generate follow-up recommendations based on progress
router.post('/follow-up', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { skill } = req.body;

    // Get user's recent progress
    const user = await User.findById(userId).select('aiRecommendations');
    const recentRecommendations = user.aiRecommendations
      .filter(rec => rec.skill === skill)
      .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt))[0];

    if (!recentRecommendations) {
      return res.json({ 
        message: 'No previous recommendations found for this skill' 
      });
    }

    // Analyze progress and generate follow-up
    const followUpRecommendations = await generateFollowUpRecommendations(
      recentRecommendations,
      skill
    );

    res.json({
      success: true,
      followUpRecommendations
    });

  } catch (error) {
    console.error('Follow-up recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate follow-up recommendations' });
  }
});

// Helper function to analyze user performance
function analyzeUserPerformance(tests, skill) {
  const skillTests = tests.filter(test => 
    test.skillScores && test.skillScores[skill]
  );

  if (skillTests.length === 0) {
    return {
      averageScore: 0,
      trend: 'no_data',
      weaknesses: [],
      strengths: []
    };
  }

  const scores = skillTests.map(test => test.skillBands[skill] || 0);
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  // Calculate trend
  const recentScores = scores.slice(0, 3);
  const olderScores = scores.slice(3, 6);
  const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
  const olderAvg = olderScores.length > 0 ? 
    olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length : recentAvg;
  
  const trend = recentAvg > olderAvg ? 'improving' : 
                recentAvg < olderAvg ? 'declining' : 'stable';

  // Identify common weaknesses based on skill
  const weaknesses = identifyWeaknesses(skillTests, skill);
  const strengths = identifyStrengths(skillTests, skill);

  return {
    averageScore,
    trend,
    weaknesses,
    strengths,
    totalTests: skillTests.length
  };
}

// Helper function to identify weaknesses
function identifyWeaknesses(tests, skill) {
  const weaknesses = [];
  
  tests.forEach(test => {
    if (test.aiFeedback) {
      const feedback = test.aiFeedback.toLowerCase();
      
      if (skill === 'writing') {
        if (feedback.includes('grammar') || feedback.includes('grammatical')) {
          weaknesses.push('grammar');
        }
        if (feedback.includes('vocabulary') || feedback.includes('lexical')) {
          weaknesses.push('vocabulary');
        }
        if (feedback.includes('coherence') || feedback.includes('organization')) {
          weaknesses.push('coherence');
        }
      } else if (skill === 'speaking') {
        if (feedback.includes('fluency') || feedback.includes('hesitation')) {
          weaknesses.push('fluency');
        }
        if (feedback.includes('pronunciation')) {
          weaknesses.push('pronunciation');
        }
        if (feedback.includes('vocabulary')) {
          weaknesses.push('vocabulary');
        }
      }
    }
  });

  // Count frequency and return most common weaknesses
  const weaknessCount = {};
  weaknesses.forEach(weakness => {
    weaknessCount[weakness] = (weaknessCount[weakness] || 0) + 1;
  });

  return Object.entries(weaknessCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([weakness]) => weakness);
}

// Helper function to identify strengths
function identifyStrengths(tests, skill) {
  const strengths = [];
  
  tests.forEach(test => {
    if (test.aiFeedback) {
      const feedback = test.aiFeedback.toLowerCase();
      
      if (feedback.includes('good') || feedback.includes('well') || feedback.includes('strong')) {
        if (skill === 'writing') {
          if (feedback.includes('structure') || feedback.includes('organization')) {
            strengths.push('organization');
          }
          if (feedback.includes('vocabulary') || feedback.includes('word choice')) {
            strengths.push('vocabulary');
          }
        } else if (skill === 'speaking') {
          if (feedback.includes('fluency') || feedback.includes('smooth')) {
            strengths.push('fluency');
          }
          if (feedback.includes('pronunciation')) {
            strengths.push('pronunciation');
          }
        }
      }
    }
  });

  return [...new Set(strengths)]; // Remove duplicates
}

// Generate AI-powered recommendations
async function generateAIRecommendations(performanceAnalysis, skill, currentLevel) {
  try {
    const prompt = `
You are an expert IELTS tutor. Based on the following performance analysis, generate 5 specific, actionable recommendations for improving ${skill} skills.

Performance Analysis:
- Average Score: ${performanceAnalysis.averageScore.toFixed(1)}
- Trend: ${performanceAnalysis.trend}
- Weaknesses: ${performanceAnalysis.weaknesses.join(', ')}
- Strengths: ${performanceAnalysis.strengths.join(', ')}
- Current Level: ${currentLevel}

Generate recommendations that are:
1. Specific and actionable
2. Tailored to the identified weaknesses
3. Appropriate for the current level
4. Include practice exercises or resources
5. Set realistic timeframes

Respond in JSON format:
{
  "recommendations": [
    {
      "id": "rec_1",
      "title": "Recommendation title",
      "description": "Detailed description",
      "action": "Specific action to take",
      "timeframe": "e.g., 2 weeks",
      "difficulty": "beginner/intermediate/advanced",
      "resources": ["resource1", "resource2"],
      "expectedImprovement": "Expected band score improvement"
    }
  ]
}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    });

    const response = JSON.parse(completion.choices[0].message.content);
    return response.recommendations;

  } catch (error) {
    console.error('AI recommendation generation error:', error);
    
    // Fallback recommendations
    return generateFallbackRecommendations(performanceAnalysis, skill);
  }
}

// Generate follow-up recommendations
async function generateFollowUpRecommendations(previousRecommendations, skill) {
  try {
    const prompt = `
You are an expert IELTS tutor. The student has been working on these recommendations for ${skill}:

${previousRecommendations.recommendations.map(rec => 
  `- ${rec.title}: ${rec.description}`
).join('\n')}

Generate 3 follow-up recommendations that:
1. Build on previous progress
2. Address any remaining weaknesses
3. Introduce more advanced techniques
4. Provide new challenges

Respond in JSON format with the same structure as before.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800
    });

    const response = JSON.parse(completion.choices[0].message.content);
    return response.recommendations;

  } catch (error) {
    console.error('Follow-up recommendation generation error:', error);
    return [];
  }
}

// Fallback recommendations when AI is unavailable
function generateFallbackRecommendations(performanceAnalysis, skill) {
  const recommendations = [];
  
  if (performanceAnalysis.weaknesses.includes('grammar')) {
    recommendations.push({
      id: 'rec_grammar_1',
      title: 'Improve Grammar Accuracy',
      description: 'Focus on common grammatical errors and practice with grammar exercises',
      action: 'Complete 5 grammar exercises daily for 2 weeks',
      timeframe: '2 weeks',
      difficulty: 'intermediate',
      resources: ['Grammar books', 'Online exercises'],
      expectedImprovement: '0.5-1.0 band score'
    });
  }

  if (performanceAnalysis.weaknesses.includes('vocabulary')) {
    recommendations.push({
      id: 'rec_vocab_1',
      title: 'Expand Vocabulary Range',
      description: 'Learn and practice using more advanced vocabulary',
      action: 'Learn 10 new words daily and use them in writing/speaking',
      timeframe: '3 weeks',
      difficulty: 'intermediate',
      resources: ['Vocabulary lists', 'Word usage exercises'],
      expectedImprovement: '0.5-1.0 band score'
    });
  }

  if (performanceAnalysis.weaknesses.includes('fluency')) {
    recommendations.push({
      id: 'rec_fluency_1',
      title: 'Improve Speaking Fluency',
      description: 'Practice speaking without hesitation and with natural flow',
      action: 'Record yourself speaking for 5 minutes daily',
      timeframe: '2 weeks',
      difficulty: 'beginner',
      resources: ['Speaking practice topics', 'Recording device'],
      expectedImprovement: '0.5-1.0 band score'
    });
  }

  return recommendations;
}

module.exports = router;
