/**
 * Daily IELTS Item Generator Cron Job
 * Runs at 00:00 every day to generate new IELTS items
 */

const cron = require('node-cron');
const IELTSItem = require('../models/IELTSItem');
const { generateIELTSItem } = require('../services/ieltsItemGenerator');

// Schedule: Run at 00:00 UTC every day
// Format: minute hour day month weekday
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '0 0 * * *';

let isRunning = false;

/**
 * Generate new IELTS items if needed
 */
async function generateDailyItems() {
  if (isRunning) {
    console.log('[Cron] Daily generator already running, skipping...');
    return;
  }

  isRunning = true;
  console.log('[Cron] Starting daily IELTS item generation...');

  try {
    // Check current active item count
    const activeCount = await IELTSItem.countDocuments({ isActive: true });
    const minItemsRequired = parseInt(process.env.MIN_IELTS_ITEMS || '50');
    
    console.log(`[Cron] Current active items: ${activeCount}, Required: ${minItemsRequired}`);

    if (activeCount < minItemsRequired) {
      const itemsToGenerate = minItemsRequired - activeCount;
      const itemsPerType = Math.ceil(itemsToGenerate / 4); // Distribute across 4 types
      
      const types = ['writing', 'reading', 'listening', 'speaking'];
      const generatedItems = [];

      for (const type of types) {
        for (let i = 0; i < itemsPerType; i++) {
          try {
            console.log(`[Cron] Generating ${type} item ${i + 1}/${itemsPerType}...`);
            const newItem = await generateIELTSItem(type);
            const savedItem = await IELTSItem.create(newItem);
            generatedItems.push(savedItem);
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`[Cron] Error generating ${type} item:`, error.message);
          }
        }
      }

      console.log(`[Cron] ✅ Generated ${generatedItems.length} new IELTS items`);
      return {
        success: true,
        generated: generatedItems.length,
        items: generatedItems
      };
    } else {
      console.log('[Cron] ✅ Sufficient items available, skipping generation');
      return {
        success: true,
        generated: 0,
        message: 'Sufficient items available'
      };
    }
  } catch (error) {
    console.error('[Cron] Error in daily generator:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    isRunning = false;
  }
}

/**
 * Initialize cron job
 */
function startDailyGenerator() {
  console.log(`[Cron] Scheduling daily generator with schedule: ${CRON_SCHEDULE}`);
  
  cron.schedule(CRON_SCHEDULE, async () => {
    await generateDailyItems();
  }, {
    scheduled: true,
    timezone: 'UTC'
  });

  console.log('[Cron] ✅ Daily generator cron job started');
  
  // Also run immediately on startup if in production (optional)
  if (process.env.RUN_GENERATOR_ON_STARTUP === 'true') {
    console.log('[Cron] Running initial generation on startup...');
    setTimeout(() => {
      generateDailyItems().catch(err => {
        console.error('[Cron] Error in startup generation:', err);
      });
    }, 5000); // Wait 5 seconds for server to fully start
  }
}

/**
 * Manual trigger (for testing or admin use)
 */
async function triggerManualGeneration() {
  return await generateDailyItems();
}

module.exports = {
  startDailyGenerator,
  generateDailyItems,
  triggerManualGeneration
};

