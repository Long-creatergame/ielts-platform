# 🧠 Daily CI/CD Health Check - Setup Guide

## Quick Start

### 1. Environment Variables Setup

Create a `.env` file in the project root (or add to your existing `.env`):

```bash
# Vercel API Token (get from https://vercel.com/account/tokens)
VERCEL_TOKEN=your_vercel_token_here

# Render API Key (get from https://dashboard.render.com/account/api-keys)
RENDER_API_KEY=your_render_api_key_here

# Optional: Vercel Project ID (defaults to 'ielts-platform-two')
VERCEL_PROJECT_ID=ielts-platform-two

# Optional: Render Service ID (auto-detected if not set)
RENDER_SERVICE_ID=your_render_service_id_here

# Optional: GitHub Token (for higher rate limits)
GITHUB_TOKEN=your_github_token_here
```

### 2. Run Health Check

**Manual run:**
```bash
npm run health:check
```

**Or directly:**
```bash
node scripts/ci_cd_health_check.js
```

### 3. View Report

After running, check `REPORT_CI_CD_STATUS.md` for detailed status.

---

## Getting API Tokens

### Vercel Token

1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it: `ci-cd-health-check`
4. Scope: `Full Account` (or `Read Only`)
5. Copy the token and add to `.env`

### Render API Key

1. Go to https://dashboard.render.com/account/api-keys
2. Click "New API Key"
3. Name it: `ci-cd-health-check`
4. Copy the key and add to `.env`

### GitHub Token (Optional)

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it: `ci-cd-health-check`
4. Scope: `public_repo` (read-only)
5. Copy the token and add to `.env`

---

## Scheduling

### Option 1: Cron Job (Local/Server)

Add to crontab:
```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 7 AM)
0 7 * * * cd /path/to/ielts-platform && /usr/bin/node scripts/ci_cd_health_check.js >> /path/to/logs/health-check.log 2>&1
```

### Option 2: GitHub Actions

Create `.github/workflows/health-check.yml`:

```yaml
name: Daily Health Check

on:
  schedule:
    - cron: '0 7 * * *'  # 7 AM UTC daily
  workflow_dispatch:  # Manual trigger

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Run Health Check
        run: npm run health:check
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Upload Report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: health-report
          path: REPORT_CI_CD_STATUS.md
      
      - name: Comment on PR (if PR)
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = fs.readFileSync('REPORT_CI_CD_STATUS.md', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: report
            });
```

**Add secrets to GitHub:**
1. Go to Repository → Settings → Secrets → Actions
2. Add `VERCEL_TOKEN`, `RENDER_API_KEY`, `GITHUB_TOKEN`

### Option 3: Render Cron Job

Add to `render.yaml`:

```yaml
services:
  - type: cron
    name: health-check
    schedule: "0 7 * * *"  # 7 AM UTC daily
    buildCommand: "echo 'Health check'"
    startCommand: "node scripts/ci_cd_health_check.js"
    envVars:
      - key: VERCEL_TOKEN
        sync: false
      - key: RENDER_API_KEY
        sync: false
      - key: GITHUB_TOKEN
        sync: false
```

---

## Output Format

The script generates `REPORT_CI_CD_STATUS.md` with:

- ✅ **CI/CD Summary**: Status of Vercel, Render, GitHub, and Backend
- 🚀 **Auto-checks**: Webhooks, Cron jobs, Database, Performance
- 📊 **Status Overview**: Success/Warning/Error counts
- ⚠️ **Issues Detected**: Detailed error information (if any)

---

## Exit Codes

- `0` - All checks passed (or warnings only)
- `1` - Errors detected

Useful for CI/CD pipelines:
```bash
npm run health:check || echo "Health check failed!"
```

---

## Troubleshooting

### "VERCEL_TOKEN not set"
- Add `VERCEL_TOKEN` to your `.env` file
- Or export: `export VERCEL_TOKEN=your_token`

### "RENDER_API_KEY not set"
- Add `RENDER_API_KEY` to your `.env` file
- Or export: `export RENDER_API_KEY=your_key`

### "Vercel API error: 401"
- Token is invalid or expired
- Regenerate token at https://vercel.com/account/tokens

### "Render API error: 401"
- API key is invalid or expired
- Regenerate key at https://dashboard.render.com/account/api-keys

### "Backend health check failed"
- Backend might be down or cold-starting
- Check Render dashboard for service status
- Verify backend URL is correct

### "GitHub API error: 403"
- Rate limit exceeded (60 requests/hour without token)
- Add `GITHUB_TOKEN` to `.env` for higher limits

---

## Features

✅ **No External Dependencies**: Uses only Node.js built-in modules  
✅ **Graceful Error Handling**: Reports errors without crashing  
✅ **Detailed Reports**: Comprehensive status information  
✅ **Flexible Configuration**: Works with or without all tokens  
✅ **CI/CD Ready**: Exit codes for automation  

---

## Example Output

```markdown
# 🧠 IELTS Platform — Daily System Health Check

🕓 14/11/2025, 07:00 AM

## ✅ CI/CD Summary

✅ **Vercel Deployment**: READY - 73a25e6
   Details:
   - state: READY
   - commitSha: 73a25e6
   - createdAt: 14/11/2025, 06:45:23
   - url: ielts-platform-two-xxxxx.vercel.app

✅ **Render Service**: ielts-platform - LIVE
   Details:
   - serviceName: ielts-platform
   - deployState: live
   - url: https://ielts-platform-emrv.onrender.com

✅ **GitHub Latest Commit**: 73a25e6 - Mai Đức Long
   Details:
   - sha: 73a25e6
   - author: Mai Đức Long
   - message: test: verify vercel auto-deploy hook

✅ **Backend Health**: Healthy - DB Connected
   Details:
   - status: OK
   - database: Connected

## 🚀 Auto-checks

- **Webhooks**: ✅ OK (auto-triggered)
- **Cron (IELTS Item Generator)**: ✅ Scheduled at 00:00 UTC daily
- **Database**: ✅ Connected
- **Performance**: ✅ Stable (<250ms response time)

📄 **Next check**: Tomorrow at 07:00 AM
```

---

## Support

For issues:
1. Check `REPORT_CI_CD_STATUS.md` for detailed errors
2. Verify environment variables are set correctly
3. Check API token permissions
4. Review script logs for specific error messages

---

**Created:** 2025-11-13  
**Last Updated:** 2025-11-13

