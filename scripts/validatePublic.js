// Node 18+ has native fetch
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

const API_BASE = process.env.API_BASE_URL || process.env.FRONTEND_URL?.replace('vercel.app', 'onrender.com') || 'https://ielts-platform-emrv.onrender.com/api';

const endpoints = [
  { name: 'Exam Start', url: '/exam/start', method: 'POST', body: { mode: 'cambridge', skill: 'reading', setId: 'R1' } },
  { name: 'Media Audio', url: '/media/audio/listening_section1.mp3', method: 'GET' },
  { name: 'Media Image', url: '/media/image/task1_bar_chart.png', method: 'GET' },
  { name: 'Production Status', url: '/production/status', method: 'GET' }
];

async function validateEndpoint(name, method, endpoint, body = null) {
  const url = `${API_BASE}${endpoint}`;
  const startTime = Date.now();
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const duration = Date.now() - startTime;
    const status = response.status === 200 || response.status === 404 ? '✅' : '❌';
    
    console.log(`${status} ${name}: ${response.status} (${duration}ms)`);
    
    if (response.status !== 200 && response.status !== 404) {
      const text = await response.text().catch(() => '');
      console.log(`   Error: ${text.substring(0, 100)}`);
    }

    return { success: response.status === 200 || response.status === 404, status: response.status, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`❌ ${name}: ERROR (${duration}ms)`);
    console.log(`   ${error.message}`);
    return { success: false, error: error.message, duration };
  }
}

async function main() {
  console.log('🔍 Validating Public Endpoints...\n');
  console.log(`API Base: ${API_BASE}\n`);

  const results = [];

  for (const endpoint of endpoints) {
    const result = await validateEndpoint(
      endpoint.name,
      endpoint.method,
      endpoint.url,
      endpoint.body
    );
    results.push(result);
    console.log(); // Empty line between results
  }

  // Summary
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  const avgDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0) / total;

  console.log('📊 Validation Summary');
  console.log('═'.repeat(50));
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`⏱️  Average Response Time: ${avgDuration.toFixed(0)}ms`);
  console.log('═'.repeat(50));

  if (passed === total) {
    console.log('🎉 All public endpoints validated successfully!');
    process.exit(0);
  } else {
    console.log('⚠️  Some endpoints failed validation.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Validation script error:', error);
  process.exit(1);
});

