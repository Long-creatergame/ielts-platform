const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user notifications
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized access' });
    }

    const { page = 1, limit = 20, filter = 'all' } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId };
    
    if (filter === 'unread') {
      query.read = false;
    } else if (filter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.createdAt = { $gte: today };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', auth, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: req.user._id },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized access' });
    }

    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({ 
      success: true, 
      data: { 
        modifiedCount: result.modifiedCount,
        message: `${result.modifiedCount} notifications marked as read`
      }
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ success: false, error: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
router.delete('/:notificationId', auth, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete notification' });
  }
});

// Create notification (internal use)
router.post('/create', auth, async (req, res) => {
  try {
    const { userId, type, title, message, data = {} } = req.body;

    const notification = new Notification({
      userId,
      type,
      title,
      message,
      data,
      read: false
    });

    await notification.save();

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ success: false, error: 'Failed to create notification' });
  }
});

// Get notification statistics
router.get('/stats/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized access' });
    }

    const total = await Notification.countDocuments({ userId });
    const unread = await Notification.countDocuments({ userId, read: false });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await Notification.countDocuments({ 
      userId, 
      createdAt: { $gte: today } 
    });

    // Count by type
    const typeStats = await Notification.aggregate([
      { $match: { userId } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        unread,
        today: todayCount,
        byType: typeStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notification statistics' });
  }
});

module.exports = router;