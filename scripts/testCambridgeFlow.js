// scripts/testCambridgeFlow.js
// Simulate end-to-end Cambridge test flow using Node 18+ global fetch
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const API = process.env.API_BASE_URL || 'https://ielts-platform-emrv.onrender.com';
const TOKEN = process.env.TEST_TOKEN || 'test_token_placeholder';
const headers = { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

const LOG_DIR = path.join(process.cwd(), 'logs', 'simulation');
const LOG_FILE = path.join(LOG_DIR, 'cambridge-test-flow.log');

function log(line) {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} ${line}\n`);
  console.log(line);
}

async function httpGet(url) {
  const res = await fetch(url, { headers });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch (_) { json = { raw: text }; }
  return { ok: res.ok, status: res.status, data: json };
}

async function httpPost(url, body) {
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch (_) { json = { raw: text }; }
  return { ok: res.ok, status: res.status, data: json };
}

async function simulateSkill(skill, setId, responses) {
  try {
    log(`🧩 Starting ${skill.toUpperCase()} test simulation...`);
    const test = await httpGet(`${API}/api/cambridge/test/${skill}/${setId}`);
    if (!test.ok) throw new Error(`Load dataset failed (${test.status})`);
    log(`✅ Loaded ${skill} dataset setId=${setId}`);

    const submission = await httpPost(`${API}/api/assessment/evaluate`, {
      skill,
      responses,
      setId,
      userId: 'simulation_user'
    });

    const band = submission.data?.band || submission.data?.data?.band || null;
    log(`🎯 ${skill} AI Band: ${band ?? 'N/A'}`);
    return {
      skill,
      band,
      feedback: submission.data?.feedback || submission.data?.data?.feedback || null
    };
  } catch (err) {
    log(`❌ Error simulating ${skill}: ${err.message}`);
    return null;
  }
}

async function runSimulation() {
  log('🚀 Running Cambridge Real User Simulation Flow...');

  const skills = [
    { skill: 'reading', setId: 'R1', responses: ['A', 'C', 'B', 'D'] },
    { skill: 'listening', setId: 'L1', responses: ['London', 'Paris', 'New York'] },
    { skill: 'writing', setId: 'W1', responses: ['The chart shows...', 'In my opinion, public transport...'] },
    { skill: 'speaking', setId: 'S1', responses: ['I come from Hanoi', 'I love reading books', 'Yes, definitely.'] }
  ];

  const results = [];
  for (const item of skills) {
    const r = await simulateSkill(item.skill, item.setId, item.responses);
    if (r) results.push(r);
  }

  log('\n📊 Cambridge Test Summary:');
  for (const r of results) {
    const feedback = r.feedback ? String(r.feedback).slice(0, 60) + '...' : 'N/A';
    log(` - ${r.skill}: band=${r.band ?? 'N/A'} feedback=${feedback}`);
  }

  log('\n🧠 Generating learning path based on AI feedback...');
  const learning = await httpPost(`${API}/api/learningpath/generate`, {
    userId: 'simulation_user',
    results
  });
  if (learning.ok) {
    log(`✅ Learning Path Generated`);
  } else {
    log(`⚠️ Learning Path generation returned status ${learning.status}`);
  }

  log('\n✨ Simulation complete! Cambridge pipeline verification attempted.');
}

runSimulation().catch((e) => {
  log(`❌ Simulation error: ${e.message}`);
  process.exit(1);
});


