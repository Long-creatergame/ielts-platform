const mongoose = require('mongoose');

const ReadingResultSchema = new mongoose.Schema(
  {
    userId: { type: String, default: 'guest' },
    testType: { type: String, enum: ['academic', 'general'], required: true },
    correctCount: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    bandScore: { type: Number, required: true },
    duration: { type: Number, required: true }, // in minutes
    sectionFeedback: { type: String, required: true },
    answers: [{ 
      questionId: Number,
      userAnswer: String,
      correctAnswer: String,
      isCorrect: Boolean
    }],
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true, collection: 'reading_results' }
);

module.exports = mongoose.model('ReadingResult', ReadingResultSchema);
