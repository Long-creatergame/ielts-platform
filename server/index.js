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
// const quickPracticeRoutes = require('./routes/quickPractice.js'); // deprecated
// const ieltsTestRoutes = require('./routes/ieltsTest.js'); // deprecated
const audioRoutes = require('./routes/audio.js');
const recommendationsRoutes = require('./routes/recommendations.js');
const progressTrackingRoutes = require('./routes/progress-tracking.js');
const dailyChallengeRoutes = require('./routes/dailyChallenge.js');
const milestonesRoutes = require('./routes/milestones.js');
const notificationsRoutes = require('./routes/notifications.js');
const featureUsageRoutes = require('./routes/featureUsage.js');
const analyticsRoutes = require('./routes/analytics.js');
const leaderboardRoutes = require('./routes/leaderboard.js');
const practiceRoutes = require('./routes/practice.js');
const aiMasterRoutes = require('./routes/aiMaster.js');
const weeklyReportRoutes = require('./routes/weeklyReport.js');
const healthRoutes = require('./routes/health.js');
const userPreferencesRoutes = require('./routes/userPreferences.js');
const userRoutes = require('./routes/user.js');
const ieltsItemsRoutes = require('./routes/ieltsItems.js');
const debugRoutes = require('./routes/debug.js');
const { startDailyGenerator } = require('./cron/dailyGenerator');
const userResultsRoutes = require('./routes/userResults.js');
const feedbackRoutes = require('./routes/feedback.js');
const motivationRoutes = require('./routes/motivation.js');
const modeAnalyticsRoutes = require('./routes/modeAnalytics.js');
const cambridgeTestRoutes = require('./routes/cambridgeTest.js');
const testSessionRoutes = require('./routes/testSession.js');
const unifiedCambridgeRoutes = require('./routes/unifiedCambridgeRouter.js');
const examRoutes = require('./routes/examRoutes.js');
const productionRoutes = require('./routes/productionRoutes.js');
const mediaRoutes = require('./routes/mediaRoutes.js');

dotenv.config();

// Startup validation logs
console.log("✅ Cambridge AI Server starting...");
console.log("Environment:", process.env.NODE_ENV || 'development');
console.log("Mongo URI:", process.env.MONGO_URI ? "✓ Loaded" : "❌ Missing");
console.log("OpenAI Key:", process.env.OPENAI_API_KEY ? "✓ Loaded" : "❌ Missing");

const app = express();
// Production middlewares
try {
  const helmet = require('helmet');
  const compression = require('compression');
  const cors = require('cors');
  const { buildCorsOptions } = require('./config/corsConfig');
  const rateLimit = require('express-rate-limit');
  const morgan = require('morgan');
  app.use(helmet());
  app.use(compression());
  
  // CORS options centralized
  app.use(cors(buildCorsOptions()));
  
  // Handle preflight requests
  app.options('*', cors());
  
  app.use(morgan('combined'));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, message: 'Too many requests, please try again later.' }));
} catch (_) {}
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
      console.warn('[Request:Slow]', req.method, req.originalUrl, res.statusCode, `${ms}ms`);
    }
  });
  next();
});

// Timezone middleware - capture user timezone from headers
const timezoneMiddleware = require('./middleware/timezoneMiddleware');
app.use(timezoneMiddleware);
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
    
    console.log('[MongoDB:Connecting] Starting connection...');
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout for production
      socketTimeoutMS: 45000, // 45 second timeout
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverApi: {
        version: '1',
        strict: false,
        deprecationErrors: true,
      },
    });
    
    console.log('[MongoDB:Connected]', mongoose.connection.db.databaseName);
    
  } catch (error) {
    console.error('[MongoDB:Error]', error.message);
  }
};

