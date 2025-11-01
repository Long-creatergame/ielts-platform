/**
 * Cache Cleanup Utility
 * Removes expired cached prompts older than 6 months
 * Should be run as a scheduled job (e.g., weekly)
 */

const CachedPrompt = require('../models/CachedPrompt');

const CACHE_EXPIRY_DAYS = parseInt(process.env.CACHE_EXPIRY_DAYS) || 180; // 6 months default

/**
 * Cleanup expired cached prompts
 */
const cleanupExpiredPrompts = async () => {
  try {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() - CACHE_EXPIRY_DAYS);

    const result = await CachedPrompt.deleteMany({
      createdAt: { $lt: expiryDate }
    });

    console.log(`🧹 [CACHE CLEANUP] Removed ${result.deletedCount} expired prompts older than ${CACHE_EXPIRY_DAYS} days`);
    
    return {
      success: true,
      deletedCount: result.deletedCount,
      message: `Removed ${result.deletedCount} expired prompts`
    };
  } catch (error) {
    console.error('❌ Cache cleanup error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get cache statistics
 */
const getCacheStats = async () => {
  try {
    const totalPrompts = await CachedPrompt.countDocuments();
    const totalUsage = await CachedPrompt.aggregate([
      { $group: { _id: null, total: { $sum: '$usageCount' } } }
    ]);
    
    const oldestPrompt = await CachedPrompt.findOne().sort({ createdAt: 1 });
    const newestPrompt = await CachedPrompt.findOne().sort({ createdAt: -1 });

    const stats = {
      totalPrompts,
      totalUsage: totalUsage[0]?.total || 0,
      oldestPromptDate: oldestPrompt?.createdAt || null,
      newestPromptDate: newestPrompt?.createdAt || null
    };

    console.log('📊 [CACHE STATS]', stats);
    return stats;
  } catch (error) {
    console.error('❌ Cache stats error:', error.message);
    return {
      totalPrompts: 0,
      totalUsage: 0,
      oldestPromptDate: null,
      newestPromptDate: null
    };
  }
};

module.exports = {
  cleanupExpiredPrompts,
  getCacheStats
};
