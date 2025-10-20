const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
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

app.get("/api/health", (req, res) => {
  res.json({ message: "Server is healthy and connected!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});