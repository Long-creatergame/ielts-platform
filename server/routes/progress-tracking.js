const express = require('express');
const Test = require('../models/Test');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get progress tracking data
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized access' });
    }
    
    // Get user's tests
    const tests = await Test.find({ userId }).sort({ createdAt: -1 });
    
    // Generate progress data
    const progressData = generateProgressData(tests, userId);
    
    res.json({ success: true, data: progressData });
  } catch (error) {
    console.error('Progress tracking error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch progress data' });
  }
});

// Helper function to generate progress data
function generateProgressData(tests, userId) {
  const completedTests = tests.filter(test => test.status === 'completed');
  
  // Generate daily progress for last 30 days
  const dailyProgress = generateDailyProgress(completedTests);
  
  // Calculate skill breakdown
  const skillBreakdown = calculateSkillBreakdown(completedTests);
  
  // Calculate weekly statistics
  const weeklyStats = calculateWeeklyStats(completedTests);
  
  // Generate achievements
  const achievements = generateAchievements(completedTests, tests);
  
  return {
    dailyProgress,
    skillBreakdown,
    weeklyStats,
    achievements
  };
}

// Helper function to generate daily progress
function generateDailyProgress(completedTests) {
  const days = 30;
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Find tests for this day
    const dayTests = completedTests.filter(test => {
      const testDate = new Date(test.createdAt);
      return testDate.toDateString() === date.toDateString();
    });
    
    // Calculate average scores for this day
    const readingTests = dayTests.filter(test => test.skill === 'reading');
    const writingTests = dayTests.filter(test => test.skill === 'writing');
    const listeningTests = dayTests.filter(test => test.skill === 'listening');
    const speakingTests = dayTests.filter(test => test.skill === 'speaking');
    
    const reading = readingTests.length > 0 
      ? readingTests.reduce((sum, test) => sum + (test.bandScore || 0), 0) / readingTests.length 
      : null;
    
    const writing = writingTests.length > 0 
      ? writingTests.reduce((sum, test) => sum + (test.bandScore || 0), 0) / writingTests.length 
      : null;
    
    const listening = listeningTests.length > 0 
      ? listeningTests.reduce((sum, test) => sum + (test.bandScore || 0), 0) / listeningTests.length 
      : null;
    
    const speaking = speakingTests.length > 0 
      ? speakingTests.reduce((sum, test) => sum + (test.bandScore || 0), 0) / speakingTests.length 
      : null;
    
    const overall = [reading, writing, listening, speaking]
      .filter(score => score !== null)
      .reduce((sum, score) => sum + score, 0) / 
      [reading, writing, listening, speaking].filter(score => score !== null).length || null;
    
    data.push({
      date: date.toISOString().split('T')[0],
      reading: reading ? Math.round(reading * 10) / 10 : null,
      writing: writing ? Math.round(writing * 10) / 10 : null,
      listening: listening ? Math.round(listening * 10) / 10 : null,
      speaking: speaking ? Math.round(speaking * 10) / 10 : null,
      overall: overall ? Math.round(overall * 10) / 10 : null
    });
  }
  
  return data;
}

// Helper function to calculate skill breakdown
function calculateSkillBreakdown(completedTests) {
  const skills = ['reading', 'writing', 'listening', 'speaking'];
  const breakdown = {};
  
  skills.forEach(skill => {
    const skillTests = completedTests.filter(test => test.skill === skill);
    const scores = skillTests.map(test => test.bandScore || 0);
    
    const current = scores.length > 0 
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 
      : 0;
    
    const target = 7.0; // Default target
    const improvement = Math.max(0, current - (scores.length > 1 ? scores[scores.length - 1] : 0));
    const trend = calculateTrend(scores);
    
    breakdown[skill] = {
      current,
      target,
      improvement: Math.round(improvement * 10) / 10,
      trend
    };
  });
  
  return breakdown;
}

// Helper function to calculate weekly statistics
function calculateWeeklyStats(completedTests) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const weeklyTests = completedTests.filter(test => 
    new Date(test.createdAt) >= weekAgo
  );
  
  const totalStudyTime = weeklyTests.reduce((sum, test) => 
    sum + (test.timeSpent || 30), 0
  );
  
  const accuracy = calculateAccuracy(weeklyTests);
  
  const streak = calculateStreak(completedTests);
  
  const improvement = calculateImprovement(completedTests);
  
  return {
    testsCompleted: weeklyTests.length,
    studyTime: totalStudyTime,
    streak,
    accuracy,
    improvement
  };
}

