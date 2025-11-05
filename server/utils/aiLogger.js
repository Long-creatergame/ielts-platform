const fs = require('fs');
const path = require('path');

const LOG_DIR = path.resolve('logs');
const LOG_PATH = path.join(LOG_DIR, 'ai_responses.log');

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Save AI response to log file for audit trail
 */
async function saveAIResponseLog(type, input, output) {
  try {
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
    console.warn('[AI Logger] Failed to log response:', error.message);
  }
}

module.exports = { saveAIResponseLog };

