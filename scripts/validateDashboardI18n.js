const fs = require('fs');
const path = require('path');

const REQUIRED_KEYS = [
  'dashboard.testsCompleted',
  'dashboard.averageBand',
  'dashboard.streakDays',
  'dashboard.currentLevel',
  'dashboard.vsLastMonth'
];

const indexPath = path.join(__dirname, '..', 'client', 'src', 'i18n', 'index.js');
const content = fs.readFileSync(indexPath, 'utf8');

let allOk = true;

for (const key of REQUIRED_KEYS) {
  const occurrences = (content.match(new RegExp(key.replace('.', '\\.'), 'g')) || []).length;
  if (occurrences < 4) {
    console.error(`❌ Missing translations for key "${key}". Found ${occurrences}, expected >= 4 (en, vi, ja, ko).`);
    allOk = false;
  }
}

if (allOk) {
  console.log('✅ Dashboard I18N keys present for all locales (count-based check).');
  process.exit(0);
} else {
  process.exit(1);
}