// Helper function to generate achievements
function generateAchievements(completedTests, allTests) {
  const achievements = [];
  
  // First test achievement
  if (completedTests.length > 0) {
    achievements.push({
      id: 1,
      title: 'First Test',
      description: 'Completed your first IELTS test',
      icon: '🎯',
      earned: true
    });
  }
  
  // Streak achievements
  const streak = calculateStreak(completedTests);
  if (streak >= 7) {
    achievements.push({
      id: 2,
      title: 'Week Streak',
      description: '7 days of consistent practice',
      icon: '🔥',
      earned: true
    });
  }
  
  if (streak >= 30) {
    achievements.push({
      id: 3,
      title: 'Month Streak',
      description: '30 days of consistent practice',
      icon: '💪',
      earned: true
    });
  }
  
  // Score achievements
  const maxScore = Math.max(...completedTests.map(test => test.bandScore || 0));
  if (maxScore >= 7.0) {
    achievements.push({
      id: 4,
      title: 'Band 7+',
      description: 'Achieved band score 7.0 or higher',
      icon: '🌟',
      earned: true
    });
  }
  
  if (maxScore >= 8.0) {
    achievements.push({
      id: 5,
      title: 'Band 8+',
      description: 'Achieved band score 8.0 or higher',
      icon: '🏆',
      earned: true
    });
  }
  
  // Test count achievements
  if (completedTests.length >= 10) {
    achievements.push({
      id: 6,
      title: 'Test Veteran',
      description: 'Completed 10 or more tests',
      icon: '📚',
      earned: true
    });
  }
  
  if (completedTests.length >= 50) {
    achievements.push({
      id: 7,
      title: 'Test Master',
      description: 'Completed 50 or more tests',
      icon: '🎓',
      earned: true
    });
  }
  
  // Add unearned achievements
  if (streak < 7) {
    achievements.push({
      id: 8,
      title: 'Week Streak',
      description: '7 days of consistent practice',
      icon: '🔥',
      earned: false
    });
  }
  
  if (maxScore < 7.0) {
    achievements.push({
      id: 9,
      title: 'Band 7+',
      description: 'Achieve band score 7.0 or higher',
      icon: '🌟',
      earned: false
    });
  }
  
  return achievements;
}

// Helper function to calculate trend
function calculateTrend(scores) {
  if (scores.length < 2) return 'stable';
  
  const recent = scores.slice(0, Math.ceil(scores.length / 2));
  const older = scores.slice(Math.ceil(scores.length / 2));
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  
  const difference = recentAvg - olderAvg;
  
  if (difference > 0.5) return 'up';
  if (difference < -0.5) return 'down';
  return 'stable';
}

// Helper function to calculate accuracy
function calculateAccuracy(tests) {
  if (tests.length === 0) return 0;
  
  const totalQuestions = tests.reduce((sum, test) => {
    return sum + (test.questions?.length || 0);
  }, 0);
  
  const correctAnswers = tests.reduce((sum, test) => {
    return sum + (test.correctAnswers || 0);
  }, 0);
  
  return totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
}

// Helper function to calculate streak
function calculateStreak(tests) {
  if (tests.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  for (let i = 0; i < 30; i++) {
    const dayStart = new Date(currentDate);
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    const hasTest = tests.some(test => {
      const testDate = new Date(test.createdAt);
      return testDate >= dayStart && testDate <= dayEnd;
    });
    
    if (hasTest) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

// Helper function to calculate improvement
function calculateImprovement(tests) {
  if (tests.length < 2) return 0;
  
  const recentTests = tests.slice(0, Math.ceil(tests.length / 2));
  const olderTests = tests.slice(Math.ceil(tests.length / 2));
  
  const recentAvg = recentTests.reduce((sum, test) => sum + (test.bandScore || 0), 0) / recentTests.length;
  const olderAvg = olderTests.reduce((sum, test) => sum + (test.bandScore || 0), 0) / olderTests.length;
  
  return Math.round((recentAvg - olderAvg) * 10) / 10;
}

module.exports = router;
