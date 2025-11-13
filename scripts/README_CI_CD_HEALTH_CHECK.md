# 🧠 Daily CI/CD Health Check Script

## Overview

This script automatically checks the health of your CI/CD pipeline by monitoring:
- ✅ Vercel deployment status
- ✅ Render service status  
- ✅ GitHub latest commit
- ✅ Backend health endpoint

## Setup

### 1. Install Dependencies

No additional dependencies required! The script uses Node.js built-in modules (`https`, `http`, `fs`).

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your API tokens:

```bash
cp .env.example .env
```

Required variables:
- `VERCEL_TOKEN` - Get from https://vercel.com/account/tokens
- `RENDER_API_KEY` - Get from https://dashboard.render.com/account/api-keys

Optional variables:
- `VERCEL_PROJECT_ID` - Defaults to `ielts-platform-two`
- `RENDER_SERVICE_ID` - Auto-detected if not set
- `GITHUB_TOKEN` - Optional, for higher rate limits

### 3. Run the Script

**Manual run:**
```bash
npm run health:check
# or
node scripts/ci_cd_health_check.js
```

**Scheduled run (cron):**
Add to your crontab:
```bash
0 7 * * * cd /path/to/ielts-platform && node scripts/ci_cd_health_check.js
```

## Output

The script generates `REPORT_CI_CD_STATUS.md` with:
- ✅ Deployment status for Vercel and Render
- ✅ Latest GitHub commit information
- ✅ Backend health status
- ⚠️ Warnings and errors (if any)

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
   - date: 14/11/2025, 06:30:15

✅ **Backend Health**: Healthy - DB Connected
   Details:
   - status: OK
   - database: Connected
   - timestamp: 2025-11-14T00:00:00.000Z

## 🚀 Auto-checks

- **Webhooks**: ✅ OK (auto-triggered)
- **Cron (IELTS Item Generator)**: ✅ Scheduled at 00:00 UTC daily
- **Database**: ✅ Connected
- **Performance**: ✅ Stable (<250ms response time)
```

## Exit Codes

- `0` - All checks passed
- `1` - Errors detected (check REPORT_CI_CD_STATUS.md)

## Troubleshooting

### Vercel Token Not Working

1. Verify token at https://vercel.com/account/tokens
2. Check token has correct permissions
3. Verify project name matches `ielts-platform-two`

### Render API Key Not Working

1. Verify API key at https://dashboard.render.com/account/api-keys
2. Check service ID if manually set
3. Verify service name contains "ielts" or "platform"

### GitHub Rate Limit

If you hit rate limits, add `GITHUB_TOKEN` to your `.env` file.

### Backend Health Check Failing

1. Verify backend URL is correct: `https://ielts-platform-emrv.onrender.com/api/health`
2. Check if backend is running
3. Verify network connectivity

## Integration with CI/CD

### GitHub Actions

Add to `.github/workflows/health-check.yml`:

```yaml
name: Daily Health Check

on:
  schedule:
    - cron: '0 7 * * *'  # 7 AM daily
  workflow_dispatch:  # Manual trigger

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm run health:check
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: health-report
          path: REPORT_CI_CD_STATUS.md
```

### Render Cron Job

Add to `render.yaml`:

```yaml
services:
  - type: cron
    name: health-check
    schedule: "0 7 * * *"
    buildCommand: "echo 'Health check'"
    startCommand: "node scripts/ci_cd_health_check.js"
    envVars:
      - key: VERCEL_TOKEN
        sync: false
      - key: RENDER_API_KEY
        sync: false
```

## Notes

- Script uses Node.js built-in modules (no external dependencies)
- All API calls have 10-second timeout
- Errors are caught and reported gracefully
- Report is always generated (even on errors)

## Support

For issues or questions, check:
- `REPORT_CI_CD_STATUS.md` for detailed error messages
- API documentation for Vercel/Render/GitHub
- Environment variable configuration in `.env.example`

