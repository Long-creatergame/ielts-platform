const mongoose = require('mongoose');

const Task1ResultSchema = new mongoose.Schema(
  {
    userId: { type: String, default: 'guest' },
    taskType: { type: String, enum: ['academic', 'general'], required: true },
    question: { type: String, required: true },
    essay: { type: String, required: true },
    score: { type: Number, required: true }, // 0 - 9
    feedback: { type: String, required: true },
    model: { type: String, default: 'llama3-8b-instant' },
  },
  { timestamps: true, collection: 'writing_task1_results' }
);

module.exports = mongoose.model('Task1Result', Task1ResultSchema);
