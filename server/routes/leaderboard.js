const express = require('express');
const Achievement = require('../models/Achievement');
const User = require('../models/User');

const router = express.Router();

// 🏆 GET: Top leaderboard (sorted by band, level, streak)
router.get("/top", async (req, res) => {
  try {
    const topUsers = await Achievement.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          name: "$user.name",
          email: "$user.email",
          highestBand: 1,
          totalBandAverage: 1,
          streak: 1,
          level: 1,
          badgesCount: { $size: "$badges" },
          badges: 1,
          updatedAt: 1,
        },
      },
      {
        $sort: {
          totalBandAverage: -1,
          level: -1,
          streak: -1,
          badgesCount: -1,
        },
      },
      { $limit: 20 },
    ]);

    res.json(topUsers);
  } catch (error) {
    console.error('Leaderboard top error:', error);
    res.status(500).json({ message: error.message });
  }
});

// 🗓 Weekly leaderboard (reset view every Monday)
router.get("/weekly", async (req, res) => {
  try {
    const now = new Date();
    const monday = new Date();
    monday.setDate(now.getDate() - now.getDay() + 1); // Monday of current week

    const weeklyTop = await Achievement.find({
      updatedAt: { $gte: monday },
    })
      .sort({ streak: -1, totalBandAverage: -1 })
      .limit(10)
      .populate("userId", "name email");

    // Format the response to match the expected structure
    const formattedWeekly = weeklyTop.map(achievement => ({
      userId: achievement.userId._id,
      name: achievement.userId.name,
      email: achievement.userId.email,
      highestBand: achievement.highestBand,
      totalBandAverage: achievement.totalBandAverage,
      streak: achievement.streak,
      level: achievement.level,
      badgesCount: achievement.badges.length,
      badges: achievement.badges,
      updatedAt: achievement.updatedAt
    }));

    res.json(formattedWeekly);
  } catch (error) {
    console.error('Weekly leaderboard error:', error);
    res.status(500).json({ message: error.message });
  }
});

// 🥇 Personal rank lookup
router.get("/rank/:userId", async (req, res) => {
  try {
    const all = await Achievement.find().sort({
      totalBandAverage: -1,
      level: -1,
      streak: -1,
    });

    const index = all.findIndex(
      (a) => a.userId.toString() === req.params.userId
    );

    res.json({
      rank: index >= 0 ? index + 1 : null,
      total: all.length,
    });
  } catch (error) {
    console.error('Personal rank error:', error);
    res.status(500).json({ message: error.message });
  }
});

// 📊 Get leaderboard stats
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await Achievement.countDocuments();
    const totalBadges = await Achievement.aggregate([
      { $project: { badgeCount: { $size: "$badges" } } },
      { $group: { _id: null, totalBadges: { $sum: "$badgeCount" } } }
    ]);
    
    const averageLevel = await Achievement.aggregate([
      { $group: { _id: null, avgLevel: { $avg: "$level" } } }
    ]);

    const averageBand = await Achievement.aggregate([
      { $group: { _id: null, avgBand: { $avg: "$totalBandAverage" } } }
    ]);

    res.json({
      totalUsers,
      totalBadges: totalBadges[0]?.totalBadges || 0,
      averageLevel: averageLevel[0]?.avgLevel?.toFixed(1) || 0,
      averageBand: averageBand[0]?.avgBand?.toFixed(1) || 0
    });
  } catch (error) {
    console.error('Leaderboard stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
