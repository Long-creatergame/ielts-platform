// scripts/autoSyncEnv.js
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const TEMPLATE_PATH = path.join(__dirname, "..", "env.template.json");
const LOG_PATH = path.join(__dirname, "..", "logs", "env-sync.log");
const BACKEND_ENV_PATH = path.join(__dirname, "..", "server", ".env");
const FRONTEND_ENV_PATH = path.join(__dirname, "..", "client", ".env.local");

// Load environment files
const backendEnv = dotenv.config({ path: BACKEND_ENV_PATH }).parsed || {};
const frontendEnv = dotenv.config({ path: FRONTEND_ENV_PATH }).parsed || {};

// Merge backend and frontend envs
const allEnvs = { ...backendEnv, ...frontendEnv };

// Ensure logs directory exists
const logsDir = path.dirname(LOG_PATH);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

async function syncRender(envs) {
  const RENDER_API_KEY = process.env.RENDER_API_KEY;
  const SERVICE_ID = process.env.RENDER_SERVICE_ID;
  
  if (!RENDER_API_KEY || !SERVICE_ID) {
    throw new Error("Missing Render API credentials. Set RENDER_API_KEY and RENDER_SERVICE_ID.");
  }

  console.log("🌐 Syncing with Render...");
  let successCount = 0;
  let errorCount = 0;

  for (const key of envs) {
    const value = allEnvs[key];
    if (!value) {
      console.warn(`⚠️  Skipping ${key}: value not found in .env files`);
      continue;
    }

    try {
      // Check if env var already exists
      const checkResponse = await fetch(
        `https://api.render.com/v1/services/${SERVICE_ID}/env-vars`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${RENDER_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!checkResponse.ok) {
        throw new Error(`Failed to fetch existing env vars: ${checkResponse.statusText}`);
      }

      const existing = await checkResponse.json();
      const existingVar = existing.find(env => env.key === key);

      let response;
      if (existingVar) {
        // Update existing env var
        response = await fetch(
          `https://api.render.com/v1/services/${SERVICE_ID}/env-vars/${existingVar.id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${RENDER_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ value })
          }
        );
      } else {
        // Create new env var
        response = await fetch(
          `https://api.render.com/v1/services/${SERVICE_ID}/env-vars`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RENDER_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ key, value })
          }
        );
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to sync ${key}: ${response.statusText} - ${errorText}`);
      }

      successCount++;
      console.log(`  ✅ ${key}`);
    } catch (error) {
      errorCount++;
      console.error(`  ❌ ${key}: ${error.message}`);
    }
  }

  console.log(`✅ Render environment sync completed. (${successCount} success, ${errorCount} errors)`);
  return { successCount, errorCount };
}

async function syncVercel(envs) {
  const TOKEN = process.env.VERCEL_API_TOKEN;
  const PROJECT_ID = process.env.VERCEL_PROJECT_ID;
  const TEAM_ID = process.env.VERCEL_TEAM_ID;

  if (!TOKEN || !PROJECT_ID) {
    throw new Error("Missing Vercel API credentials. Set VERCEL_API_TOKEN and VERCEL_PROJECT_ID.");
  }

  console.log("🌐 Syncing with Vercel...");
  let successCount = 0;
  let errorCount = 0;

  const baseUrl = TEAM_ID
    ? `https://api.vercel.com/v9/projects/${PROJECT_ID}/env`
    : `https://api.vercel.com/v9/projects/${PROJECT_ID}/env`;
  
  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json"
  };

  if (TEAM_ID) {
    headers["x-vercel-team-id"] = TEAM_ID;
  }

  for (const key of envs) {
    const value = allEnvs[key];
    if (!value) {
      console.warn(`⚠️  Skipping ${key}: value not found in .env files`);
      continue;
    }

    try {
      // Check if env var already exists
      const checkUrl = TEAM_ID
        ? `${baseUrl}?teamId=${TEAM_ID}`
        : baseUrl;
      
      const checkResponse = await fetch(checkUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          ...(TEAM_ID && { "x-vercel-team-id": TEAM_ID })
        }
      });

      if (!checkResponse.ok) {
        throw new Error(`Failed to fetch existing env vars: ${checkResponse.statusText}`);
      }

      const existing = await checkResponse.json();
      const existingVar = existing.envs?.find(env => env.key === key);

      let response;
      if (existingVar) {
        // Update existing env var
        const updateUrl = TEAM_ID
          ? `${baseUrl}/${existingVar.id}?teamId=${TEAM_ID}`
          : `${baseUrl}/${existingVar.id}`;
        
        response = await fetch(updateUrl, {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            value,
            target: ["production"],
            type: "encrypted"
          })
        });
      } else {
        // Create new env var
        const createUrl = TEAM_ID
          ? `${baseUrl}?teamId=${TEAM_ID}`
          : baseUrl;
        
        response = await fetch(createUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({
            key,
            value,
            target: ["production"],
            type: "encrypted"
          })
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to sync ${key}: ${response.statusText} - ${errorText}`);
      }

      successCount++;
      console.log(`  ✅ ${key}`);
    } catch (error) {
      errorCount++;
      console.error(`  ❌ ${key}: ${error.message}`);
    }
  }

  console.log(`✅ Vercel environment sync completed. (${successCount} success, ${errorCount} errors)`);
  return { successCount, errorCount };
}

async function main() {
  const timestamp = new Date().toISOString();
  
  console.log("\n🚀 Starting environment variable sync...\n");

  if (!fs.existsSync(TEMPLATE_PATH)) {
    const error = `Template file not found: ${TEMPLATE_PATH}`;
    fs.appendFileSync(LOG_PATH, `[${timestamp}] ${error} ❌\n`);
    console.error(`❌ ${error}`);
    process.exit(1);
  }

  const template = JSON.parse(fs.readFileSync(TEMPLATE_PATH, "utf-8"));
  const renderEnvs = template.render || [];
  const vercelEnvs = template.vercel || [];

  try {
    const renderResult = await syncRender(renderEnvs);
    console.log(); // Empty line for spacing
    const vercelResult = await syncVercel(vercelEnvs);

    const totalSuccess = renderResult.successCount + vercelResult.successCount;
    const totalErrors = renderResult.errorCount + vercelResult.errorCount;

    const logMessage = `[${timestamp}] Sync completed: ${totalSuccess} success, ${totalErrors} errors ✅\n`;
    fs.appendFileSync(LOG_PATH, logMessage);
    
    console.log("\n🎯 All environment variables synchronized successfully.\n");
    console.log(`📊 Summary: ${totalSuccess} variables synced, ${totalErrors} errors\n`);
    
    if (totalErrors > 0) {
      process.exit(1);
    }
  } catch (err) {
    const errorMessage = `[${timestamp}] Sync failed ❌: ${err.message}\n`;
    fs.appendFileSync(LOG_PATH, errorMessage);
    console.error("\n❌ Environment sync failed:", err.message);
    process.exit(1);
  }
}

main();

