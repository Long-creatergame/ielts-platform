import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/ielts-platform';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully!');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
  }
};

connectDB();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is working!', 
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Simple validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Mock user creation
    const user = {
      id: Date.now(),
      name,
      email,
      password: 'hashed_password'
    };
    
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Mock login
    if (email && password) {
      res.json({
        message: 'Login successful',
        user: { id: 1, name: 'Test User', email },
        token: 'mock_jwt_token'
      });
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Test submission
app.post('/api/tests/submit', async (req, res) => {
  try {
    const { answers, skill, level } = req.body;
    
    // Mock test submission
    res.json({
      message: 'Test submitted successfully',
      result: {
        bandScore: 7.5,
        feedback: 'Good performance! Keep practicing.',
        recommendations: ['Practice more reading', 'Improve vocabulary']
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// AI routes
app.post('/api/ai/assess', async (req, res) => {
  try {
    const { skill, answer, level } = req.body;
    
    // Mock AI assessment
    res.json({
      bandScore: 7.0,
      feedback: 'Good answer! Keep practicing.',
      recommendations: ['Practice more', 'Improve grammar']
    });
  } catch (error) {
    res.status(500).json({ message: 'AI assessment failed' });
  }
});

// Quick Actions - Simple practice content
app.get('/api/quick-practice/:skill', async (req, res) => {
  try {
    const { skill } = req.params;
    
    // Quick practice content - Simple, short exercises
    const quickContent = {
      reading: {
        title: "Quick Reading Practice",
        passage: "This is a short reading passage for quick practice. It contains basic vocabulary and simple sentence structures.",
        questions: [
          "What is the main topic?",
          "What does the author suggest?",
          "What is the purpose of this text?"
        ],
        timeLimit: null, // No time limit for quick practice
        level: "General"
      },
      listening: {
        title: "Quick Listening Practice",
        audio: "quick_listening_sample.mp3",
        questions: [
          "What is the speaker talking about?",
          "Where does this conversation take place?",
          "What is the main point?"
        ],
        timeLimit: null, // No time limit for quick practice
        level: "General"
      },
      writing: {
        title: "Quick Writing Practice",
        task: "Write a short paragraph (50-100 words) about your favorite hobby.",
        timeLimit: null, // No time limit for quick practice
        level: "General"
      },
      speaking: {
        title: "Quick Speaking Practice",
        questions: [
          "What's your name?",
          "Where are you from?",
          "What do you like to do in your free time?"
        ],
        timeLimit: null, // No time limit for quick practice
        level: "General"
      }
    };
    
    res.json(quickContent[skill] || { message: 'Skill not found' });
  } catch (error) {
    res.status(500).json({ message: 'Quick practice content not available' });
  }
});

// Practice Tests - Full IELTS content
app.get('/api/practice-tests/:skill', async (req, res) => {
  try {
    const { skill } = req.params;
    
    // Full practice test content - Complete IELTS format
    const practiceContent = {
      reading: {
        title: "Academic Reading Test",
        level: "6.5",
        duration: "60 minutes",
        passage: "This is a full-length IELTS Academic Reading passage. It contains complex vocabulary, academic language, and challenging comprehension questions that test your ability to understand detailed information, identify main ideas, and make inferences.",
        questions: [
          "According to the passage, what is the main argument?",
          "What evidence supports the author's claim?",
          "What can be inferred from paragraph 3?",
          "What is the author's attitude towards the topic?",
          "What is the purpose of the final paragraph?"
        ],
        timeLimit: 60, // 60 minutes
        type: "Academic Reading Test"
      },
      listening: {
        title: "Academic Listening Test",
        level: "6.5",
        duration: "40 minutes",
        audio: "full_listening_test.mp3",
        questions: [
          "What is the main topic of the lecture?",
          "According to the speaker, what are the three main points?",
          "What example does the speaker give?",
          "What is the speaker's conclusion?",
          "What does the speaker recommend?"
        ],
        timeLimit: 40, // 40 minutes
        type: "Academic Listening Test"
      },
      writing: {
        title: "Academic Writing Test",
        level: "6.5",
        duration: "60 minutes",
        task1: "The chart below shows the percentage of people who use different types of transportation in a city. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
        task2: "Some people believe that technology has made our lives more complicated, while others think it has made life easier. Discuss both views and give your own opinion.",
        timeLimit: 60, // 60 minutes
        type: "Academic Writing Test"
      },
      speaking: {
        title: "Academic Speaking Test",
        level: "6.5",
        duration: "15 minutes",
        part1: [
          "What's your name?",
          "Where are you from?",
          "What do you do for work?",
          "What do you like to do in your free time?"
        ],
        part2: "Describe a memorable trip you have taken. You should say: where you went, who you went with, what you did there, and explain why it was memorable.",
        part3: [
          "What are the benefits of traveling?",
          "How has tourism changed in your country?",
          "What impact does tourism have on the environment?",
          "Do you think tourism will continue to grow in the future?"
        ],
        timeLimit: 15, // 15 minutes
        type: "Academic Speaking Test"
      }
    };
    
    res.json(practiceContent[skill] || { message: 'Skill not found' });
  } catch (error) {
    res.status(500).json({ message: 'Practice test content not available' });
  }
});

// IELTS content routes (for backward compatibility)
app.get('/api/authentic-ielts/:skill', async (req, res) => {
  try {
    const { skill } = req.params;
    
    // Mock IELTS content
    const content = {
      reading: {
        passage: "Sample IELTS reading passage...",
        questions: ["Question 1", "Question 2", "Question 3"]
      },
      listening: {
        audio: "sample_audio.mp3",
        questions: ["Question 1", "Question 2", "Question 3"]
      },
      writing: {
        task1: "Describe the chart...",
        task2: "Write an essay about..."
      },
      speaking: {
        part1: ["What's your name?", "Where are you from?"],
        part2: "Describe your hometown",
        part3: ["What are the advantages of living in a city?"]
      }
    };
    
    res.json(content[skill] || { message: 'Skill not found' });
  } catch (error) {
    res.status(500).json({ message: 'Content not available' });
  }
});

// AI Recommendations API
app.get('/api/ai-recommendations/my-recommendations', async (req, res) => {
  try {
    const { skill } = req.query;
    
    // Mock AI recommendations based on skill
    const recommendations = {
      reading: [
        {
          id: 1,
          title: "Improve Reading Speed",
          description: "Practice skimming and scanning techniques to read faster while maintaining comprehension.",
          action: "Read 2 articles daily and time yourself",
          timeframe: "2 weeks",
          difficulty: "intermediate",
          expectedImprovement: "0.5-1.0 band improvement",
          resources: ["IELTS Reading Practice", "Speed Reading Techniques"],
          progress: null
        }
      ],
      writing: [
        {
          id: 2,
          title: "Enhance Essay Structure",
          description: "Focus on clear introduction, body paragraphs, and conclusion structure.",
          action: "Write 3 essays per week with proper structure",
          timeframe: "3 weeks",
          difficulty: "intermediate",
          expectedImprovement: "0.5-1.5 band improvement",
          resources: ["Essay Templates", "Grammar Practice"],
          progress: null
        }
      ],
      listening: [
        {
          id: 3,
          title: "Improve Note-taking Skills",
          description: "Practice taking notes while listening to improve retention and accuracy.",
          action: "Listen to 1 podcast daily and take notes",
          timeframe: "2 weeks",
          difficulty: "beginner",
          expectedImprovement: "0.5-1.0 band improvement",
          resources: ["IELTS Listening Practice", "Note-taking Techniques"],
          progress: null
        }
      ],
      speaking: [
        {
          id: 4,
          title: "Enhance Fluency",
          description: "Practice speaking continuously without long pauses to improve fluency.",
          action: "Record yourself speaking for 2 minutes daily",
          timeframe: "3 weeks",
          difficulty: "intermediate",
          expectedImprovement: "0.5-1.0 band improvement",
          resources: ["Speaking Practice", "Fluency Exercises"],
          progress: null
        }
      ]
    };
    
    const skillRecommendations = skill && skill !== 'all' 
      ? recommendations[skill] || []
      : Object.values(recommendations).flat();
    
    res.json({
      recommendations: skillRecommendations,
      total: skillRecommendations.length,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recommendations' });
  }
});

app.post('/api/ai-recommendations/generate-recommendations', async (req, res) => {
  try {
    const { skill, currentLevel } = req.body;
    
    // Mock AI-generated recommendations
    const newRecommendations = [
      {
        id: Date.now(),
        title: `Advanced ${skill} Practice`,
        description: `Based on your ${currentLevel} level, focus on advanced ${skill} techniques.`,
        action: `Practice advanced ${skill} exercises daily`,
        timeframe: "4 weeks",
        difficulty: "advanced",
        expectedImprovement: "1.0-2.0 band improvement",
        resources: [`Advanced ${skill} Materials`, "Expert Tips"],
        progress: null
      }
    ];
    
    res.json({
      recommendations: newRecommendations,
      message: 'New recommendations generated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate recommendations' });
  }
});

app.post('/api/ai-recommendations/track-progress', async (req, res) => {
  try {
    const { recommendationId, action, completed } = req.body;
    
    // Mock progress tracking
    res.json({
      success: true,
      message: 'Progress tracked successfully',
      recommendationId,
      action,
      completed,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to track progress' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