// Skip DB connection entirely in test to avoid timeouts in CI
if (process.env.NODE_ENV !== 'test') {
  connectDB();

  // MongoDB connection monitoring
  mongoose.connection.on('connected', () => {
    console.log('[MongoDB:Status] Connected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB:Error]', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('[MongoDB:Status] Disconnected');
  });
}

console.log('[Init] MongoDB schemas loaded');

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

// Body parsers - MUST be before routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
    ok: true,
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
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/upsell', upsellRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ai-master', aiMasterRoutes);
app.use('/api/real-ielts', realIELTSRoutes);
app.use('/api/authentic-ielts', authenticIELTSRoutes);
app.use('/api/ai-engine', aiEngineRoutes);
app.use('/api/ai-recommendations', aiRecommendationsRoutes);
app.use('/api/ai-personalization', aiPersonalizationRoutes);
// app.use('/api/quick-practice', quickPracticeRoutes); // deprecated
// app.use('/api/ielts-test', ieltsTestRoutes); // deprecated
app.use('/api/audio', audioRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/progress-tracking', progressTrackingRoutes);
app.use('/api/daily-challenge', dailyChallengeRoutes);
app.use('/api/milestones', milestonesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/feature-usage', featureUsageRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/weekly-report', weeklyReportRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/user-preferences', userPreferencesRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ielts-items', ieltsItemsRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/user-results', userResultsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/motivation', motivationRoutes);
app.use('/api/mode-analytics', modeAnalyticsRoutes);
app.use('/api/cambridge/test', cambridgeTestRoutes);
app.use('/api/test', testSessionRoutes);
app.use('/api/cambridge', unifiedCambridgeRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/media', mediaRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler (unified)
try {
  const errorHandler = require('./middleware/errorHandler');
  app.use(errorHandler);
} catch (e) {
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  });
}

// WebSocket (Socket.IO) setup - skip in test environment to avoid open handles
if (process.env.NODE_ENV !== 'test') {
  try {
    const { Server } = require('socket.io');
    const wsAllowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://ielts-platform-two.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    io = new Server(server, {
      cors: {
        origin: wsAllowedOrigins.length > 0 ? wsAllowedOrigins : '*',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    io.on('connection', (socket) => {
      console.log('[WebSocket:Connect]', socket.id);

      socket.on('join', (room) => {
        if (room) socket.join(room);
      });

      socket.on('disconnect', () => {
        console.log('[WebSocket:Disconnect]', socket.id);
      });
    });

    app.set('io', io);
    console.log('[Init] WebSocket enabled');
  } catch (e) {
    console.warn('Socket.IO not available, skipping realtime features');
  }
}

// Cache cleanup job (weekly)
if (process.env.NODE_ENV !== 'test') {
  const { cleanupExpiredPrompts } = require('./utils/cacheCleanup');
  
  // Run cleanup on startup
  setTimeout(async () => {
    await cleanupExpiredPrompts();
  }, 30000); // 30 seconds after startup
  
  // Schedule weekly cleanup (7 days = 604800000 ms)
  setInterval(async () => {
    await cleanupExpiredPrompts();
  }, 7 * 24 * 60 * 60 * 1000);
  
  console.log('[Init] Cache cleanup scheduled (weekly)');
}

// Demo mode shortcut for auth endpoints
if (process.env.ENABLE_DEMO_MODE === 'true' || process.env.DEMO_MODE === 'true') {
  console.log('🧩 Running in DEMO MODE: Guest access enabled.');
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/auth')) {
      return res.status(200).json({ message: 'Demo mode active', user: { id: 'demo-user', role: 'demo' } });
    }
    next();
  });

  // Demo reset endpoint
  app.get('/api/demo/reset', async (req, res) => {
    try {
      const ExamSession = require('./models/ExamSession');
      const ExamResult = require('./models/ExamResult');
      const AI_Feedback = require('./models/AI_Feedback');
      
      await ExamSession.deleteMany({ userId: 'demo-user' });
      await ExamResult.deleteMany({ userId: 'demo-user' });
      await AI_Feedback.deleteMany({ userId: 'demo-user' });
      
      res.json({ message: 'Demo data reset complete.', timestamp: new Date() });
    } catch (error) {
      console.error('[Demo Reset] Error:', error.message);
      res.status(500).json({ error: 'Failed to reset demo data' });
    }
  });
}

// In test mode, export app without starting the listener to avoid EADDRINUSE
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log('[Init] Server running on port', PORT);
    
    // Start daily IELTS item generator cron job
    try {
      startDailyGenerator();
      console.log('[Init] Daily IELTS item generator cron job initialized');
    } catch (error) {
      console.error('[Init] Error initializing cron job:', error);
    }
  });
}

module.exports = app;