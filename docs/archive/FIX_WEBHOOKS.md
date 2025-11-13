# 🔧 Fix Webhooks Guide

## Issue

GitHub webhooks for Vercel or Render are missing or inactive.

## Solution

### Vercel Webhook

1. Go to Vercel Dashboard → Project Settings → Git
2. If repository not connected:
   - Click "Connect Git Repository"
   - Select: `Long-creatergame/ielts-platform`
   - Select branch: `main`
   - Enable "Auto Deploy"
3. This will automatically create the webhook

### Render Webhook

1. Go to Render Dashboard → Service Settings → Git
2. If repository not connected:
   - Click "Connect Repository"
   - Select: `Long-creatergame/ielts-platform`
   - Select branch: `main`
   - Enable "Auto Deploy"
3. This will automatically create the webhook

### Verify Webhooks

1. Go to GitHub → Repository → Settings → Webhooks
2. Look for:
   - Vercel webhook: URL contains `api.vercel.com`
   - Render webhook: URL contains `render.com`
3. Check "Recent Deliveries" tab
4. Verify last delivery status is `200 OK`
