const mongoose = require('mongoose');

const cambridgeTestSchema = new mongoose.Schema({
  skill: { type: String, enum: ['reading', 'listening', 'writing', 'speaking'], required: true, index: true },
  section: { type: Number, default: 1 },
  setId: { type: String, index: true },
  passages: [{ type: mongoose.Schema.Types.Mixed }],
  audio_url: { type: String },
  audio_urls: [{ type: String }],
  question_count: { type: Number, default: 40 },
  answer_keys: { type: mongoose.Schema.Types.Mixed },
  mode: { type: String, enum: ['academic', 'general'], default: 'academic' },
  blueprint: { type: mongoose.Schema.Types.Mixed },
  image_urls: [{ type: String }],
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

cambridgeTestSchema.index({ skill: 1, section: 1 });
cambridgeTestSchema.index({ skill: 1, setId: 1 });

module.exports = mongoose.model('CambridgeTest', cambridgeTestSchema);

