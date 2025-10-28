const express = require('express');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate weekly report for a user
router.post('/generate', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get analytics data for the past week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const analytics = await Analytics.find({
      userId: String(userId),
      timestamp: { $gte: oneWeekAgo }
    }).sort({ timestamp: -1 });

    // Calculate metrics
    const testCompletions = analytics.filter(a => a.event === 'test_complete');
    const totalTests = testCompletions.length;
    const averageScore = testCompletions.length > 0 
      ? testCompletions.reduce((sum, test) => sum + (test.data?.overallBand || 0), 0) / testCompletions.length
      : 0;

    // Get skill breakdown
    const skillScores = {};
    testCompletions.forEach(test => {
      if (test.data?.skillScores) {
        Object.entries(test.data.skillScores).forEach(([skill, score]) => {
          if (!skillScores[skill]) {
            skillScores[skill] = { total: 0, count: 0 };
          }
          skillScores[skill].total += score;
          skillScores[skill].count += 1;
        });
      }
    });

    // Calculate average scores per skill
    Object.keys(skillScores).forEach(skill => {
      skillScores[skill].average = skillScores[skill].total / skillScores[skill].count;
    });

    // Generate insights
    const insights = [];
    if (totalTests > 0) {
      insights.push(`Bạn đã hoàn thành ${totalTests} bài test trong tuần này!`);
    }
    
    if (averageScore > 0) {
      insights.push(`Điểm trung bình: ${averageScore.toFixed(1)}/9.0`);
    }

    // Find strongest and weakest skills
    const skillAverages = Object.entries(skillScores).map(([skill, data]) => ({
      skill,
      average: data.average
    })).sort((a, b) => b.average - a.average);

    if (skillAverages.length > 0) {
      const strongest = skillAverages[0];
      const weakest = skillAverages[skillAverages.length - 1];
      
      insights.push(`Kỹ năng mạnh nhất: ${strongest.skill} (${strongest.average.toFixed(1)})`);
      insights.push(`Cần cải thiện: ${weakest.skill} (${weakest.average.toFixed(1)})`);
    }

    // Generate recommendations
    const recommendations = [];
    if (totalTests < 3) {
      recommendations.push('Hãy làm thêm bài test để cải thiện kỹ năng!');
    }
    
    if (averageScore < 6.0) {
      recommendations.push('Tập trung vào việc cải thiện điểm số tổng thể.');
    }

    if (skillAverages.length > 0) {
      const weakest = skillAverages[skillAverages.length - 1];
      if (weakest.average < 6.0) {
        recommendations.push(`Dành thêm thời gian luyện tập ${weakest.skill}.`);
      }
    }

    const report = {
      userId: String(userId),
      userName: user.name,
      week: {
        start: oneWeekAgo.toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      metrics: {
        totalTests,
        averageScore: Math.round(averageScore * 10) / 10,
        skillScores: Object.fromEntries(
          Object.entries(skillScores).map(([skill, data]) => [skill, Math.round(data.average * 10) / 10])
        )
      },
      insights,
      recommendations,
      generatedAt: new Date().toISOString()
    };

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Weekly report generation error:', error);
    res.status(500).json({ error: 'Failed to generate weekly report' });
  }
});

// Get user's weekly reports history
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // In a real implementation, you'd store reports in a database
    // For now, we'll generate a fresh report
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const analytics = await Analytics.find({
      userId: String(userId),
      timestamp: { $gte: oneWeekAgo }
    }).sort({ timestamp: -1 });

    const reports = [{
      id: Date.now().toString(),
      week: `${oneWeekAgo.toISOString().split('T')[0]} to ${new Date().toISOString().split('T')[0]}`,
      totalTests: analytics.filter(a => a.event === 'test_complete').length,
      generatedAt: new Date().toISOString()
    }];

    res.json({ success: true, data: reports });
  } catch (error) {
    console.error('Weekly report history error:', error);
    res.status(500).json({ error: 'Failed to get weekly reports' });
  }
});

module.exports = router;
