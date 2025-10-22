const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS Middleware - Allow all origins
app.use((req, res, next) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// Import routes
const aiRoutes = require('./routes/ai');
const resultRoutes = require('./routes/result');
const essayRoutes = require('./routes/essay');
const aiTask1Routes = require('./routes/aiTask1');
const readingRoutes = require('./routes/reading');
const readingHistoryRoutes = require('./routes/readingHistory');
const listeningRoutes = require('./routes/listening');
const speakingRoutes = require('./routes/speaking');
const dashboardRoutes = require('./routes/dashboard');
const achievementRoutes = require('./routes/achievements');
const leaderboardRoutes = require('./routes/leaderboard');
const challengeRoutes = require('./routes/challenges');
const certificateRoutes = require('./routes/certificates');
const testRoutes = require('./routes/tests');
const testsRoutes = require('./routes/testsRoutes');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payment');
const upsellRoutes = require('./routes/upsell');
const { router: authRoutes } = require('./routes/auth');

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/ai", essayRoutes);
app.use('/api/ai', aiTask1Routes);
app.use('/api/reading', readingRoutes);
app.use('/api/reading', readingHistoryRoutes);
app.use('/api/listening', listeningRoutes);
app.use('/api/speaking', speakingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/test', testRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/upsell', upsellRoutes);

app.get("/api/health", (req, res) => {
  res.json({ message: "Server is healthy and connected!" });
});

// Dashboard API route
app.get("/api/dashboard", (req, res) => {
  try {
    res.json({
      achievements: [],
      certificates: [],
      tests: [],
      summary: {
        totalTests: 0,
        totalCertificates: 0,
        totalAchievements: 0,
      },
    });
  } catch (err) {
    console.error("Dashboard API Error:", err);
    res.status(500).json({ message: "Error loading dashboard data" });
  }
});

// Demo data route for testing
app.get("/api/dashboard/demo", (req, res) => {
  res.json({
    tests: [
      { 
        name: "Reading Practice Test 1", 
        score: 7.5, 
        date: "2025-10-15",
        type: "Reading",
        band: 7.5
      },
      { 
        name: "Listening Practice Test 2", 
        score: 8.0, 
        date: "2025-10-17",
        type: "Listening",
        band: 8.0
      },
      { 
        name: "Writing Task 2 Practice", 
        score: 7.0, 
        date: "2025-10-19",
        type: "Writing",
        band: 7.0
      },
      { 
        name: "Speaking Practice Test", 
        score: 8.5, 
        date: "2025-10-20",
        type: "Speaking",
        band: 8.5
      }
    ],
    certificates: [
      { 
        title: "IELTS Reading Mastery", 
        issuedBy: "Antoree", 
        date: "2025-10-18",
        band: 7.5
      },
      { 
        title: "Listening Excellence Certificate", 
        issuedBy: "Antoree", 
        date: "2025-10-21",
        band: 8.0
      }
    ],
    achievements: [
      { 
        title: "Daily Practice Streak", 
        streak: 5,
        badge: "🔥",
        description: "5 days in a row!"
      },
      { 
        title: "Top 10% Learner", 
        level: "Gold",
        badge: "🏆",
        description: "Outstanding performance"
      },
      { 
        title: "Reading Master", 
        level: "Platinum",
        badge: "📚",
        description: "Achieved Band 7.5+ in Reading"
      }
    ],
    summary: {
      totalTests: 4,
      totalCertificates: 2,
      totalAchievements: 3,
      averageBand: 7.75,
      currentLevel: 3,
      streak: 5
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});