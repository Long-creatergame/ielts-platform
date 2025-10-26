const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Get all notifications for user
router.get('/', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-key-change-this-in-production');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get notifications from user
    const notifications = user.notifications || [];
    
    // Filter unread notifications
    const unreadNotifications = notifications.filter(n => !n.read);
    
    res.json({
      notifications,
      unreadCount: unreadNotifications.length
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// Mark notification as read
router.put('/:notificationId/read', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-key-change-this-in-production');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { notificationId } = req.params;
    const notifications = user.notifications || [];
    
    // Mark notification as read
    notifications.forEach(notif => {
      if (notif.id === notificationId) {
        notif.read = true;
        notif.readAt = new Date();
      }
    });

    await User.findByIdAndUpdate(user._id, {
      $set: { notifications }
    });

    res.json({ success: true });

  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all as read
router.put('/read-all', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-key-change-this-in-production');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const notifications = user.notifications || [];
    notifications.forEach(notif => {
      notif.read = true;
      notif.readAt = new Date();
    });

    await User.findByIdAndUpdate(user._id, {
      $set: { notifications }
    });

    res.json({ success: true });

  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// Create notification helper function
const createNotification = async (userId, type, title, message, data = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const notification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      type, // 'daily_challenge', 'milestone', 'reminder', 'update'
      title,
      message,
      data,
      read: false,
      createdAt: new Date()
    };

    const notifications = user.notifications || [];
    notifications.unshift(notification);
    
    // Keep only last 50 notifications
    const recentNotifications = notifications.slice(0, 50);

    await User.findByIdAndUpdate(userId, {
      $set: { notifications: recentNotifications }
    });

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

// Daily challenge reminder
router.post('/create-daily-reminder', async (req, res) => {
  try {
    const users = await User.find({ 'subscriptionPlan': { $ne: 'free' } });
    
    for (const user of users) {
      await createNotification(
        user._id,
        'daily_challenge',
        '🔥 Your Daily Challenge Awaits!',
        'Complete today\'s challenge to maintain your streak and earn points!',
        { action: 'daily_challenge' }
      );
    }

    res.json({ success: true, message: 'Daily reminders sent' });
  } catch (error) {
    console.error('Daily reminder error:', error);
    res.status(500).json({ error: 'Failed to send reminders' });
  }
});

module.exports = router;
module.exports.createNotification = createNotification;
