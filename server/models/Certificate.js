const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  achievementType: { type: String, required: true }, // e.g. "Band 8 Achiever", "Streak Champion", "Test Master"
  bandScore: { type: Number, required: true },
  issueDate: { type: Date, default: Date.now },
  pdfUrl: { type: String, required: true },
  description: { type: String, default: "" },
  milestone: { type: String, default: "" }, // e.g. "Band 8+", "30-day streak", "60 tests"
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Certificate", certificateSchema);

