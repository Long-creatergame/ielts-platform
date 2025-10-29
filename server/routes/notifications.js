const express = require('express');
const User = require('../models/User');
const Test = require('../models/Test');
const emailService = require('../services/emailService');
const auth = require('../middleware/auth');

const router = express.Router();

// Send welcome email to new user
router.post('/welcome', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await emailService.sendWelcomeEmail(user);
    
    res.json({
      success: result.success,
      message: result.success ? 'Welcome email sent successfully' : 'Failed to send welcome email',
      error: result.error
    });
  } catch (error) {
    console.error('Welcome email error:', error);
    res.status(500).json({ error: 'Failed to send welcome email' });
  }
});

// Send weekly report email
router.post('/weekly-report', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate weekly report data
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const analytics = await Test.find({
      userId: String(userId),
      completedAt: { $gte: oneWeekAgo }
    }).sort({ completedAt: -1 });

    const testCompletions = analytics.filter(test => test.completed);
    const totalTests = testCompletions.length;
    const averageScore = testCompletions.length > 0 
      ? testCompletions.reduce((sum, test) => sum + (test.score?.overall || 0), 0) / testCompletions.length
      : 0;

    const reportData = {
      week: {
        start: oneWeekAgo.toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      metrics: {
        totalTests,
        averageScore: Math.round(averageScore * 10) / 10
      },
      insights: [],
      recommendations: []
    };

    // Generate insights
    if (totalTests > 0) {
      reportData.insights.push(`You completed ${totalTests} practice test${totalTests > 1 ? 's' : ''} this week!`);
    }
    
    if (averageScore > 0) {
      reportData.insights.push(`Your average score was ${averageScore.toFixed(1)}/9.0`);
    }

    if (totalTests < 3) {
      reportData.recommendations.push('Try to complete at least 3 practice tests per week for better progress');
    }

    const result = await emailService.sendWeeklyReport(user, reportData);
    
    res.json({
      success: result.success,
      message: result.success ? 'Weekly report sent successfully' : 'Failed to send weekly report',
      error: result.error
    });
  } catch (error) {
    console.error('Weekly report error:', error);
    res.status(500).json({ error: 'Failed to send weekly report' });
  }
});

// Send test completion email
router.post('/test-completion', auth, async (req, res) => {
  try {
    const { testId } = req.body;
    
    if (!testId) {
      return res.status(400).json({ error: 'Test ID is required' });
    }

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const user = await User.findById(test.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await emailService.sendTestCompletionEmail(user, test);
    
    res.json({
      success: result.success,
      message: result.success ? 'Test completion email sent successfully' : 'Failed to send test completion email',
      error: result.error
    });
  } catch (error) {
    console.error('Test completion email error:', error);
    res.status(500).json({ error: 'Failed to send test completion email' });
  }
});

// Send milestone achievement email
router.post('/milestone', auth, async (req, res) => {
  try {
    const { milestone } = req.body;
    
    if (!milestone) {
      return res.status(400).json({ error: 'Milestone is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await emailService.sendMilestoneEmail(user, milestone);
    
    res.json({
      success: result.success,
      message: result.success ? 'Milestone email sent successfully' : 'Failed to send milestone email',
      error: result.error
    });
  } catch (error) {
    console.error('Milestone email error:', error);
    res.status(500).json({ error: 'Failed to send milestone email' });
  }
});

// Get notification preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const preferences = {
      welcomeEmail: user.notificationPreferences?.welcomeEmail ?? true,
      weeklyReport: user.notificationPreferences?.weeklyReport ?? true,
      testCompletion: user.notificationPreferences?.testCompletion ?? true,
      milestones: user.notificationPreferences?.milestones ?? true,
      marketing: user.notificationPreferences?.marketing ?? false
    };

    res.json({ success: true, data: preferences });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to get notification preferences' });
  }
});

// Update notification preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { preferences } = req.body;
    
    if (!preferences) {
      return res.status(400).json({ error: 'Preferences are required' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $set: { notificationPreferences: preferences }
    });

    res.json({ success: true, message: 'Notification preferences updated successfully' });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

// Test email service
router.post('/test', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await emailService.sendEmail(
      user.email,
      'Test Email from IELTS Platform',
      '<h1>Test Email</h1><p>This is a test email to verify email functionality.</p>'
    );

    res.json({
      success: result.success,
      message: result.success ? 'Test email sent successfully' : 'Failed to send test email',
      error: result.error
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

module.exports = router;