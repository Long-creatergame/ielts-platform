const express = require('express');
const ProgressTracking = require('../models/ProgressTracking');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get user's progress statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { skill, timeRange = '30' } = req.query;

    // Calculate date range
    const days = parseInt(timeRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build query
    const query = { 
      userId,
      createdAt: { $gte: startDate }
    };
    if (skill && skill !== 'all') {
      query.skill = skill;
    }

    // Get progress data
    const progressData = await ProgressTracking.find(query)
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalRecommendations = progressData.length;
    const completedRecommendations = progressData.filter(p => p.completed).length;
    const averageProgress = progressData.length > 0 
      ? progressData.reduce((sum, p) => sum + p.progressPercentage, 0) / progressData.length 
      : 0;
    const totalTimeSpent = progressData.reduce((sum, p) => sum + p.timeSpent, 0);

    // Skill-wise statistics
    const skillStats = await ProgressTracking.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$skill',
          totalRecommendations: { $sum: 1 },
          completedRecommendations: {
            $sum: { $cond: ['$completed', 1, 0] }
          },
          averageProgress: { $avg: '$progressPercentage' },
          totalTimeSpent: { $sum: '$timeSpent' },
          averageImprovement: { $avg: '$actualImprovement' }
        }
      }
    ]);

    // Recent activity
    const recentActivity = progressData
      .slice(0, 10)
      .map(p => ({
        skill: p.skill,
        title: `Progress update for ${p.skill}`,
        description: `Progress: ${p.progressPercentage}%`,
        action: p.action,
        timestamp: p.updatedAt
      }));

    // Recommendation effectiveness
    const effectiveness = await ProgressTracking.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: {
            skill: '$skill',
            difficulty: '$difficulty'
          },
          totalUsers: { $sum: 1 },
          averageImprovement: { $avg: '$actualImprovement' },
          completionRate: {
            $avg: { $cond: ['$completed', 1, 0] }
          }
        }
      },
      { $sort: { averageImprovement: -1 } }
    ]);

    res.json({
      success: true,
      totalRecommendations,
      completedRecommendations,
      averageProgress,
      totalTimeSpent,
      skillStats,
      recentActivity,
      effectiveness
    });

  } catch (error) {
    console.error('Progress stats error:', error);
    res.status(500).json({ error: 'Failed to get progress statistics' });
  }
});

// Get user's progress history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { skill, limit = 20, page = 1 } = req.query;

    const query = { userId };
    if (skill && skill !== 'all') {
      query.skill = skill;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const progressHistory = await ProgressTracking.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('userId', 'name email');

    const total = await ProgressTracking.countDocuments(query);

    res.json({
      success: true,
      progressHistory,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + progressHistory.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Progress history error:', error);
    res.status(500).json({ error: 'Failed to get progress history' });
  }
});

// Update progress
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    const progress = await ProgressTracking.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!progress) {
      return res.status(404).json({ error: 'Progress record not found' });
    }

    res.json({
      success: true,
      progress
    });

  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Add milestone
router.post('/:id/milestones', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const milestone = req.body;

    const progress = await ProgressTracking.findOne({ _id: id, userId });
    if (!progress) {
      return res.status(404).json({ error: 'Progress record not found' });
    }

    await progress.addMilestone(milestone);

    res.json({
      success: true,
      progress
    });

  } catch (error) {
    console.error('Add milestone error:', error);
    res.status(500).json({ error: 'Failed to add milestone' });
  }
});

// Complete milestone
router.put('/:id/milestones/:milestoneId', authMiddleware, async (req, res) => {
  try {
    const { id, milestoneId } = req.params;
    const userId = req.user._id;

    const progress = await ProgressTracking.findOne({ _id: id, userId });
    if (!progress) {
      return res.status(404).json({ error: 'Progress record not found' });
    }

    await progress.completeMilestone(milestoneId);

    res.json({
      success: true,
      progress
    });

  } catch (error) {
    console.error('Complete milestone error:', error);
    res.status(500).json({ error: 'Failed to complete milestone' });
  }
});

// Add resource
router.post('/:id/resources', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const resource = req.body;

    const progress = await ProgressTracking.findOne({ _id: id, userId });
    if (!progress) {
      return res.status(404).json({ error: 'Progress record not found' });
    }

    await progress.addResource(resource);

    res.json({
      success: true,
      progress
    });

  } catch (error) {
    console.error('Add resource error:', error);
    res.status(500).json({ error: 'Failed to add resource' });
  }
});

// Complete resource
router.put('/:id/resources/:resourceId', authMiddleware, async (req, res) => {
  try {
    const { id, resourceId } = req.params;
    const userId = req.user._id;

    const progress = await ProgressTracking.findOne({ _id: id, userId });
    if (!progress) {
      return res.status(404).json({ error: 'Progress record not found' });
    }

    await progress.completeResource(resourceId);

    res.json({
      success: true,
      progress
    });

  } catch (error) {
    console.error('Complete resource error:', error);
    res.status(500).json({ error: 'Failed to complete resource' });
  }
});

// Get progress analytics
router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { skill, timeRange = '30' } = req.query;

    // Calculate date range
    const days = parseInt(timeRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const query = { 
      userId,
      createdAt: { $gte: startDate }
    };
    if (skill && skill !== 'all') {
      query.skill = skill;
    }

    // Get analytics data
    const analytics = await ProgressTracking.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            skill: '$skill',
            difficulty: '$difficulty'
          },
          totalRecommendations: { $sum: 1 },
          completedRecommendations: {
            $sum: { $cond: ['$completed', 1, 0] }
          },
          averageProgress: { $avg: '$progressPercentage' },
          averageTimeSpent: { $avg: '$timeSpent' },
          averageImprovement: { $avg: '$actualImprovement' },
          completionRate: {
            $avg: { $cond: ['$completed', 1, 0] }
          }
        }
      },
      { $sort: { averageImprovement: -1 } }
    ]);

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Progress analytics error:', error);
    res.status(500).json({ error: 'Failed to get progress analytics' });
  }
});

module.exports = router;
