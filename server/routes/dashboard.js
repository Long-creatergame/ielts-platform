import express from 'express';
import User from '../models/User.js';
import Test from '../models/Test.js';

const router = express.Router();

// Auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-key-change-this-in-production');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// GET /api/dashboard - Get user dashboard data
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    // Get user's tests
    const tests = await Test.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5);
    
    // Calculate statistics
    const totalTests = await Test.countDocuments({ userId: user._id });
    const completedTests = await Test.countDocuments({ userId: user._id, completed: true });
    const averageBand = await Test.aggregate([
      { $match: { userId: user._id, completed: true } },
      { $group: { _id: null, avgBand: { $avg: '$totalBand' } } }
    ]);

    // Generate coach message based on performance
    let coachMessage = {
      message: "🤖 AI Coach: Welcome to IELTS Platform! Start your first test to get personalized feedback.",
      type: "welcome"
    };

    if (completedTests > 0) {
      const latestTest = tests[0];
      if (latestTest.overallBand >= 7.0) {
        coachMessage = {
          message: `🎉 Excellent work ${user.name}! Your latest test scored ${latestTest.overallBand}. Keep up the great performance!`,
          type: "success"
        };
      } else if (latestTest.overallBand >= 6.0) {
        coachMessage = {
          message: `👍 Good progress ${user.name}! You scored ${latestTest.overallBand}. Focus on your weakest skill to improve further.`,
          type: "encouragement"
        };
      } else {
        coachMessage = {
          message: `💪 Keep practicing ${user.name}! Every test helps you improve. Your score: ${latestTest.overallBand}`,
          type: "motivation"
        };
      }
    }

    const dashboardData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        goal: user.goal,
        targetBand: user.targetBand,
        currentLevel: user.currentLevel,
        paid: user.paid,
        freeTestsUsed: user.freeTestsUsed
      },
      statistics: {
        totalTests,
        completedTests,
        averageBand: averageBand.length > 0 ? Math.round(averageBand[0].avgBand * 10) / 10 : 0,
        streakDays: user.streakDays
      },
      recentTests: tests,
      coachMessage
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;