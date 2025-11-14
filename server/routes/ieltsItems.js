const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const IELTSItem = require('../models/IELTSItem');
const UserRecord = require('../models/UserRecord');
// REMOVED LEGACY AUTO-GEN IMPORT: const { generateIELTSItem } = require('../services/ieltsItemGenerator');

/**
 * POST /api/ielts-items/assign-item
 * Assign a new IELTS item to the current user
 * Logic: Find item not used by user, or item with lowest usageCount
 */
router.post('/assign-item', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // First, try to find an active item that user hasn't done yet
    let item = await IELTSItem.findOne({
      isActive: true,
      usedBy: { $ne: userId }
    }).sort({ usageCount: 1, createdAt: -1 }); // Prefer less-used, newer items
    
    // If no unused item found, get the least-used active item
    if (!item) {
      item = await IELTSItem.findOne({
        isActive: true
      }).sort({ usageCount: 1, createdAt: -1 });
    }
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'No IELTS items available. Please contact admin or wait for new items to be generated.'
      });
    }
    
    // Check if user already has a record for this item
    const existingRecord = await UserRecord.findOne({
      userId,
      ieltsItemId: item._id
    });
    
    if (existingRecord) {
      // User already did this item, try to find another one
      item = await IELTSItem.findOne({
        isActive: true,
        _id: { $ne: item._id },
        usedBy: { $ne: userId }
      }).sort({ usageCount: 1, createdAt: -1 });
      
      if (!item) {
        // Still no new item, get least-used excluding current
        item = await IELTSItem.findOne({
          isActive: true,
          _id: { $ne: existingRecord.ieltsItemId }
        }).sort({ usageCount: 1, createdAt: -1 });
      }
    }
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'No new IELTS items available. Please try again later.'
      });
    }
    
    res.json({
      success: true,
      data: {
        item: {
          _id: item._id,
          type: item.type,
          topic: item.topic,
          content: item.content,
          metadata: item.metadata,
          createdAt: item.createdAt
        },
        isNew: !item.usedBy.includes(userId),
        usageCount: item.usageCount
      }
    });
  } catch (error) {
    console.error('Assign item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning IELTS item',
      error: error.message
    });
  }
});

/**
 * POST /api/ielts-items/submit
 * Submit user's answers and update usage statistics
 */
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { ieltsItemId, answers, score, feedback, timeSpent, metadata } = req.body;
    
    if (!ieltsItemId || !answers || score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: ieltsItemId, answers, score'
      });
    }
    
    // Verify item exists
    const item = await IELTSItem.findById(ieltsItemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'IELTS item not found'
      });
    }
    
    // Check if user already submitted this item
    const existingRecord = await UserRecord.findOne({
      userId,
      ieltsItemId
    });
    
    if (existingRecord) {
      // Update existing record
      existingRecord.answers = answers;
      existingRecord.score = score;
      existingRecord.feedback = feedback || existingRecord.feedback;
      existingRecord.timeSpent = timeSpent || existingRecord.timeSpent;
      existingRecord.metadata = metadata || existingRecord.metadata;
      existingRecord.submittedAt = new Date();
      await existingRecord.save();
      
      return res.json({
        success: true,
        message: 'Record updated successfully',
        data: existingRecord
      });
    }
    
    // Create new record
    const record = new UserRecord({
      userId,
      ieltsItemId,
      answers,
      score,
      feedback: feedback || '',
      timeSpent: timeSpent || 0,
      metadata: metadata || {}
    });
    await record.save();
    
    // Update item usage statistics
    if (!item.usedBy.includes(userId)) {
      item.usedBy.push(userId);
    }
    item.usageCount += 1;
    await item.save();
    
    res.json({
      success: true,
      message: 'Submission saved successfully',
      data: record
    });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving submission',
      error: error.message
    });
  }
});

/**
 * GET /api/ielts-items/user-history
 * Get user's submission history
 */
router.get('/user-history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20, skip = 0 } = req.query;
    
    const records = await UserRecord.find({ userId })
      .populate('ieltsItemId', 'type topic metadata')
      .sort({ submittedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    res.json({
      success: true,
      data: records,
      count: records.length
    });
  } catch (error) {
    console.error('Get user history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user history',
      error: error.message
    });
  }
});

/**
 * REMOVED: POST /api/ielts-items/auto-generate
 * Legacy auto-generate route removed - use Core V3 Final for item generation
 */

/**
 * GET /api/ielts-items/stats
 * Get statistics about IELTS items (admin only)
 */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    const totalItems = await IELTSItem.countDocuments();
    const activeItems = await IELTSItem.countDocuments({ isActive: true });
    const autoGenerated = await IELTSItem.countDocuments({ autoGenerated: true });
    const totalSubmissions = await UserRecord.countDocuments();
    
    const itemsByType = await IELTSItem.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalItems,
        activeItems,
        autoGenerated,
        totalSubmissions,
        itemsByType: itemsByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

module.exports = router;

