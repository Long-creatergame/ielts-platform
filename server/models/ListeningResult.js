const mongoose = require('mongoose');

const ListeningResultSchema = new mongoose.Schema(
  {
    userId: { type: String, default: 'guest' },
    testType: { type: String, default: 'academic' },
    correctCount: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    bandScore: { type: Number, required: true },
    duration: { type: Number, required: true }, // in minutes
    feedback: { type: String, required: true },
    answers: [{ 
      questionId: Number,
      userAnswer: String,
      correctAnswer: String,
      isCorrect: Boolean
    }],
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true, collection: 'listening_results' }
);

module.exports = mongoose.model('ListeningResult', ListeningResultSchema);
