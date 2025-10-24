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

// IELTS content routes
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

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
