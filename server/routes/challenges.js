const express = require('express');
const Challenge = require('../models/Challenge');
const Achievement = require('../models/Achievement');
const User = require('../models/User');

const router = express.Router();

// 🗓 Get active challenges
router.get("/active", async (req, res) => {
  try {
    const now = new Date();
    const challenges = await Challenge.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
      isActive: true,
    }).populate('participants.userId', 'name email');

    res.json(challenges);
  } catch (error) {
    console.error('Get active challenges error:', error);
    res.status(500).json({ message: error.message });
  }
});

// 🚀 Join challenge
router.post("/join/:challengeId/:userId", async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.challengeId);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    // Check if challenge is still active
    const now = new Date();
    if (now > challenge.endDate) {
      return res.status(400).json({ message: "Challenge has ended" });
    }

    // Check if user already joined
    const existing = challenge.participants.find(
      (p) => p.userId.toString() === req.params.userId
    );
    
    if (!existing) {
      challenge.participants.push({ 
        userId: req.params.userId,
        progress: 0,
        completed: false,
        joinedAt: new Date()
      });
      await challenge.save();
      res.json({ message: "Joined challenge successfully", challenge });
    } else {
      res.json({ message: "Already joined this challenge", challenge });
    }
  } catch (error) {
    console.error('Join challenge error:', error);
    res.status(500).json({ message: error.message });
  }
});

// 🔥 Update progress (called from test completion)
router.post("/progress/:userId", async (req, res) => {
  try {
    const now = new Date();
    const activeChallenges = await Challenge.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
      isActive: true,
    });

    let updatedChallenges = 0;

    for (const challenge of activeChallenges) {
      const participant = challenge.participants.find(
        (p) => p.userId.toString() === req.params.userId
      );
      
      if (participant && !participant.completed) {
        // Increment progress
        participant.progress += 1;
        
        // Check if challenge is completed
        if (participant.progress >= challenge.targetGoal) {
          participant.completed = true;
          participant.completedAt = new Date();
          
          // Award badge if not already earned
          try {
            const achievement = await Achievement.findOne({ userId: req.params.userId });
            if (achievement && challenge.rewardBadge && !achievement.badges.includes(challenge.rewardBadge)) {
              achievement.badges.push(challenge.rewardBadge);
              await achievement.save();
              console.log(`Awarded badge "${challenge.rewardBadge}" to user ${req.params.userId}`);
            }
          } catch (achievementError) {
            console.error('Error awarding badge:', achievementError);
          }
        }
        
        await challenge.save();
        updatedChallenges++;
      }
    }

    res.json({ 
      message: "Challenge progress updated", 
      updatedChallenges,
      userId: req.params.userId 
    });
  } catch (error) {
    console.error('Update challenge progress error:', error);
    res.status(500).json({ message: error.message });
  }
});

// 📊 Get user's challenge progress
router.get("/user/:userId", async (req, res) => {
  try {
    const now = new Date();
    const challenges = await Challenge.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
      isActive: true,
      'participants.userId': req.params.userId
    });

    const userChallenges = challenges.map(challenge => {
      const participant = challenge.participants.find(
        (p) => p.userId.toString() === req.params.userId
      );
      
      return {
        challengeId: challenge._id,
        name: challenge.name,
        type: challenge.type,
        description: challenge.description,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        rewardBadge: challenge.rewardBadge,
        targetGoal: challenge.targetGoal,
        progress: participant ? participant.progress : 0,
        completed: participant ? participant.completed : false,
        joinedAt: participant ? participant.joinedAt : null,
        completedAt: participant ? participant.completedAt : null,
        progressPercentage: participant ? Math.min(100, (participant.progress / challenge.targetGoal) * 100) : 0
      };
    });

    res.json(userChallenges);
  } catch (error) {
    console.error('Get user challenges error:', error);
    res.status(500).json({ message: error.message });
  }
});

// 🏆 Get challenge leaderboard
router.get("/leaderboard/:challengeId", async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.challengeId)
      .populate('participants.userId', 'name email');

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    // Sort participants by progress and completion status
    const sortedParticipants = challenge.participants
      .sort((a, b) => {
        if (a.completed && !b.completed) return -1;
        if (!a.completed && b.completed) return 1;
        if (a.completed && b.completed) return new Date(a.completedAt) - new Date(b.completedAt);
        return b.progress - a.progress;
      })
      .map((participant, index) => ({
        rank: index + 1,
        userId: participant.userId._id,
        name: participant.userId.name,
        email: participant.userId.email,
        progress: participant.progress,
        completed: participant.completed,
        completedAt: participant.completedAt,
        joinedAt: participant.joinedAt
      }));

    res.json({
      challenge: {
        _id: challenge._id,
        name: challenge.name,
        type: challenge.type,
        description: challenge.description,
        targetGoal: challenge.targetGoal,
        rewardBadge: challenge.rewardBadge
      },
      participants: sortedParticipants
    });
  } catch (error) {
    console.error('Get challenge leaderboard error:', error);
    res.status(500).json({ message: error.message });
  }
});

// 🎯 Create a new challenge (admin function)
router.post("/create", async (req, res) => {
  try {
    const { name, type, description, startDate, endDate, rewardBadge, targetGoal } = req.body;
    
    const challenge = new Challenge({
      name,
      type,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      rewardBadge,
      targetGoal: targetGoal || 7,
      participants: [],
      isActive: true
    });

    await challenge.save();
    res.json({ message: "Challenge created successfully", challenge });
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
