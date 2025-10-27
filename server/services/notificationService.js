const Notification = require('../models/Notification');

class NotificationService {
  // Create a notification
  static async createNotification(userId, type, title, message, data = {}) {
    try {
      const notification = new Notification({
        userId,
        type,
        title,
        message,
        data,
        read: false
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Create test completion notification
  static async createTestCompletionNotification(userId, testData) {
    const { skill, score, band } = testData;
    
    let message = `You completed a ${skill} test with a score of ${score}`;
    if (band) {
      message += ` (Band ${band})`;
    }

    return this.createNotification(
      userId,
      'test_completion',
      'Test Completed! 🎉',
      message,
      {
        skill,
        score,
        band,
        testId: testData.testId
      }
    );
  }

  // Create achievement notification
  static async createAchievementNotification(userId, achievement) {
    return this.createNotification(
      userId,
      'achievement',
      'Achievement Unlocked! 🏆',
      `Congratulations! You've earned the "${achievement.title}" achievement.`,
      {
        achievementId: achievement.id,
        achievementType: achievement.type
      }
    );
  }

  // Create streak notification
  static async createStreakNotification(userId, streakDays) {
    return this.createNotification(
      userId,
      'streak',
      'Keep It Up! 🔥',
      `Amazing! You've maintained a ${streakDays}-day study streak!`,
      {
        streakDays,
        streakType: 'study'
      }
    );
  }

  // Create recommendation notification
  static async createRecommendationNotification(userId, recommendation) {
    return this.createNotification(
      userId,
      'recommendation',
      'New Recommendation 💡',
      recommendation.title,
      {
        recommendationId: recommendation.id,
        recommendationType: recommendation.type,
        priority: recommendation.priority
      }
    );
  }

  // Create reminder notification
  static async createReminderNotification(userId, reminderType, message) {
    return this.createNotification(
      userId,
      'reminder',
      'Study Reminder ⏰',
      message,
      {
        reminderType,
        scheduledFor: new Date()
      }
    );
  }

  // Create system notification
  static async createSystemNotification(userId, title, message, data = {}) {
    return this.createNotification(
      userId,
      'system',
      title,
      message,
      data
    );
  }

  // Create AI analysis notification
  static async createAIAnalysisNotification(userId, analysisType, results) {
    let title = 'AI Analysis Complete 🤖';
    let message = 'Your AI analysis has been updated with new insights.';

    if (analysisType === 'weakness') {
      message = 'Your weakness profile has been updated with new AI insights.';
    } else if (analysisType === 'recommendation') {
      message = 'New AI recommendations are available for you.';
    }

    return this.createNotification(
      userId,
      'ai_analysis',
      title,
      message,
      {
        analysisType,
        results
      }
    );
  }

  // Create progress milestone notification
  static async createProgressMilestoneNotification(userId, milestone) {
    return this.createNotification(
      userId,
      'milestone',
      'Progress Milestone! 📈',
      `You've reached a new milestone: ${milestone.description}`,
      {
        milestoneId: milestone.id,
        milestoneType: milestone.type,
        progressValue: milestone.value
      }
    );
  }

  // Bulk create notifications
  static async createBulkNotifications(notifications) {
    try {
      const createdNotifications = await Notification.insertMany(notifications);
      return createdNotifications;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  }

  // Clean up old notifications (keep last 30 days)
  static async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await Notification.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        read: true
      });

      console.log(`Cleaned up ${result.deletedCount} old notifications`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      throw error;
    }
  }

  // Get notification summary for user
  static async getNotificationSummary(userId) {
    try {
      const total = await Notification.countDocuments({ userId });
      const unread = await Notification.countDocuments({ userId, read: false });
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayCount = await Notification.countDocuments({ 
        userId, 
        createdAt: { $gte: today } 
      });

      const recentNotifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title message type read createdAt');

      return {
        total,
        unread,
        today: todayCount,
        recent: recentNotifications
      };
    } catch (error) {
      console.error('Error getting notification summary:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
