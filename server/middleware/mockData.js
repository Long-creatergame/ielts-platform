// Mock Data Middleware for Development/Testing
// This ensures the platform works even without database connection

const mockUsers = new Map();
const mockTests = new Map();
const mockResults = new Map();

// Mock user data
const createMockUser = (userData) => {
  const userId = Date.now().toString();
  const user = {
    _id: userId,
    id: userId,
    name: userData.name,
    email: userData.email,
    password: userData.password, // In real app, this would be hashed
    goal: userData.goal || '7',
    level: userData.level || 'intermediate',
    plan: 'trial',
    freeTestsUsed: 0,
    freeTestsLimit: 3,
    paid: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  mockUsers.set(userId, user);
  return user;
};

// Mock test data
const createMockTest = (userId, skill, level) => {
  const testId = Date.now().toString();
  const test = {
    _id: testId,
    id: testId,
    userId: userId,
    skill: skill,
    level: level,
    questions: generateMockQuestions(skill, level),
    status: 'in_progress',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  mockTests.set(testId, test);
  return test;
};

// Generate mock questions based on skill and level
const generateMockQuestions = (skill, level) => {
  const questions = {
    reading: [
      {
        id: 1,
        type: 'multiple_choice',
        question: 'What is the main topic of the passage?',
        options: ['Technology', 'Education', 'Environment', 'Health'],
        correct: 0,
        passage: 'Technology has revolutionized the way we live and work...'
      }
    ],
    listening: [
      {
        id: 1,
        type: 'multiple_choice',
        question: 'What does the speaker recommend?',
        options: ['Study harder', 'Take breaks', 'Get more sleep', 'Exercise regularly'],
        correct: 1,
        audioUrl: '/api/audio/sample-listening.mp3'
      }
    ],
    writing: [
      {
        id: 1,
        type: 'essay',
        question: 'Write an essay about the advantages and disadvantages of technology in education.',
        wordLimit: 250
      }
    ],
    speaking: [
      {
        id: 1,
        type: 'speaking',
        question: 'Describe your hometown and what you like most about it.',
        timeLimit: 120
      }
    ]
  };
  
  return questions[skill] || questions.reading;
};

// Mock AI personalization data
const createMockAIPersonalization = (userId) => {
  return {
    userId: userId,
    strengths: [
      { area: 'Reading Comprehension', score: 7.5, description: 'Strong ability to understand complex texts' },
      { area: 'Listening Accuracy', score: 7.0, description: 'Good listening skills with high accuracy' }
    ],
    weaknesses: [
      { area: 'Writing Task Response', score: 5.5, description: 'Need to improve task achievement in writing' },
      { area: 'Speaking Fluency', score: 5.0, description: 'Speaking fluency needs improvement' }
    ],
    recommendations: [
      'Focus on writing task requirements and structure',
      'Practice speaking exercises daily',
      'Review grammar rules and common mistakes'
    ],
    overallScore: 6.0,
    skillBreakdown: {
      reading: { score: 7.5, trend: 'up' },
      listening: { score: 7.0, trend: 'stable' },
      writing: { score: 5.5, trend: 'down' },
      speaking: { score: 5.0, trend: 'down' }
    },
    studyPlan: {
      daily: ['Reading practice - 30 minutes', 'Writing exercises - 20 minutes'],
      weekly: ['Take 1 practice test', 'Review weak areas'],
      monthly: ['Full IELTS simulation', 'Progress assessment']
    }
  };
};

// Mock progress data
const createMockProgress = (userId) => {
  return {
    userId: userId,
    overallProgress: 65,
    skillProgress: {
      reading: { score: 7.5, trend: 'up', tests: 5 },
      listening: { score: 7.0, trend: 'stable', tests: 4 },
      writing: { score: 5.5, trend: 'down', tests: 3 },
      speaking: { score: 5.0, trend: 'down', tests: 2 }
    },
    recentTests: [
      { id: '1', skill: 'reading', score: 7.5, date: new Date() },
      { id: '2', skill: 'listening', score: 7.0, date: new Date() }
    ],
    weeklyStats: {
      testsCompleted: 3,
      timeSpent: 120, // minutes
      improvement: 0.5
    }
  };
};

// Export mock data functions
module.exports = {
  mockUsers,
  mockTests,
  mockResults,
  createMockUser,
  createMockTest,
  createMockAIPersonalization,
  createMockProgress
};

