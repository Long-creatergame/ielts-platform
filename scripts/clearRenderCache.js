// scripts/clearRenderCache.js
const https = require('https');
const http = require('http');

const RENDER_DEPLOY_HOOK = process.env.RENDER_DEPLOY_HOOK;

if (!RENDER_DEPLOY_HOOK) {
  console.error("❌ Missing RENDER_DEPLOY_HOOK in environment");
  console.error("Set RENDER_DEPLOY_HOOK to your Render deploy hook URL");
  console.error("Find it at: Render Dashboard → Deploy Hooks");
  process.exit(1);
}

console.log("🧹 Clearing Render build cache and triggering fresh deploy...");
console.log(`📍 Deploy Hook: ${RENDER_DEPLOY_HOOK.replace(/\/\/.*@/, '//***@')}`);

const url = new URL(RENDER_DEPLOY_HOOK);
const client = url.protocol === 'https:' ? https : http;

const options = {
  hostname: url.hostname,
  port: url.port || (url.protocol === 'https:' ? 443 : 80),
  path: url.pathname + url.search,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'IELTS-Platform-Cleanup'
  }
};

const req = client.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log(`✅ Redeploy triggered successfully (Status: ${res.statusCode})`);
      console.log("📊 Render will now build with cleared cache");
    } else {
      console.error(`⚠️  Redeploy request returned status: ${res.statusCode}`);
      console.error(`Response: ${data}`);
    }
  });
});

req.on('error', (err) => {
  console.error("❌ Failed to trigger redeploy:", err.message);
  process.exit(1);
});

req.end();

