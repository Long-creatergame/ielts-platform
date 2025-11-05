// Node 18+ has native fetch
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

const API_BASE = process.env.API_BASE_URL || process.env.FRONTEND_URL?.replace('vercel.app', 'onrender.com') || 'https://ielts-platform-emrv.onrender.com/api';
const TEST_TOKEN = process.env.TEST_TOKEN || 'test_token_placeholder';

// Test timezones
const timezonesToTest = [
  'Asia/Ho_Chi_Minh',
  'America/New_York',
  'Europe/London',
  'Asia/Tokyo',
  'Australia/Sydney'
];

async function validateTimezoneEndpoint(endpoint, timezone, token) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Timezone': timezone
      },
      credentials: 'include'
    });

    if (response.status === 200) {
      const data = await response.json();
      return { success: true, data, status: response.status };
    } else if (response.status === 401 || response.status === 403) {
      return { success: false, error: 'Auth error', status: response.status };
    } else {
      const errorText = await response.text();
      return { success: false, error: errorText, status: response.status };
    }
  } catch (error) {
    return { success: false, error: error.message, status: 0 };
  }
}

async function main() {
  console.log('🌍 Validating Timezone Propagation & Local Time Display\n');
  console.log(`API Base: ${API_BASE}\n`);

  // Test 1: /api/tests/mine
  console.log('📋 Test 1: /api/tests/mine (User Test History)\n');
  for (const tz of timezonesToTest) {
    console.log(`  Testing with timezone: ${tz}`);
    const result = await validateTimezoneEndpoint('/tests/mine', tz, TEST_TOKEN);
    
    if (result.success && result.data) {
      const tests = result.data.data || result.data.tests || [];
      if (tests.length > 0) {
        const firstTest = tests[0];
        console.log(`    ✅ Response received`);
        console.log(`    📅 Local dateTaken: ${firstTest.localDateTaken || 'N/A'}`);
        console.log(`    📅 Local createdAt: ${firstTest.localCreatedAt || 'N/A'}`);
        console.log(`    🌍 Timezone: ${firstTest.timezone || result.data.timezone || tz}`);
      } else {
        console.log(`    ⚠️  No tests found (expected for new users)`);
      }
    } else {
      console.log(`    ❌ Failed: ${result.error || 'Unknown error'} (Status: ${result.status})`);
    }
    console.log();
  }

  // Test 2: /api/exam (list sessions)
  console.log('📋 Test 2: /api/exam (List Exam Sessions)\n');
  for (const tz of timezonesToTest) {
    console.log(`  Testing with timezone: ${tz}`);
    const result = await validateTimezoneEndpoint('/exam', tz, TEST_TOKEN);
    
    if (result.success && Array.isArray(result.data)) {
      const sessions = result.data;
      if (sessions.length > 0) {
        const firstSession = sessions[0];
        console.log(`    ✅ Response received (${sessions.length} sessions)`);
        console.log(`    📅 Local startTime: ${firstSession.localStartTime || 'N/A'}`);
        console.log(`    📅 Local endTime: ${firstSession.localEndTime || 'N/A'}`);
        console.log(`    📅 Local createdAt: ${firstSession.localCreatedAt || 'N/A'}`);
        console.log(`    🌍 Timezone: ${firstSession.timezone || tz}`);
      } else {
        console.log(`    ⚠️  No sessions found (expected for new users)`);
      }
    } else {
      console.log(`    ❌ Failed: ${result.error || 'Unknown error'} (Status: ${result.status})`);
    }
    console.log();
  }

  // Test 3: Format validation
  console.log('📋 Test 3: Time Format Validation\n');
  const testDate = new Date('2025-11-05T13:45:00Z'); // UTC time
  console.log(`  Test UTC timestamp: ${testDate.toISOString()}`);
  
  for (const tz of timezonesToTest) {
    const localTime = testDate.toLocaleString('en-US', {
      timeZone: tz,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    console.log(`  ${tz}: ${localTime}`);
  }

  console.log('\n✅ Timezone validation complete!');
  console.log('\n📊 Summary:');
  console.log('  - All endpoints should return local time fields (localDateTaken, localEndTime, etc.)');
  console.log('  - Timezone should be included in response (timezone field)');
  console.log('  - Format should be DD/MM/YYYY, HH:mm (24-hour format)');
  console.log('  - Frontend should display relative time (vừa xong, 15 phút trước, etc.)');
}

main().catch(error => {
  console.error('❌ Validation script error:', error);
  process.exit(1);
});

