import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  level: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'beginner', 'intermediate', 'advanced'],
    required: true
  },
  skills: {
    reading: {
      questions: [Object],
      duration: Number
    },
    listening: {
      questions: [Object],
      duration: Number
    },
    writing: {
      questions: [Object],
      duration: Number
    },
    speaking: {
      questions: [Object],
      duration: Number
    }
  },
  skillScores: {
    reading: { correct: Number, total: Number },
    listening: { correct: Number, total: Number },
    writing: { correct: Number, total: Number },
    speaking: { correct: Number, total: Number }
  },
  skillBands: {
    reading: Number,
    listening: Number,
    writing: Number,
    speaking: Number
  },
  totalBand: {
    type: Number,
    required: true
  },
  answers: {
    type: Object,
    default: {}
  },
  paid: {
    type: Boolean,
    default: false
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  resultLocked: {
    type: Boolean,
    default: true
  },
  price: {
    type: Number,
    default: 0
  },
  feedbackUnlocked: {
    type: Boolean,
    default: false
  },
  feedback: {
    type: String,
    default: ''
  },
  coachMessage: {
    type: String,
    default: ''
  },
  completed: {
    type: Boolean,
    default: false
  },
  dateTaken: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Test', testSchema);