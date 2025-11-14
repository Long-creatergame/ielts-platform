const mongoose = require('mongoose');

let coreConnection = null;
let mongooseCore = null;

/**
 * Connect to Core V3 Final database
 * Uses dedicated mongoose connection instance
 */
const connectCoreDB = async () => {
  if (coreConnection && coreConnection.readyState === 1) {
    console.log('[Core V3 DB] Already connected.');
    return coreConnection;
  }

  const uri = process.env.CORE_DB_URI || 'mongodb+srv://localhost/ielts_core_v3';

  try {
    // Create dedicated connection
    coreConnection = await mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });

    mongooseCore = coreConnection;

    console.log('[Core V3 DB] MongoDB connected successfully.');
    console.log('[Core V3 DB] Database:', coreConnection.db.databaseName);

    // Connection event handlers
    coreConnection.on('connected', () => {
      console.log('[Core V3 DB] Connection established');
    });

    coreConnection.on('error', (err) => {
      console.error('[Core V3 DB] Connection error:', err.message);
    });

    coreConnection.on('disconnected', () => {
      console.log('[Core V3 DB] Connection disconnected');
    });

    return coreConnection;
  } catch (error) {
    console.error('[Core V3 DB] MongoDB connection error:', error);
    throw error;
  }
};

/**
 * Get the Core V3 mongoose instance
 * Models should use this instead of default mongoose
 */
const getMongooseCore = () => {
  if (!mongooseCore || mongooseCore.readyState !== 1) {
    throw new Error('[Core V3 DB] Connection not established. Call connectCoreDB() first.');
  }
  return mongooseCore;
};

module.exports = {
  connectCoreDB,
  getMongooseCore,
  mongooseCore: null, // Will be set after connection
};

