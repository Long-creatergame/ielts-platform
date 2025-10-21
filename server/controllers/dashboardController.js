const Test = require('../models/Test');
const User = require('../models/User');
const { getCoachMessage, getTimeBasedGreeting, getSkillFeedback, getRecommendations } = require('../utils/coachMessages');

// Get dashboard data
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user info
    const user = await User.findById(userId).select('-password');

    // Get test history
    const tests = await Test.find({ userId })
      .sort({ dateTaken: -1 })
      .limit(10)
      .select('-answers');

    // Calculate statistics
    const totalTests = tests.length;
    const averageBand = totalTests > 0 
      ? tests.reduce((sum, test) => sum + test.totalBand, 0) / totalTests 
      : 0;

    // Get latest test
    const latestTest = tests[0];

    // Generate personalized messages
    const coachMessage = getCoachMessage(user, latestTest);
    const greeting = getTimeBasedGreeting(user.name);
    
    let skillFeedback = null;
    let recommendations = [];
    
    if (latestTest) {
      skillFeedback = getSkillFeedback(latestTest.skillBands, user.targetBand);
      recommendations = getRecommendations(user, latestTest);
    }

    // Update user stats
    user.totalTests = totalTests;
    user.averageBand = Math.round(averageBand * 2) / 2;
    await user.save();

    res.json({
      user,
      tests,
      statistics: {
        totalTests,
        averageBand: Math.round(averageBand * 2) / 2,
        latestTest
      },
      personalization: {
        coachMessage,
        greeting,
        skillFeedback,
        recommendations
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardData
};
