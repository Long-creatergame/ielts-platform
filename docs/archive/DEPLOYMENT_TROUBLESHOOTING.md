# 🚨 Deployment Troubleshooting Guide - Vercel & Render

## ❌ Vấn Đề Hiện Tại

1. **Vercel không cập nhật bản mới** - Commit mới đã push nhưng Vercel không deploy
2. **Render deployment fail** - Build fail khi deploy lên Render
3. **GitHub Actions thành công** - CI/CD pipeline chạy OK

## 🔍 Nguyên Nhân

### Vercel Không Deploy:
- Auto-deploy có thể bị tắt
- Webhook từ GitHub không hoạt động
- Có thể cần manual trigger
- Root directory có thể không đúng

### Render Deployment Fail:
- Build command có thể thiếu dependencies
- Start command có thể không đúng
- Environment variables có thể thiếu
- Health check có thể fail

## ✅ Giải Pháp Chi Tiết

### 1. Fix Vercel Deployment

#### Bước 1: Kiểm tra Vercel Dashboard

1. Vào https://vercel.com/dashboard
2. Click vào project **"ielts-platform-two"**
3. Vào **Settings** → **Git**
4. Kiểm tra:
   - ✅ **Production Branch**: `main`
   - ✅ **Auto Deploy**: Enabled
   - ✅ **Webhook URL**: Có URL từ GitHub

#### Bước 2: Manual Trigger Deploy

1. Vào **Deployments** tab
2. Click **"Redeploy"** trên deployment mới nhất
3. Chọn **"Use existing Build Cache"** = **OFF**
4. Click **"Redeploy"**
5. Đợi build hoàn thành (1-3 phút)

#### Bước 3: Kiểm tra Build Logs

1. Click vào deployment mới
2. Xem **Build Logs**
3. Kiểm tra errors:
   - Missing dependencies
   - Build errors
   - Environment variables
   - Root directory issues

#### Bước 4: Verify Settings

**Vercel Project Settings:**
```
Framework Preset: Vite
Root Directory: client
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

**Environment Variables:**
```
VITE_API_BASE_URL=https://ielts-platform-emrv.onrender.com
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### 2. Fix Render Deployment

#### Bước 1: Kiểm tra Render Dashboard

1. Vào https://dashboard.render.com
2. Click vào service **"ielts-platform"**
3. Kiểm tra **Settings**:
   - ✅ **Build Command**: `cd server && npm install --production=false`
   - ✅ **Start Command**: `cd server && node index.js`
   - ✅ **Health Check Path**: `/api/health`

#### Bước 2: Manual Redeploy với Clear Cache

1. Click **"Manual Deploy"** button
2. Chọn **"Clear Build Cache & Deploy"**
3. Click **"Deploy"**
4. Đợi deployment hoàn thành (3-5 phút)

#### Bước 3: Kiểm tra Build Logs

1. Xem **Logs** tab trong Render dashboard
2. Tìm errors:
   - `npm install` errors
   - Missing dependencies
   - Syntax errors
   - Environment variables missing

#### Bước 4: Verify Environment Variables

**Required Environment Variables:**
```
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
OPENAI_API_KEY=...
FRONTEND_URL=https://ielts-platform-two.vercel.app
```

#### Bước 5: Test Health Check

```bash
# Test health endpoint
curl https://ielts-platform-emrv.onrender.com/api/health

# Expected response:
# {"ok":true,"status":"OK","timestamp":"...","database":{...}}
```

### 3. Kiểm tra render.yaml

**File đã được cập nhật với:**
- ✅ `buildCommand: cd server && npm install --production=false`
- ✅ `startCommand: cd server && node index.js`
- ✅ `healthCheckPath: /api/health`
- ✅ `FRONTEND_URL` environment variable
- ✅ `region: singapore` và `plan: free`

## 🚀 Quick Fix Commands

### Force Vercel Deploy:
```bash
# Tạo empty commit để trigger deploy
git commit --allow-empty -m "Trigger Vercel deployment"
git push origin main
```

### Force Render Deploy:
```bash
# Update deployment trigger file
echo "DEPLOY_$(date +%s)" > DEPLOYMENT_TRIGGER.txt
git add DEPLOYMENT_TRIGGER.txt
git commit -m "Trigger Render deployment"
git push origin main
```

## 🔧 Common Issues & Solutions

### Issue 1: Vercel Build Fails

**Symptoms:**
- Build logs show errors
- Deployment shows "Build Failed"

**Solutions:**
1. Check build logs for specific errors
2. Verify `package.json` has all dependencies
3. Check `vite.config.js` for issues
4. Verify environment variables
5. Try clearing build cache

### Issue 2: Render Build Fails

**Symptoms:**
- Build logs show `npm install` errors
- Deployment shows "Build Failed"

**Solutions:**
1. Check `render.yaml` build command
2. Verify `package.json` in server directory
3. Check for missing dependencies
4. Verify Node.js version compatibility
5. Try `--production=false` flag

### Issue 3: Render Health Check Fails

**Symptoms:**
- Deployment shows "Unhealthy"
- Health check endpoint returns error

**Solutions:**
1. Verify `/api/health` endpoint exists
2. Check server is starting correctly
3. Verify PORT environment variable
4. Check MongoDB connection
5. Review server logs

### Issue 4: Vercel Not Auto-Deploying

**Symptoms:**
- Commits pushed but no deployment
- No webhook triggered

**Solutions:**
1. Check Vercel Git integration
2. Verify webhook URL in GitHub
3. Check auto-deploy settings
4. Manual trigger deploy
5. Reconnect GitHub repository

## 📋 Deployment Checklist

### Pre-Deployment:
- [ ] Code committed và pushed lên GitHub
- [ ] All tests passing
- [ ] No syntax errors
- [ ] Environment variables set
- [ ] Build commands verified

### Vercel Deployment:
- [ ] Root directory = `client`
- [ ] Build command = `npm run build`
- [ ] Output directory = `dist`
- [ ] Environment variables set
- [ ] Auto-deploy enabled
- [ ] Build successful
- [ ] Frontend accessible

### Render Deployment:
- [ ] Build command = `cd server && npm install --production=false`
- [ ] Start command = `cd server && node index.js`
- [ ] Health check path = `/api/health`
- [ ] Environment variables set
- [ ] Build successful
- [ ] Health check passing
- [ ] API endpoints working

## 🎯 Expected Results

After fixes:
- ✅ Vercel auto-deploys on push to main
- ✅ Render builds và starts successfully
- ✅ Health check endpoints working
- ✅ Frontend can connect to backend
- ✅ All features working correctly

## 📝 Notes

- Render và Vercel có thể mất vài phút để detect changes
- Manual redeploy thường nhanh hơn auto-deploy
- Clear build cache giúp tránh cached issues
- Kiểm tra logs là cách tốt nhất để debug
- Environment variables cần được set trong dashboard

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Render Dashboard**: https://dashboard.render.com
- **GitHub Repository**: https://github.com/Long-creatergame/ielts-platform
- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs

