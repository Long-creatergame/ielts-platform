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

// GET /api/payment/pricing - Get pricing plans
router.get('/pricing', (req, res) => {
  const pricingPlans = [
    {
      id: 'standard',
      name: 'Standard',
      price: 129000,
      description: '4 đề luyện/tháng + phân tích chi tiết',
      features: ['4 bài thi/tháng', 'Phân tích chi tiết', 'Theo dõi tiến trình']
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 249000,
      description: 'Không giới hạn đề + feedback AI chi tiết',
      features: ['Không giới hạn bài thi', 'Feedback AI chi tiết', 'Phân tích nâng cao']
    },
    {
      id: 'ultimate',
      name: 'Ultimate',
      price: 499000,
      description: 'Có Speaking AI + Writing coach',
      features: ['Speaking AI', 'Writing coach', 'Hỗ trợ 1-1', 'Tất cả tính năng Premium']
    }
  ];

  res.json({
    message: 'Pricing plans fetched successfully',
    plans: pricingPlans
  });
});

// POST /api/payment/create - Create payment session
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { planId } = req.body;
    const user = req.user;

    // For demo purposes, we'll just return a mock payment URL
    const paymentUrl = `https://ielts-platform-two.vercel.app/payment/success?plan=${planId}&userId=${user._id}`;

    res.json({
      message: 'Payment session created successfully',
      paymentUrl,
      sessionId: `session_${Date.now()}`
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/payment/verify - Verify payment
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { sessionId, planId } = req.body;
    const user = req.user;

    // For demo purposes, we'll just mark user as paid
    user.paid = true;
    user.subscriptionPlan = planId;
    user.subscriptionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await user.save();

    res.json({
      message: 'Payment verified successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        paid: user.paid,
        subscriptionPlan: user.subscriptionPlan
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;