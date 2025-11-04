const fs = require('fs');
const path = require('path');

function checkEnvVars() {
  const required = ['OPENAI_API_KEY', 'MONGO_URI'];
  const optional = ['STRIPE_SECRET_KEY', 'SENDGRID_API_KEY'];
  const missing = [];
  const warnings = [];

  required.forEach((key) => {
    if (!process.env[key]) missing.push(key);
  });

  optional.forEach((key) => {
    if (!process.env[key]) warnings.push(key);
  });

  return { missing, warnings };
}

function checkDataset() {
  const datasetPath = path.join(__dirname, '../data/cambridge');
  const files = ['readingCambridge.json', 'listeningCambridge.json', 'writingCambridge.json', 'speakingCambridge.json'];
  const missing = [];

  files.forEach((file) => {
    const filePath = path.join(datasetPath, file);
    if (!fs.existsSync(filePath)) {
      missing.push(file);
    }
  });

  return { missing, exists: files.length - missing.length };
}

function systemCheck() {
  const envCheck = checkEnvVars();
  const datasetCheck = checkDataset();

  const report = {
    timestamp: new Date().toISOString(),
    env: {
      missing: envCheck.missing,
      warnings: envCheck.warnings,
      status: envCheck.missing.length === 0 ? 'OK' : 'FAILED'
    },
    dataset: {
      missing: datasetCheck.missing,
      exists: datasetCheck.exists,
      status: datasetCheck.missing.length === 0 ? 'OK' : 'WARNING'
    },
    overall: envCheck.missing.length === 0 ? 'OK' : 'FAILED'
  };

  console.log('[SystemCheck]', JSON.stringify(report, null, 2));
  return report;
}

module.exports = { systemCheck, checkEnvVars, checkDataset };

