/**
 * AI Motivation Service
 * Generates personalized motivation messages and maintains learning continuity
 */

const Motivation = require('../models/Motivation');
const User = require('../models/User');
const Test = require('../models/Test');
const AIFeedback = require('../models/AIFeedback');
const coachPersonality = require('../config/aiCoachPersonality');

/**
 * Generate personalized motivation message based on user progress
 */
async function generateMotivationMessage(userId, userLevel = 'B1') {
  try {
    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get motivation profile
    let motivation = await Motivation.findOne({ userId });
    if (!motivation) {
      motivation = new Motivation({ userId });
      await motivation.save();
    }

    // Get recent test data
    const recentTests = await Test.find({ userId, completed: true })
      .sort({ dateTaken: -1 })
      .limit(10);

    const recentFeedback = await AIFeedback.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate context
    const context = await buildContext(motivation, recentTests, recentFeedback, user);
    
    // Generate AI-powered motivation message
    const message = generateMessage(context, userLevel);

    // Save message to history
    motivation.messagesHistory.push({
      message: message.text,
      type: message.type,
      createdAt: new Date()
    });

    // Trim history to last 20 messages
    if (motivation.messagesHistory.length > 20) {
      motivation.messagesHistory = motivation.messagesHistory.slice(-20);
    }

    await motivation.save();

    console.log(`[Motivation] Generated ${message.type} message for user ${userId}`);

    return message;
  } catch (error) {
    console.error('[Motivation] Error:', error.message);
    return getFallbackMessage();
  }
}

/**
 * Build context for motivation message
 */
async function buildContext(motivation, tests, feedbacks, user) {
  const now = new Date();
  const lastActive = motivation.lastActive || now;
  const daysSinceActive = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));

  // Calculate streak
  const streakDays = calculateStreak(motivation, now);
  
  // Calculate band trend
  const bandTrend = calculateBandTrend(tests);
  
  // Check for achievements
  const newAchievements = checkAchievements(motivation, streakDays, bandTrend);

  return {
    userName: user.name || 'Student',
    userLevel: user.currentLevel || 'B1',
    targetBand: user.targetBand || 6.5,
    streakDays,
    daysSinceActive,
    bandTrend,
    testsCompleted: tests.length,
    newAchievements,
    motivationLevel: motivation.motivationLevel,
    preferredTone: motivation.preferredTone
  };
}

/**
 * Calculate streak days
 */
function calculateStreak(motivation, now) {
  const lastActive = motivation.lastActive || now;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastActiveDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
  
  const diffDays = Math.floor((today - lastActiveDate) / (1000 * 60 * 60 * 24));
  
  // If user was active today or yesterday, maintain/increase streak
  if (diffDays === 0) {
    return motivation.streakDays || 1;
  } else if (diffDays === 1) {
    return (motivation.streakDays || 0) + 1;
  } else {
    return 1; // Streak broken
  }
}

/**
 * Calculate band trend from recent tests
 */
function calculateBandTrend(tests) {
  if (tests.length < 2) return { trend: 'stable', change: 0 };

  const recent = tests.slice(0, 3);
  const oldest = tests.slice(-3);

  const recentAvg = recent.reduce((sum, t) => sum + parseFloat(t.totalBand || 0), 0) / recent.length;
  const oldestAvg = oldest.reduce((sum, t) => sum + parseFloat(t.totalBand || 0), 0) / oldest.length;

  const change = parseFloat((recentAvg - oldestAvg).toFixed(1));

  if (change > 0.3) {
    return { trend: 'improving', change };
  } else if (change < -0.3) {
    return { trend: 'declining', change };
  }
  return { trend: 'stable', change };
}

/**
 * Check for new achievements
 */
function checkAchievements(motivation, streakDays, bandTrend) {
  const achievements = [];

  // Consistency achievements
  if (streakDays === 3 && !motivation.achievements.find(a => a.type === 'consistency' && a.title === '3-Day Streak')) {
    achievements.push({
      type: 'consistency',
      title: '3-Day Streak',
      description: 'You\'ve practiced 3 days in a row!',
      badge: '🔥'
    });
  } else if (streakDays === 5 && !motivation.achievements.find(a => a.title === '5-Day Streak')) {
    achievements.push({
      type: 'consistency',
      title: '5-Day Streak',
      description: 'You\'ve practiced 5 days in a row!',
      badge: '✨'
    });
  } else if (streakDays === 10 && !motivation.achievements.find(a => a.title === '10-Day Streak')) {
    achievements.push({
      type: 'consistency',
      title: '10-Day Streak',
      description: 'You\'ve practiced 10 days in a row!',
      badge: '⭐'
    });
  }

  // Improvement achievements
  if (bandTrend.trend === 'improving' && bandTrend.change >= 1.0) {
    achievements.push({
      type: 'improvement',
      title: 'Major Breakthrough',
      description: `You improved by ${bandTrend.change} bands!`,
      badge: '🎉'
    });
  }

  return achievements;
}

