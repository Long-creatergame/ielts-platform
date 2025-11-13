const mongoose = require('mongoose');

/**
 * Core V3 Database Connection
 * Uses separate database: ielts_platform_core
 */
const CORE_DB_URI = process.env.CORE_DB_URI || 
  'mongodb://localhost:27017/ielts_platform_core';

let coreConnection = null;

/**
 * Connect to Core V3 database
 */
async function connectCoreDB() {
  if (coreConnection && coreConnection.readyState === 1) {
    return coreConnection;
  }

  try {
    coreConnection = await mongoose.createConnection(CORE_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    coreConnection.on('connected', () => {
      console.log('[Core V3] Database connected:', CORE_DB_URI);
    });

    coreConnection.on('error', (err) => {
      console.error('[Core V3] Database connection error:', err);
    });

    coreConnection.on('disconnected', () => {
      console.log('[Core V3] Database disconnected');
    });

    return coreConnection;
  } catch (error) {
    console.error('[Core V3] Failed to connect to database:', error);
    throw error;
  }
}

/**
 * Get Core V3 database connection
 */
function getCoreConnection() {
  if (!coreConnection || coreConnection.readyState !== 1) {
    throw new Error('Core V3 database not connected. Call connectCoreDB() first.');
  }
  return coreConnection;
}

/**
 * Disconnect Core V3 database
 */
async function disconnectCoreDB() {
  if (coreConnection) {
    await coreConnection.close();
    coreConnection = null;
    console.log('[Core V3] Database disconnected');
  }
}

module.exports = {
  connectCoreDB,
  getCoreConnection,
  disconnectCoreDB,
  CORE_DB_URI,
};

