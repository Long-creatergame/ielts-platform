const mongoose = require('mongoose');

const cambridgeTestSchema = new mongoose.Schema({
  skill: { type: String, enum: ['reading', 'listening', 'writing', 'speaking'], required: true, index: true },
  section: { type: Number, default: 1 },
  passages: [{ type: mongoose.Schema.Types.Mixed }],
  audio_url: { type: String },
  question_count: { type: Number, default: 40 },
  answer_keys: { type: mongoose.Schema.Types.Mixed },
  mode: { type: String, enum: ['academic', 'general'], default: 'academic' },
  blueprint: { type: mongoose.Schema.Types.Mixed },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

cambridgeTestSchema.index({ skill: 1, section: 1 });

module.exports = mongoose.model('CambridgeTest', cambridgeTestSchema);

