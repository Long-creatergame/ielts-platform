const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  totalTests: { type: Number, default: 0 },
  totalBandAverage: { type: Number, default: 0 },
  highestBand: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: null },
  badges: [{ type: String }], // e.g. ["Band 7 Achiever", "Perfect Streak 7"]
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Achievement", achievementSchema);
