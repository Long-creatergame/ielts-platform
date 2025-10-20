const mongoose = require('mongoose');

const EssayResultSchema = new mongoose.Schema({
  userId: { type: String, default: "guest" }, // for future login integration
  essay: { type: String, required: true },
  score: { type: Number, required: true },
  feedback: { type: String, required: true },
  model: { type: String, default: "llama3-8b-instant" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("EssayResult", EssayResultSchema);
