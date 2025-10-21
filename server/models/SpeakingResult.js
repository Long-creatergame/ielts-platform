const mongoose = require('mongoose');

const SpeakingResultSchema = new mongoose.Schema(
  {
    userId: { type: String, default: 'guest' },
    testType: { type: String, default: 'academic' },
    fluency: { type: Number, required: true },
    lexical: { type: Number, required: true },
    grammar: { type: Number, required: true },
    pronunciation: { type: Number, required: true },
    overall: { type: Number, required: true },
    feedback: { type: String, required: true },
    duration: { type: Number, required: true }, // in seconds
    audioUrl: { type: String }, // path to audio file
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true, collection: 'speaking_results' }
);

module.exports = mongoose.model('SpeakingResult', SpeakingResultSchema);