/**
 * Generate motivation message based on context
 */
function generateMessage(context, userLevel) {
  const { userName, streakDays, daysSinceActive, bandTrend, newAchievements, userLevel: level } = context;

  // Handle inactivity
  if (daysSinceActive >= 3) {
    return {
      type: 'reminder',
      title: 'We Miss You!',
      text: `Hi ${userName}! It's been a few days since your last practice. Don't worry—consistency matters more than perfection. Let's pick it back up today! 💪`,
      suggestion: 'Complete one quick practice session',
      mood: 'supportive'
    };
  }

  // Handle achievements
  if (newAchievements.length > 0) {
    const achievement = newAchievements[0];
    return {
      type: 'celebration',
      title: achievement.title,
      text: `Congratulations, ${userName}! ${achievement.description} Keep this momentum going—you're building something incredible!`,
      suggestion: 'Continue your daily practice',
      mood: 'celebrating',
      badge: achievement.badge
    };
  }

  // Handle improving trend
  if (bandTrend.trend === 'improving') {
    return {
      type: 'encouragement',
      title: 'Great Progress!',
      text: `${userName}, your band has improved by ${Math.abs(bandTrend.change)} points! This is excellent progress. Let's keep refining your skills.`,
      suggestion: 'Try focusing on your weakest skill next',
      mood: 'positive'
    };
  }

  // Handle stable streak
  if (streakDays >= 3) {
    return {
      type: 'daily',
      title: `Day ${streakDays} of Practice!`,
      text: `Great job maintaining your ${streakDays}-day streak, ${userName}! Consistency is the key to IELTS success. Today's practice will add to your momentum.`,
      suggestion: 'Complete your daily practice goal',
      mood: 'motivating'
    };
  }

  // Default greeting
  return {
    type: 'daily',
    title: 'Ready to Learn?',
    text: `Good ${getTimeOfDay()} ${userName}! Let's continue your IELTS journey. Every practice session brings you closer to your target band.`,
    suggestion: 'Take a quick test or practice session',
    mood: 'encouraging'
  };
}

/**
 * Get fallback message
 */
function getFallbackMessage() {
  return {
    type: 'encouragement',
    title: 'Keep Learning!',
    text: 'Every step forward counts. Keep practicing and you\'ll see progress!',
    suggestion: 'Complete a practice session today',
    mood: 'supportive'
  };
}

/**
 * Get time of day greeting
 */
function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

/**
 * Update motivation profile
 */
async function updateMotivationProfile(userId, updates) {
  try {
    const motivation = await Motivation.findOne({ userId });
    if (!motivation) {
      throw new Error('Motivation profile not found');
    }

    Object.assign(motivation, updates);
    await motivation.save();

    console.log(`[Motivation] Profile updated for user ${userId}`);
    return motivation;
  } catch (error) {
    console.error('[Motivation] Update error:', error.message);
    return null;
  }
}

/**
 * Get motivation summary for user
 */
async function getMotivationSummary(userId) {
  try {
    const motivation = await Motivation.findOne({ userId });
    if (!motivation) {
      // Create default profile
      const newMotivation = new Motivation({ userId });
      await newMotivation.save();
      return {
        streakDays: 0,
        motivationLevel: 'medium',
        recentMessages: [],
        achievements: []
      };
    }

    return {
      streakDays: motivation.streakDays || 0,
      longestStreak: motivation.longestStreak || 0,
      motivationLevel: motivation.motivationLevel,
      recentMessages: motivation.messagesHistory.slice(-5),
      achievements: motivation.achievements.slice(-10)
    };
  } catch (error) {
    console.error('[Motivation] Summary error:', error.message);
    return {
      streakDays: 0,
      motivationLevel: 'medium',
      recentMessages: [],
      achievements: []
    };
  }
}

module.exports = {
  generateMotivationMessage,
  updateMotivationProfile,
  getMotivationSummary
};

