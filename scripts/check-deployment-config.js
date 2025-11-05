#!/usr/bin/env node

/**
 * 🔍 Deployment Configuration Checker
 * Kiểm tra các config cần thiết cho Render và Vercel deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Deployment Configuration...\n');

// Check GitHub Secrets (manual check)
console.log('📋 GitHub Secrets cần thiết:');
console.log('  1. RENDER_API_KEY - Lấy từ Render Dashboard → Account Settings → API Keys');
console.log('  2. RENDER_SERVICE_ID - Lấy từ Render Dashboard → Service → Settings');
console.log('  3. VERCEL_TOKEN (optional) - Lấy từ Vercel Dashboard → Settings → Tokens\n');

// Check workflow file
const workflowPath = '.github/workflows/deploy-fixed.yml';
if (fs.existsSync(workflowPath)) {
  console.log('✅ Workflow file exists: deploy-fixed.yml');
  const content = fs.readFileSync(workflowPath, 'utf8');
  
  // Check Render API endpoint
  if (content.includes('api.render.com/v1/services')) {
    console.log('✅ Render API endpoint: v1 format (correct)');
  } else {
    console.log('❌ Render API endpoint: Not using v1 format');
  }
  
  // Check Vercel project link check
  if (content.includes('.vercel/project.json')) {
    console.log('✅ Vercel project link check: Added');
  } else {
    console.log('⚠️  Vercel project link check: Missing');
  }
} else {
  console.log('❌ Workflow file not found!');
}

console.log('\n');

// Check Vercel project link
const vercelPath = 'client/.vercel/project.json';
if (fs.existsSync(vercelPath)) {
  console.log('✅ Vercel project linked: .vercel/project.json exists');
  try {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
    console.log(`   Project ID: ${vercelConfig.projectId || 'N/A'}`);
  } catch (e) {
    console.log('   ⚠️  Could not parse project.json');
  }
} else {
  console.log('⚠️  Vercel project NOT linked: .vercel/project.json missing');
  console.log('   Run: cd client && npx vercel link');
}

console.log('\n');

// Check Render service ID in old workflow (for reference)
const oldWorkflowPath = '.github/workflows/deploy-old.yml';
if (fs.existsSync(oldWorkflowPath)) {
  const oldContent = fs.readFileSync(oldWorkflowPath, 'utf8');
  const serviceIdMatch = oldContent.match(/srv-[a-z0-9]+/);
  if (serviceIdMatch) {
    console.log('📝 Reference: Old workflow used Service ID:', serviceIdMatch[0]);
    console.log('   Make sure RENDER_SERVICE_ID secret matches this value');
  }
}

console.log('\n');
console.log('📝 Next Steps:');
console.log('  1. Check GitHub Secrets:');
console.log('     - Repository → Settings → Secrets and variables → Actions');
console.log('     - Verify RENDER_API_KEY and RENDER_SERVICE_ID exist');
console.log('\n  2. Check Vercel Integration:');
console.log('     - Vercel Dashboard → Project → Settings → Git');
console.log('     - Verify GitHub repo is connected');
console.log('     - Verify Root Directory = "client"');
console.log('     - Verify Production Branch = "main"');
console.log('\n  3. Check Render Webhook:');
console.log('     - Render Dashboard → Service → Settings → Webhooks');
console.log('     - Verify GitHub webhook is enabled');
console.log('\n  4. Test Render API manually:');
console.log('     curl -X POST "https://api.render.com/v1/services/{SERVICE_ID}/deploys" \\');
console.log('       -H "Authorization: Bearer {API_KEY}" \\');
console.log('       -H "Content-Type: application/json" \\');
console.log('       -d \'{}\'');

