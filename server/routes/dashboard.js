const express = require('express');
const User = require('../models/User');
const Test = require('../models/Test');
const AIPersonalization = require('../models/AIPersonalization');
const auth = require('../middleware/auth');

const router = express.Router();

// Get dashboard data
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get user's tests
    const tests = await Test.find({ userId }).sort({ createdAt: -1 }).limit(10);
    
    // Calculate statistics
    const totalTests = tests.length;
    const completedTests = tests.filter(test => test.completed).length;
    const averageBand = tests.length > 0 
      ? tests.reduce((sum, test) => sum + (test.totalBand || 0), 0) / tests.length 
      : 0;

    // Calculate streak (consecutive days with tests)
    const streakDays = calculateStreak(tests);

    // Get AI personalization data
    let personalization = null;
    try {
      const aiData = await AIPersonalization.findOne({ userId });
      if (aiData) {
        personalization = {
          greeting: aiData.greeting || `Hello ${user.name}!`,
          strengths: aiData.strengths || [],
          weaknesses: aiData.weaknesses || [],
          recommendations: aiData.recommendations || []
        };
      }
    } catch (error) {
      console.error('Error fetching personalization:', error);
    }

    // Get recent activity
    const recentActivity = tests.slice(0, 5).map(test => ({
      id: test._id,
      type: 'test',
      skill: test.skill || 'full',
      status: test.completed ? 'completed' : 'in-progress',
      score: test.totalBand,
      date: test.createdAt,
      title: `${(test.skill || 'Full').charAt(0).toUpperCase() + (test.skill || 'Full').slice(1)} Test`
    }));

    // Get coach message based on user progress
    const coachMessage = generateCoachMessage(user, tests, averageBand);

    const dashboardData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        isTrialUsed: user.isTrialUsed,
        targetBand: user.targetBand,
        currentLevel: user.currentLevel,
        goal: user.goal
      },
      statistics: {
        totalTests,
        completedTests,
        averageBand: Math.round(averageBand * 10) / 10,
        streakDays,
        accuracy: calculateAccuracy(tests)
      },
      recentTests: tests.slice(0, 5),
      recentActivity,
      personalization,
      coachMessage
    };

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Dashboard error:', error);
    // Return graceful response to prevent frontend crash
    res.status(200).json({ 
      success: true, 
      data: {
        user: {
          id: req.user?._id || null,
          name: 'User',
          email: '',
          plan: 'free',
          isTrialUsed: false,
          targetBand: 6.5,
          currentLevel: 'A2',
          goal: 'Thử sức'
        },
        statistics: {
          totalTests: 0,
          completedTests: 0,
          averageBand: 0,
          streakDays: 0,
          accuracy: 0
        },
        recentTests: [],
        recentActivity: [],
        personalization: null,
        coachMessage: 'Welcome! Complete your first test to get started.'
      }
    });
  }
});

// Helper function to calculate streak
function calculateStreak(tests) {
  if (tests.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  // Check each day going backwards
  for (let i = 0; i < 30; i++) { // Check last 30 days max
    const dayStart = new Date(currentDate);
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    const hasTest = tests.some(test => {
      const testDate = new Date(test.createdAt);
      return testDate >= dayStart && testDate <= dayEnd;
    });
    
    if (hasTest) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

// Helper function to calculate accuracy
function calculateAccuracy(tests) {
  if (tests.length === 0) return 0;
  
  const completedTests = tests.filter(test => test.completed);
  if (completedTests.length === 0) return 0;
  
  let totalQuestions = 0;
  let correctAnswers = 0;
  
  completedTests.forEach(test => {
    if (test.skillScores) {
      Object.values(test.skillScores).forEach(skillScore => {
        if (typeof skillScore === 'object' && skillScore !== null) {
          totalQuestions += skillScore.total || 0;
          correctAnswers += skillScore.correct || 0;
        }
      });
    }
  });
  
  return totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
}

// Helper function to generate coach message
function generateCoachMessage(user, tests, averageBand) {
  const completedTests = tests.filter(test => test.completed);
  
  if (completedTests.length === 0) {
    return {
      message: "🎯 Welcome! Start your first test to begin your IELTS journey.",
      type: "welcome"
    };
  }
  
  if (averageBand >= 7.0) {
    return {
      message: "🌟 Excellent work! You're performing at a high level. Keep it up!",
      type: "excellent"
    };
  } else if (averageBand >= 6.0) {
    return {
      message: "💪 Great progress! You're on track to reach your target band score.",
      type: "good"
    };
  } else if (averageBand >= 5.0) {
    return {
      message: "📈 Good start! Focus on your weak areas to improve faster.",
      type: "encouraging"
    };
  } else {
    return {
      message: "🎯 Don't worry! Every expert was once a beginner. Keep practicing!",
      type: "motivational"
    };
  }
}

module.exports = router;