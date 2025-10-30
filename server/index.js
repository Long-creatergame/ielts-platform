const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth.js');
const dashboardRoutes = require('./routes/dashboard.js');
const testRoutes = require('./routes/tests.js');
const paymentRoutes = require('./routes/payment.js');
const upsellRoutes = require('./routes/upsell.js');
const aiRoutes = require('./routes/ai.js');
const realIELTSRoutes = require('./routes/realIELTS.js');
const authenticIELTSRoutes = require('./routes/authenticIELTS.js');
const aiEngineRoutes = require('./routes/aiEngine.js');
const aiRecommendationsRoutes = require('./routes/aiRecommendations.js');
const aiPersonalizationRoutes = require('./routes/aiPersonalization.js');
const quickPracticeRoutes = require('./routes/quickPractice.js');
const ieltsTestRoutes = require('./routes/ieltsTest.js');
const audioRoutes = require('./routes/audio.js');
const recommendationsRoutes = require('./routes/recommendations.js');
const progressTrackingRoutes = require('./routes/progress-tracking.js');
const dailyChallengeRoutes = require('./routes/dailyChallenge.js');
const milestonesRoutes = require('./routes/milestones.js');
const notificationsRoutes = require('./routes/notifications.js');
const featureUsageRoutes = require('./routes/featureUsage.js');
const analyticsRoutes = require('./routes/analytics.js');
const leaderboardRoutes = require('./routes/leaderboard.js');
const weeklyReportRoutes = require('./routes/weeklyReport.js');
const healthRoutes = require('./routes/health.js');

dotenv.config();

const app = express();
// Validate critical environment early
try {
  const { validateCriticalEnv } = require('./utils/envValidation');
  validateCriticalEnv();
} catch (e) {
  console.error('Environment validation failed:', e.message);
}

// Basic request timing & error logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    if (res.statusCode >= 500 || ms > 1000) {
      console.warn(`[req] ${req.method} ${req.originalUrl} -> ${res.statusCode} in ${ms}ms`);
    }
  });
  next();
});
const PORT = process.env.PORT || 4000;
const http = require('http');
const server = http.createServer(app);
let io = null;

// Connect to MongoDB with production-ready configuration
const connectDB = async () => {
  try {
    // Prefer cloud connection strings if provided by the environment
    const mongoURI = (
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      process.env.MONGO_URL ||
      'mongodb://localhost:27017/ielts-platform'
    );
    
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('📍 URI:', mongoURI.includes('mongodb.net') ? 'MongoDB Atlas (Production)' : 'Local MongoDB');
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout for production
      socketTimeoutMS: 45000, // 45 second timeout
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverApi: {
        version: '1',
        strict: false,
        deprecationErrors: true,
      },
      // Remove deprecated options
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // More specific error handling
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Suggestion: MongoDB server is not running locally');
      console.log('💡 For production, ensure MONGO_URI is set correctly');
    } else if (error.message.includes('authentication failed')) {
      console.log('💡 Suggestion: Check MongoDB credentials');
    } else if (error.message.includes('network')) {
      console.log('💡 Suggestion: Check network connection to MongoDB');
    }
    
    console.log('⚠️ Server will continue without database connection');
    console.log('⚠️ Some features may not work properly');
  }
};

// Skip DB connection entirely in test to avoid timeouts in CI
if (process.env.NODE_ENV !== 'test') {
  connectDB();

  // MongoDB connection monitoring
  mongoose.connection.on('connected', () => {
    console.log('🟢 MongoDB connection established');
  });

  mongoose.connection.on('error', (err) => {
    console.error('🔴 MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('🟡 MongoDB disconnected');
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    console.log('🔒 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during MongoDB disconnection:', error);
    process.exit(1);
  }
});

// CORS Middleware - ABSOLUTE FINAL FIX
app.use((req, res, next) => {
  // Force CORS headers for ALL requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: 'Disconnected',
    1: 'Connected', 
    2: 'Connecting',
    3: 'Disconnecting'
  };
  
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: {
      status: dbStates[dbStatus],
      readyState: dbStatus,
      host: mongoose.connection.host || 'N/A',
      name: mongoose.connection.db?.databaseName || 'N/A'
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database status endpoint
app.get('/api/db-status', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  
  res.json({
    connected: isConnected,
    host: mongoose.connection.host,
    database: mongoose.connection.db?.databaseName,
    collections: isConnected ? Object.keys(mongoose.connection.db.collections) : [],
    uptime: process.uptime()
  });
});

// Simple uptime check for monitoring services
app.get('/api/uptime', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// AI service status check
app.get('/api/ai-status', (req, res) => {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  res.json({
    status: hasOpenAI ? 'OK' : 'DISABLED',
    hasOpenAI,
    timestamp: new Date().toISOString()
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/upsell', upsellRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/real-ielts', realIELTSRoutes);
app.use('/api/authentic-ielts', authenticIELTSRoutes);
app.use('/api/ai-engine', aiEngineRoutes);
app.use('/api/ai-recommendations', aiRecommendationsRoutes);
app.use('/api/ai-personalization', aiPersonalizationRoutes);
app.use('/api/quick-practice', quickPracticeRoutes);
app.use('/api/ielts-test', ieltsTestRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/progress-tracking', progressTrackingRoutes);
app.use('/api/daily-challenge', dailyChallengeRoutes);
app.use('/api/milestones', milestonesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/feature-usage', featureUsageRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/weekly-report', weeklyReportRoutes);
app.use('/api/health', healthRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// WebSocket (Socket.IO) setup - skip in test environment to avoid open handles
if (process.env.NODE_ENV !== 'test') {
  try {
    const { Server } = require('socket.io');
    io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      console.log('🔌 Client connected:', socket.id);

      socket.on('join', (room) => {
        if (room) socket.join(room);
      });

      socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
      });
    });

    app.set('io', io);
    console.log('🛰️  WebSocket (Socket.IO) initialized');
  } catch (e) {
    console.warn('Socket.IO not available, skipping realtime features');
  }
}

// In test mode, export app without starting the listener to avoid EADDRINUSE
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

module.exports = app;