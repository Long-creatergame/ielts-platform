const express = require('express');
const Analytics = require('../models/Analytics');

const router = express.Router();

// Track single event
router.post('/track', async (req, res) => {
  try {
    const { event, userId, sessionId, timestamp, url, userAgent, data } = req.body;

    const analyticsEvent = new Analytics({
      event,
      userId,
      sessionId,
      timestamp: new Date(timestamp),
      url,
      userAgent,
      data,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    await analyticsEvent.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

// Track batch events
router.post('/batch', async (req, res) => {
  try {
    const { events } = req.body;

    const analyticsEvents = events.map(event => ({
      ...event,
      timestamp: new Date(event.timestamp),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }));

    await Analytics.insertMany(analyticsEvents);

    res.json({ success: true, count: events.length });
  } catch (error) {
    console.error('Analytics batch tracking error:', error);
    res.status(500).json({ error: 'Failed to track events' });
  }
});

// Get user analytics
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, event } = req.query;

    const query = { userId };
    
    if (startDate) {
      query.timestamp = { ...query.timestamp, $gte: new Date(startDate) };
    }
    
    if (endDate) {
      query.timestamp = { ...query.timestamp, $lte: new Date(endDate) };
    }
    
    if (event) {
      query.event = event;
    }

    const analytics = await Analytics.find(query).sort({ timestamp: -1 });

    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Analytics retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve analytics' });
  }
});

// Get test performance analytics
router.get('/performance/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get test completion events
    const testCompletions = await Analytics.find({
      userId,
      event: 'test_complete'
    }).sort({ timestamp: -1 });

    // Calculate performance metrics
    const metrics = {
      totalTests: testCompletions.length,
      averageScore: 0,
      skillBreakdown: {},
      timeSpent: {},
      improvement: {}
    };

    if (testCompletions.length > 0) {
      const scores = testCompletions.map(test => test.data.score || 0);
      metrics.averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

      // Skill breakdown
      testCompletions.forEach(test => {
        const skill = test.data.skill;
        if (!metrics.skillBreakdown[skill]) {
          metrics.skillBreakdown[skill] = {
            count: 0,
            totalScore: 0,
            averageScore: 0
          };
        }
        metrics.skillBreakdown[skill].count++;
        metrics.skillBreakdown[skill].totalScore += test.data.score || 0;
      });

      // Calculate average scores per skill
      Object.keys(metrics.skillBreakdown).forEach(skill => {
        const breakdown = metrics.skillBreakdown[skill];
        breakdown.averageScore = breakdown.totalScore / breakdown.count;
      });
    }

    res.json({ success: true, data: metrics });
  } catch (error) {
    console.error('Performance analytics error:', error);
    res.status(500).json({ error: 'Failed to retrieve performance analytics' });
  }
});

// Get engagement analytics
router.get('/engagement/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const engagement = await Analytics.aggregate([
      {
        $match: {
          userId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            event: '$event'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          events: {
            $push: {
              event: '$_id.event',
              count: '$count'
            }
          },
          totalEvents: { $sum: '$count' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    res.json({ success: true, data: engagement });
  } catch (error) {
    console.error('Engagement analytics error:', error);
    res.status(500).json({ error: 'Failed to retrieve engagement analytics' });
  }
});

module.exports = router;
