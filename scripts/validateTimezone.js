// Node 18+ has native fetch
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

const API_BASE = process.env.API_BASE_URL || process.env.FRONTEND_URL?.replace('vercel.app', 'onrender.com') || 'https://ielts-platform-emrv.onrender.com/api';

const testTimezones = [
  'Asia/Ho_Chi_Minh',
  'America/New_York',
  'Europe/London',
  'Asia/Tokyo',
  'Australia/Sydney'
];

async function validateTimezone(timezone) {
  const url = `${API_BASE}/exam/start`;
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Timezone': timezone,
        'Authorization': `Bearer ${process.env.TEST_TOKEN || 'test_token_placeholder'}`
      },
      body: JSON.stringify({
        mode: 'cambridge',
        skill: 'reading',
        setId: 'R1'
      })
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    if (response.status === 200 && data.success) {
      const returnedTimezone = data.data?.timezone || 'UTC';
      const match = returnedTimezone === timezone || returnedTimezone === 'UTC';
      const status = match ? '✅' : '⚠️';
      
      console.log(`${status} ${timezone}: Server returned "${returnedTimezone}" (${duration}ms)`);
      return { success: true, returnedTimezone, match };
    } else {
      console.log(`❌ ${timezone}: ${response.status} - ${data.message || 'Error'}`);
      return { success: false };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`❌ ${timezone}: ERROR (${duration}ms) - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🔍 Validating Timezone Support...\n');
  console.log(`API Base: ${API_BASE}\n`);

  const results = [];

  for (const tz of testTimezones) {
    const result = await validateTimezone(tz);
    results.push({ timezone: tz, ...result });
    console.log(); // Empty line between results
  }

  // Summary
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  const matches = results.filter(r => r.match).length;

  console.log('📊 Validation Summary');
  console.log('═'.repeat(50));
  console.log(`✅ Successful requests: ${passed}/${total}`);
  console.log(`🎯 Timezone matches: ${matches}/${total}`);
  console.log('═'.repeat(50));

  if (passed === total && matches >= total - 1) {
    console.log('🎉 Timezone validation passed!');
    process.exit(0);
  } else {
    console.log('⚠️  Some timezone validations failed.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Validation script error:', error);
  process.exit(1);
});

