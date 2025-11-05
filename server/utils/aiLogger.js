const fs = require('fs');
const path = require('path');

// Use process.cwd() for production compatibility (Render/Vercel)
const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_PATH = path.join(LOG_DIR, 'ai_responses.log');

// Ensure logs directory exists (safe for production)
function ensureLogDir() {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
  } catch (error) {
    // Silently fail in production if logs directory can't be created
    console.warn('[AI Logger] Could not create logs directory:', error.message);
  }
}

// Initialize on module load
ensureLogDir();

/**
 * Save AI response to log file for audit trail
 */
async function saveAIResponseLog(type, input, output) {
  try {
    // Ensure directory exists before writing
    ensureLogDir();
    
    const entry = {
      type,
      timestamp: new Date().toISOString(),
      inputSummary: typeof input === 'string' 
        ? input.slice(0, 100) 
        : JSON.stringify(input).slice(0, 100),
      outputSummary: JSON.stringify(output).slice(0, 200)
    };

    fs.appendFileSync(LOG_PATH, JSON.stringify(entry) + '\n');
  } catch (error) {
    // Silent fail in production - don't break the app if logging fails
    console.warn('[AI Logger] Failed to log response:', error.message);
  }
}

module.exports = { saveAIResponseLog };

