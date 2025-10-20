const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
  score: Number,
  feedback: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Result", resultSchema);
