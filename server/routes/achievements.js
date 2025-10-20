const express = require('express');
const Achievement = require('../models/Achievement');
const ReadingResult = require('../models/ReadingResult');
const EssayResult = require('../models/EssayResult');
const Task1Result = require('../models/Task1Result');
const ListeningResult = require('../models/ListeningResult');
const SpeakingResult = require('../models/SpeakingResult');

const router = express.Router();

// 📈 Auto-update or create achievement
router.post("/update/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Count total tests & calculate average band
    const results = await Promise.all([
      ReadingResult.find({ userId }),
      EssayResult.find({ userId }),
      Task1Result.find({ userId }),
      ListeningResult.find({ userId }),
      SpeakingResult.find({ userId }),
    ]);

    const allTests = results.flat();
    const totalTests = allTests.length;

    // Calculate average band score
    let totalBandScore = 0;
    let validTests = 0;
    
    allTests.forEach(test => {
      if (test.bandScore) {
        totalBandScore += test.bandScore;
        validTests++;
      } else if (test.overall) {
        totalBandScore += test.overall;
        validTests++;
      }
    });

    const averageBand = validTests > 0 ? totalBandScore / validTests : 0;

    // Find highest band score
    const highestBand = allTests.reduce((max, test) => {
      const score = test.bandScore || test.overall || 0;
      return Math.max(max, score);
    }, 0);

    // Find or create user achievement
    let achievement = await Achievement.findOne({ userId });
    if (!achievement) {
      achievement = new Achievement({ userId });
    }

    // 🔥 Streak logic
    const today = new Date().toDateString();
    const last = achievement.lastActiveDate
      ? new Date(achievement.lastActiveDate).toDateString()
      : null;

    if (last === today) {
      // already active today - no change to streak
    } else if (last === new Date(Date.now() - 86400000).toDateString()) {
      // consecutive day - increment streak
      achievement.streak += 1;
    } else {
      // missed day(s) - reset streak to 1
      achievement.streak = 1;
    }

    achievement.lastActiveDate = new Date();

    // Level calculation (based on tests completed + highest band achieved)
    achievement.totalTests = totalTests;
    achievement.totalBandAverage = averageBand;
    achievement.highestBand = highestBand;
    achievement.level = Math.max(1, Math.floor((totalTests + highestBand) / 5));

    // Badge system
    const badges = new Set(achievement.badges);
    
    // Band-based badges
    if (highestBand >= 7 && !badges.has("Band 7 Achiever"))
      badges.add("Band 7 Achiever");
    if (highestBand >= 8 && !badges.has("Band 8 Master"))
      badges.add("Band 8 Master");
    if (highestBand >= 9 && !badges.has("Band 9 Legend"))
      badges.add("Band 9 Legend");
    
    // Streak-based badges
    if (achievement.streak >= 3 && !badges.has("3-Day Streak"))
      badges.add("3-Day Streak");
    if (achievement.streak >= 7 && !badges.has("7-Day Streak Hero"))
      badges.add("7-Day Streak Hero");
    if (achievement.streak >= 30 && !badges.has("Monthly Champion"))
      badges.add("Monthly Champion");
    
    // Practice-based badges
    if (achievement.totalTests >= 5 && !badges.has("Getting Started"))
      badges.add("Getting Started");
    if (achievement.totalTests >= 10 && !badges.has("Practice Warrior"))
      badges.add("Practice Warrior");
    if (achievement.totalTests >= 25 && !badges.has("Dedicated Learner"))
      badges.add("Dedicated Learner");
    if (achievement.totalTests >= 50 && !badges.has("IELTS Expert"))
      badges.add("IELTS Expert");
    
    // Skill-specific badges (if user has tests in all 4 skills)
    const hasReading = ReadingResult.countDocuments({ userId }) > 0;
    const hasWriting = EssayResult.countDocuments({ userId }) > 0 || Task1Result.countDocuments({ userId }) > 0;
    const hasListening = ListeningResult.countDocuments({ userId }) > 0;
    const hasSpeaking = SpeakingResult.countDocuments({ userId }) > 0;
    
    if (hasReading && hasWriting && hasListening && hasSpeaking && !badges.has("Complete Skillset"))
      badges.add("Complete Skillset");

    achievement.badges = Array.from(badges);
    achievement.updatedAt = new Date();
    await achievement.save();

    // Auto-generate certificates for major milestones
    try {
      await fetch(`http://localhost:4000/api/certificates/auto-generate/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (certError) {
      console.log('Auto-certificate generation failed (non-critical):', certError.message);
    }

    res.json({ 
      message: "Achievement updated successfully", 
      achievement: {
        userId: achievement.userId,
        totalTests: achievement.totalTests,
        totalBandAverage: achievement.totalBandAverage,
        highestBand: achievement.highestBand,
        level: achievement.level,
        streak: achievement.streak,
        badges: achievement.badges,
        lastActiveDate: achievement.lastActiveDate,
        updatedAt: achievement.updatedAt
      }
    });
  } catch (error) {
    console.error('Achievement update error:', error);
    res.status(500).json({ message: error.message });
  }
});

// 📊 Get achievement
router.get("/:userId", async (req, res) => {
  try {
    const achievement = await Achievement.findOne({ userId: req.params.userId });
    if (!achievement) {
      // Return default achievement data if none exists
      return res.json({
        userId: req.params.userId,
        totalTests: 0,
        totalBandAverage: 0,
        highestBand: 0,
        level: 1,
        streak: 0,
        badges: [],
        lastActiveDate: null,
        updatedAt: new Date()
      });
    }
    res.json({
      userId: achievement.userId,
      totalTests: achievement.totalTests,
      totalBandAverage: achievement.totalBandAverage,
      highestBand: achievement.highestBand,
      level: achievement.level,
      streak: achievement.streak,
      badges: achievement.badges,
      lastActiveDate: achievement.lastActiveDate,
      updatedAt: achievement.updatedAt
    });
  } catch (error) {
    console.error('Get achievement error:', error);
    res.status(500).json({ message: error.message });
  }
});

// 📈 Get leaderboard (top users by level and highest band)
router.get("/leaderboard/top", async (req, res) => {
  try {
    const topAchievements = await Achievement.find()
      .sort({ level: -1, highestBand: -1, totalTests: -1 })
      .limit(10)
      .populate('userId', 'name email');
    
    res.json(topAchievements);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
