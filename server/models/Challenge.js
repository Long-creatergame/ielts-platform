const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["daily", "weekly", "monthly"], required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  rewardBadge: { type: String, required: true },
  targetGoal: { type: Number, default: 7 }, // e.g., 7 days for weekly challenge
  participants: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      progress: { type: Number, default: 0 },
      completed: { type: Boolean, default: false },
      joinedAt: { type: Date, default: Date.now },
      completedAt: { type: Date, default: null },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("Challenge", challengeSchema);
