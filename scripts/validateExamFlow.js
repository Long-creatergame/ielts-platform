// Node 18+ has native fetch, no need for node-fetch
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

const API_BASE = process.env.API_BASE_URL || 'http://localhost:4000/api';
const TEST_TOKEN = process.env.TEST_TOKEN || 'test_token_placeholder';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TEST_TOKEN}`
};

async function validateEndpoint(name, method, url, body = null) {
  const startTime = Date.now();
  try {
    const options = {
      method,
      headers
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const duration = Date.now() - startTime;
    const data = await response.json().catch(() => ({}));

    const status = response.status === 200 ? '✅' : '❌';
    console.log(`${status} ${name}: ${response.status} (${duration}ms)`);
    
    if (response.status !== 200) {
      console.log(`   Error: ${data.message || 'Unknown error'}`);
    }

    return { success: response.status === 200, status: response.status, duration, data };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`❌ ${name}: ERROR (${duration}ms)`);
    console.log(`   ${error.message}`);
    return { success: false, error: error.message, duration };
  }
}

async function main() {
  console.log('🔍 Validating Exam Flow Endpoints...\n');
  console.log(`API Base: ${API_BASE}\n`);

  const results = [];

  // 1. Test /api/exam/start
  console.log('1️⃣ Testing /api/exam/start');
  const startResult = await validateEndpoint(
    'POST /api/exam/start',
    'POST',
    `${API_BASE}/exam/start`,
    {
      mode: 'cambridge',
      skill: 'reading',
      setId: 'R1'
    }
  );
  results.push(startResult);
  
  const sessionId = startResult.data?.data?.sessionId || 'test_session_id';
  console.log(`   Session ID: ${sessionId}\n`);

  // 2. Test /api/exam/submit
  console.log('2️⃣ Testing /api/exam/submit');
  const submitResult = await validateEndpoint(
    'POST /api/exam/submit',
    'POST',
    `${API_BASE}/exam/submit`,
    {
      sessionId,
      skill: 'reading',
      answers: ['A', 'B', 'C', 'D']
    }
  );
  results.push(submitResult);
  console.log();

  // 3. Test /api/exam/result/:id
  console.log('3️⃣ Testing /api/exam/result/:id');
  const resultResult = await validateEndpoint(
    'GET /api/exam/result/:id',
    'GET',
    `${API_BASE}/exam/result/${sessionId}`
  );
  results.push(resultResult);
  console.log();

  // 4. Test /api/media/audio/:id
  console.log('4️⃣ Testing /api/media/audio/:id');
  const audioResult = await validateEndpoint(
    'GET /api/media/audio/:id',
    'GET',
    `${API_BASE}/media/audio/listening_section1.mp3`
  );
  results.push(audioResult);
  console.log();

  // 5. Test /api/media/image/:id
  console.log('5️⃣ Testing /api/media/image/:id');
  const imageResult = await validateEndpoint(
    'GET /api/media/image/:id',
    'GET',
    `${API_BASE}/media/image/task1_bar_chart.png`
  );
  results.push(imageResult);
  console.log();

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
    console.log('🎉 All endpoints validated successfully!');
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

