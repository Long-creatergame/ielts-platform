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
const aiEngineRoutes = require('./routes/aiEngine.js');
const aiRecommendationsRoutes = require('./routes/aiRecommendations.js');
const progressTrackingRoutes = require('./routes/progressTracking.js');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB with production-ready configuration
const connectDB = async () => {
  try {
    // Use production MongoDB Atlas or local fallback
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/ielts-platform';
    
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

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
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
app.use('/api', realIELTSRoutes);
app.use('/api/ai-engine', aiEngineRoutes);
app.use('/api/ai-recommendations', aiRecommendationsRoutes);
app.use('/api/progress-tracking', progressTrackingRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});