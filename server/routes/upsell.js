import express from 'express';
import User from '../models/User.js';

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

// GET /api/upsell/recommendation/:userId - Get personalized upsell recommendation
router.get('/recommendation/:userId', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    // Simple recommendation logic based on user's current level
    let recommendation = {
      skill: 'Writing',
      message: 'Hãy thử Writing Master Pack để cải thiện kỹ năng viết của bạn!',
      package: 'premium'
    };

    if (user.currentLevel === 'A1' || user.currentLevel === 'A2') {
      recommendation = {
        skill: 'Listening',
        message: 'Listening là kỹ năng quan trọng để bắt đầu học IELTS. Hãy thử gói Standard!',
        package: 'standard'
      };
    } else if (user.currentLevel === 'B1' || user.currentLevel === 'B2') {
      recommendation = {
        skill: 'Speaking',
        message: 'Speaking sẽ giúp bạn đạt band cao hơn. Hãy thử gói Ultimate!',
        package: 'ultimate'
      };
    }

    res.json({
      message: 'Upsell recommendation fetched successfully',
      recommendation
    });
  } catch (error) {
    console.error('Upsell recommendation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;