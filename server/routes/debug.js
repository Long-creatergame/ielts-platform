/**
 * Debug/Status Routes
 * Provides system health and debugging information
 */

const express = require('express');
const mongoose = require('mongoose');
const CachedPrompt = require('../models/CachedPrompt');
const { getCacheStats } = require('../utils/cacheCleanup');

const router = express.Router();

// Get system status
router.get('/status', async (req, res) => {
  try {
    const mongoConnected = mongoose.connection.readyState === 1;
    
    // Get cache stats
    const cacheStats = await getCacheStats().catch(() => ({
      totalPrompts: 0,
      totalUsage: 0
    }));
    
    // Calculate uptime
    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const uptime = `${hours}h ${minutes}m`;
    
    return res.json({
      status: 'ok',
      mongoConnected,
      cacheCount: cacheStats.totalPrompts || 0,
      totalCacheUsage: cacheStats.totalUsage || 0,
      uptime,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Debug status error:', error.message);
    return res.json({
      status: 'error',
      mongoConnected: false,
      cacheCount: 0,
      totalCacheUsage: 0,
      uptime: '0h 0m',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = router;
