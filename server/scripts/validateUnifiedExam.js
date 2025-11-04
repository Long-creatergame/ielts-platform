// Phase 2.15.R.1 – Validation & Live Testing Audit
// Kiểm tra unified exam engine (production) using Node18+ fetch (no axios dep)
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const BASE_URL = process.env.API_BASE_URL || 'https://ielts-platform-emrv.onrender.com';
const TEST_TOKEN = process.env.TEST_TOKEN || '';
const LOG_DIR = path.join(__dirname, '..', '..', 'logs', 'validation');
const LOG_FILE = path.join(LOG_DIR, 'unified-exam-audit.log');

const headers = { 'Authorization': TEST_TOKEN, 'Content-Type': 'application/json' };
const skills = ['listening', 'reading', 'writing', 'speaking'];
const modes = ['cambridge', 'practice'];

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
}

async function log(msg) {
  ensureLogDir();
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  process.stdout.write(msg + '\n');
  fs.appendFileSync(LOG_FILE, line);
}

async function httpGet(url) {
  const res = await fetch(url, { headers });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { ok: res.ok, status: res.status, data: json };
}

async function httpPost(url, body) {
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body || {}) });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { ok: res.ok, status: res.status, data: json };
}

async function testStart(mode, skill) {
  // Backend expects POST; still log as Start test
  const res = await httpPost(`${BASE_URL}/api/exam/start`, { mode, skill });
  if (!res.ok) throw new Error(`/start ${mode}/${skill} → ${res.status}`);
  await log(`✅ Start OK: ${mode}/${skill} → ${res.status}`);
  return res.data;
}

async function testSubmit(mode, skill, sessionId) {
  const body = { sessionId, answers: ['A', 'B', 'C'], feedbackRequest: skill === 'writing' || skill === 'speaking' };
  const res = await httpPost(`${BASE_URL}/api/exam/submit`, body);
  if (!res.ok) throw new Error(`/submit ${mode}/${skill} → ${res.status}`);
  await log(`✅ Submit OK: ${mode}/${skill} → ${res.status}`);
  return res.data;
}

async function testResult(sessionId) {
  const res = await httpGet(`${BASE_URL}/api/exam/result/${sessionId}`);
  if (!res.ok) throw new Error(`/result ${sessionId} → ${res.status}`);
  await log(`✅ Result OK: session ${sessionId} → ${res.status}`);
  return res.data;
}

async function main() {
  await log('🚀 Starting Unified Exam Validation Audit...');
  let startPass = 0, submitPass = 0, resultPass = 0;
  let missingFeedback = 0;

  for (const mode of modes) {
    for (const skill of skills) {
      try {
        const start = await testStart(mode, skill);
        const sessionId = start?.data?.sessionId || start?.sessionId;
        if (!sessionId) throw new Error('❌ No sessionId returned');
        startPass++;
        await new Promise(r => setTimeout(r, 1200));
        const submitted = await testSubmit(mode, skill, sessionId);
        submitPass++;
        const result = await testResult(sessionId);
        resultPass++;
        const bandScores = result?.data?.bandScores || result?.bandScores;
        const hasFeedback = !!(submitted?.data?.feedback || submitted?.feedback);
        if (!hasFeedback && (skill === 'writing' || skill === 'speaking')) missingFeedback++;
        if (bandScores) await log(`🏆 Band Detected: ${JSON.stringify(bandScores)}`);
        else await log(`⚠️ Missing band scores for ${mode}/${skill}`);
      } catch (err) {
        await log(`❌ Error: ${mode}/${skill} → ${err.message}`);
      }
    }
  }

  await log('-------------------------------------------------');
  await log('Phase 2.15.R.1 – Unified Exam Validation Results');
  await log(`API Test Results:`);
  await log(`✅ /api/exam/start – ${startPass} passed (expected 8)`);
  await log(`✅ /api/exam/submit – ${submitPass} passed (expected 8)`);
  await log(`✅ /api/exam/result – ${resultPass} passed (expected 8)`);
  if (missingFeedback) await log(`⚠️ ${missingFeedback} feedbacks missing (Writing/Speaking)`);
  await log('Overall Result: See details above');
  await log('-------------------------------------------------');
  await log(`Log file saved at: ${LOG_FILE}`);
}

main().catch(async (err) => {
  await log(`❌ Critical failure: ${err.message}`);
  process.exit(1);
});


