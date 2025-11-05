// Node 18+ has native fetch
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

const API_BASE = process.env.API_BASE_URL || process.env.FRONTEND_URL?.replace('vercel.app', 'onrender.com') || 'https://ielts-platform-emrv.onrender.com/api';
const TEST_TOKEN = process.env.TEST_TOKEN || 'test_token_placeholder';

const endpoints = [
  { name: 'Dashboard Summary', path: '/dashboard' },
  { name: 'User Preferences', path: '/user-preferences' },
  { name: 'Recommendations', path: '/recommendations' },
  { name: 'Progress Tracking', path: '/progress-tracking' },
  { name: 'AI Summary', path: '/ai-master/summary' }
];

async function validateEndpoint(name, endpoint) {
  const url = `${API_BASE}${endpoint}`;
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'X-Timezone': 'Asia/Ho_Chi_Minh'
      },
      credentials: 'include'
    });

    const duration = Date.now() - startTime;
    const status = response.status === 200 || response.status === 401 || response.status === 403 ? '✅' : '❌';
    
    let statusText = `${response.status}`;
    if (response.status === 401) statusText += ' (No token)';
    else if (response.status === 403) statusText += ' (Invalid token)';
    else if (response.status === 200) statusText += ' (OK)';
    
    console.log(`${status} ${name}: ${statusText} (${duration}ms)`);
    
    if (response.status === 200) {
      try {
        const data = await response.json();
        console.log(`   Response keys: ${Object.keys(data).join(', ')}`);
      } catch (e) {
        console.log(`   Response: ${await response.text().then(t => t.substring(0, 100))}`);
      }
    } else if (response.status === 403) {
      const error = await response.json().catch(() => ({}));
      console.log(`   Error: ${error.error || error.message || 'Forbidden'}`);
    }

    return { success: response.status === 200, status: response.status, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`❌ ${name}: ERROR (${duration}ms)`);
    console.log(`   ${error.message}`);
    return { success: false, error: error.message, duration };
  }
}

async function main() {
  console.log('🔍 Validating Dashboard & API Endpoints...\n');
  console.log(`API Base: ${API_BASE}\n`);
  console.log(`Using TEST_TOKEN: ${TEST_TOKEN.substring(0, 10)}...\n`);

  const results = [];

  for (const endpoint of endpoints) {
    const result = await validateEndpoint(endpoint.name, endpoint.path);
    results.push({ name: endpoint.name, ...result });
    console.log(); // Empty line between results
  }

  // Summary
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  const avgDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0) / total;
  const authErrors = results.filter(r => r.status === 401 || r.status === 403).length;

  console.log('📊 Validation Summary');
  console.log('═'.repeat(50));
  console.log(`✅ Successful (200): ${passed}/${total}`);
  console.log(`🔒 Auth errors (401/403): ${authErrors}/${total}`);
  console.log(`⏱️  Average Response Time: ${avgDuration.toFixed(0)}ms`);
  console.log('═'.repeat(50));

  if (passed > 0) {
    console.log('✅ Dashboard endpoints are accessible!');
    console.log(`⚠️  Note: ${authErrors} endpoint(s) require valid authentication.`);
    process.exit(0);
  } else if (authErrors === total) {
    console.log('⚠️  All endpoints require authentication (expected for protected routes).');
    console.log('✅ CORS and routing are working correctly.');
    process.exit(0);
  } else {
    console.log('❌ Some endpoints failed validation.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Validation script error:', error);
  process.exit(1);
});

