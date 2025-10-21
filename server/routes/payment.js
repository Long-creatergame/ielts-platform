const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Test = require('../models/Test');
const auth = require('../middleware/auth');

// Create payment session
router.post('/create', auth, async (req, res) => {
  try {
    const { plan, amount } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Mock payment URL generation (replace with real payment gateway)
    const paymentData = {
      userId,
      plan,
      amount,
      paymentUrl: `https://payment-gateway.com/checkout?amount=${amount}&plan=${plan}&user=${userId}`,
      sessionId: `session_${Date.now()}_${userId}`
    };

    res.json({
      success: true,
      paymentUrl: paymentData.paymentUrl,
      sessionId: paymentData.sessionId,
      message: 'Payment session created successfully'
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify payment (webhook/callback)
router.post('/verify', async (req, res) => {
  try {
    const { sessionId, status, amount, plan } = req.body;

    if (status === 'success') {
      // Find user by session or other identifier
      const sessionData = sessionId.split('_');
      const userId = sessionData[2];

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update user payment status
      user.paid = true;
      user.subscriptionPlan = plan;
      user.totalSpent += amount;
      
      // Set subscription expiry based on plan
      const expiryDate = new Date();
      if (plan === 'standard') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (plan === 'premium') {
        expiryDate.setMonth(expiryDate.getMonth() + 3);
      } else if (plan === 'ultimate') {
        expiryDate.setMonth(expiryDate.getMonth() + 6);
      }
      user.subscriptionExpires = expiryDate;

      await user.save();

      // Unlock all locked tests for this user
      await Test.updateMany(
        { userId, resultLocked: true },
        { 
          resultLocked: false, 
          feedbackUnlocked: true,
          isPaid: true 
        }
      );

      res.json({
        success: true,
        message: 'Payment verified and account upgraded successfully'
      });
    } else {
      res.json({
        success: false,
        message: 'Payment failed'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unlock specific test result
router.post('/unlock/:testId', auth, async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user.userId;

    const test = await Test.findOne({ _id: testId, userId });
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Check if user has paid access
    const user = await User.findById(userId);
    if (!user.paid && user.freeTestsUsed >= 1) {
      return res.status(403).json({ 
        message: 'Payment required to unlock results',
        paywall: true 
      });
    }

    // Unlock the test
    test.resultLocked = false;
    test.feedbackUnlocked = true;
    await test.save();

    res.json({
      success: true,
      message: 'Test results unlocked successfully'
    });
  } catch (error) {
    console.error('Test unlock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pricing plans
router.get('/plans', (req, res) => {
  const plans = [
    {
      id: 'free',
      name: '🆓 Free Trial',
      description: '1 bài thi miễn phí',
      price: 0,
      features: ['1 bài thi đầy đủ', 'Kết quả cơ bản', 'Không giới hạn thời gian']
    },
    {
      id: 'standard',
      name: '💼 Standard',
      description: '4 đề luyện/tháng + phân tích chi tiết',
      price: 129000,
      features: ['4 đề luyện/tháng', 'Phân tích chi tiết', 'Feedback cá nhân hóa', 'Theo dõi tiến trình']
    },
    {
      id: 'premium',
      name: '🧠 Premium',
      description: 'Không giới hạn đề + feedback AI chi tiết',
      price: 249000,
      features: ['Không giới hạn đề', 'AI feedback chi tiết', 'Phân tích điểm yếu', 'Lộ trình học cá nhân']
    },
    {
      id: 'ultimate',
      name: '🎓 Ultimate',
      description: 'Có Speaking AI + Writing coach',
      price: 499000,
      features: ['Tất cả tính năng Premium', 'Speaking AI', 'Writing coach 1-1', 'Hỗ trợ 24/7']
    }
  ];

  res.json({ plans });
});

module.exports = router;