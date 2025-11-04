// scripts/validateEnv.js
const fs = require("fs");
const dotenv = require("dotenv");
const path = require("path");

// Load .env file from server directory
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const requiredEnv = [
  "MONGO_URI", 
  "OPENAI_API_KEY", 
  "OPENAI_MODEL", 
  "SENDGRID_API_KEY",
  "STRIPE_SECRET_KEY", 
  "FRONTEND_URL", 
  "SYNC_MODE", 
  "SYNC_INTERVAL"
];

const missing = requiredEnv.filter(k => !process.env[k]);

if (missing.length) {
  console.error(`❌ Missing required environment variables:\n${missing.join("\n")}`);
  process.exit(1);
} else {
  console.log("✅ Environment validated successfully. All required variables are present.");
}

