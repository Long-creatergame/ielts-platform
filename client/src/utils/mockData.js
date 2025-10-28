// Mock Data for Frontend - Platform hoạt động ngay lập tức!
export const mockUser = {
  id: 'mock-user-123',
  name: 'Test User',
  email: 'test@example.com',
  goal: '7',
  level: 'intermediate',
  plan: 'trial',
  freeTestsUsed: 1,
  freeTestsLimit: 3,
  paid: false
};

export const mockTestHistory = [
  {
    id: '1',
    skill: 'reading',
    score: 7.5,
    date: new Date('2024-01-15'),
    duration: 60,
    status: 'completed'
  },
  {
    id: '2', 
    skill: 'listening',
    score: 7.0,
    date: new Date('2024-01-14'),
    duration: 40,
    status: 'completed'
  },
  {
    id: '3',
    skill: 'writing',
    score: 6.0,
    date: new Date('2024-01-13'),
    duration: 60,
    status: 'completed'
  }
];

export const mockAIWeakness = {
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
  }
};

export const mockProgress = {
  overallProgress: 65,
  skillProgress: {
    reading: { score: 7.5, trend: 'up', tests: 5 },
    listening: { score: 7.0, trend: 'stable', tests: 4 },
    writing: { score: 5.5, trend: 'down', tests: 3 },
    speaking: { score: 5.0, trend: 'down', tests: 2 }
  },
  recentTests: mockTestHistory.slice(0, 3),
  weeklyStats: {
    testsCompleted: 3,
    timeSpent: 120,
    improvement: 0.5
  }
};

export const mockRecommendations = [
  {
    id: '1',
    type: 'practice',
    title: 'Writing Task 2 Practice',
    description: 'Focus on essay structure and argument development',
    skill: 'writing',
    difficulty: 'intermediate',
    estimatedTime: 30
  },
  {
    id: '2',
    type: 'test',
    title: 'Speaking Part 2 Practice',
    description: 'Practice describing topics for 2 minutes',
    skill: 'speaking',
    difficulty: 'intermediate',
    estimatedTime: 15
  }
];

export const mockNotifications = [
  {
    id: '1',
    type: 'reminder',
    title: 'Daily Practice Reminder',
    message: 'Time for your daily IELTS practice!',
    time: new Date(),
    read: false
  },
  {
    id: '2',
    type: 'achievement',
    title: 'Great Progress!',
    message: 'You improved your reading score by 0.5 points!',
    time: new Date(),
    read: false
  }
];

// Mock API functions
export const mockAPI = {
  // Auth
  login: async (email, password) => {
    if (email === 'test@example.com' && password === 'Test123') {
      return { success: true, user: mockUser, token: 'mock-token-123' };
    }
    throw new Error('Invalid credentials');
  },
  
  register: async (userData) => {
    return { success: true, user: { ...mockUser, ...userData }, token: 'mock-token-123' };
  },

  // Test History
  getTestHistory: async () => {
    return { success: true, data: mockTestHistory };
  },

  // AI Features
  getAIWeakness: async (userId) => {
    return { success: true, data: mockAIWeakness };
  },

  getProgress: async (userId) => {
    return { success: true, data: mockProgress };
  },

  getRecommendations: async (userId) => {
    return { success: true, data: mockRecommendations };
  },

  // Notifications
  getNotifications: async (userId) => {
    return { success: true, data: mockNotifications };
  }
};

