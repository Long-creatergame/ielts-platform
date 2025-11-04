const mongoose = require('mongoose');

const testSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  cambridgeTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'CambridgeTest', index: true },
  skill: { type: String, enum: ['reading', 'listening', 'writing', 'speaking'], required: true },
  setId: { type: String, required: true, index: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  responses: { type: Array, default: [] },
  progress: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  audioTime: { type: Number, default: 0 },
  lastSkill: { type: String }
}, { timestamps: true });

testSessionSchema.index({ userId: 1, skill: 1, setId: 1 });

module.exports = mongoose.model('TestSession', testSessionSchema);


