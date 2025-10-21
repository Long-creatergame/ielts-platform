const Test = require('../models/Test');

// Create payment session
const createPayment = async (req, res) => {
  try {
    const { testId } = req.body;
    const userId = req.user.userId;

    // Find test
    const test = await Test.findOne({ _id: testId, userId });
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // In a real app, this would integrate with Stripe
    // For now, we'll just return a mock payment session
    res.json({
      message: 'Payment session created',
      paymentUrl: `/payment/${testId}`,
      amount: 999 // $9.99 in cents
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Unlock test results
const unlockTest = async (req, res) => {
  try {
    const { testId } = req.body;
    const userId = req.user.userId;

    // Find and update test
    const test = await Test.findOneAndUpdate(
      { _id: testId, userId },
      { paid: true },
      { new: true }
    );

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.json({
      message: 'Test results unlocked successfully',
      test
    });
  } catch (error) {
    console.error('Unlock test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createPayment,
  unlockTest
};
