# 🔍 Deployment Troubleshooting Guide

## ❌ Vấn đề hiện tại

1. ✅ Git commit thành công
2. ❌ Vercel không cập nhật (không deploy)
3. ❌ Render deploy fail

---

## 🔍 Nguyên nhân có thể

### 1. **Vercel không deploy**

**Nguyên nhân phổ biến:**

#### A. GitHub Integration chưa được setup
- Vercel project chưa được connect với GitHub repo
- Hoặc integration đã bị disconnect

**Cách kiểm tra:**
1. Vào Vercel Dashboard → Project Settings → Git
2. Kiểm tra xem GitHub repo có được connect không
3. Kiểm tra Production branch có set là `main` không

**Cách fix:**
1. Vercel Dashboard → Settings → Git
2. Click "Connect Git Repository"
3. Chọn GitHub → Chọn repo `Long-creatergame/ielts-platform`
4. Set:
   - Root Directory: `client`
   - Production Branch: `main`
   - Framework Preset: Vite
5. Save và redeploy

#### B. Vercel project chưa được link
- File `.vercel/project.json` không tồn tại
- Workflow cần VERCEL_TOKEN để deploy qua CLI

**Cách fix:**
1. Link project manually:
   ```bash
   cd client
   npx vercel link
   ```
2. Hoặc thêm VERCEL_TOKEN vào GitHub Secrets

#### C. Workflow không trigger Vercel
- GitHub Actions workflow có `continue-on-error: true`
- Vercel CLI step có thể fail nhưng không báo lỗi rõ ràng

---

### 2. **Render deploy fail**

**Nguyên nhân phổ biến:**

#### A. Render API endpoint sai
- API endpoint có thể đã thay đổi
- Service ID không đúng

**Cách kiểm tra:**
1. Vào Render Dashboard → Service → Settings
2. Xem Service ID (format: `srv-xxxxx`)
3. Kiểm tra API endpoint trong workflow

**Render API v1 format:**
```
POST https://api.render.com/v1/services/{SERVICE_ID}/deploys
Authorization: Bearer {API_KEY}
```

#### B. RENDER_API_KEY hoặc RENDER_SERVICE_ID sai
- Secrets trong GitHub có thể không đúng
- Hoặc không có trong GitHub Secrets

**Cách fix:**
1. GitHub → Repository → Settings → Secrets and variables → Actions
2. Kiểm tra:
   - `RENDER_API_KEY` có tồn tại không
   - `RENDER_SERVICE_ID` có tồn tại không
3. Nếu không có, thêm vào:
   - RENDER_API_KEY: Lấy từ Render Dashboard → Account Settings → API Keys
   - RENDER_SERVICE_ID: Lấy từ Render Dashboard → Service → Settings → Service ID

#### C. Render webhook chưa được setup
- GitHub webhook chưa được config trong Render
- Hoặc webhook URL sai

**Cách fix:**
1. Render Dashboard → Service → Settings → Webhooks
2. Thêm webhook:
   - URL: `https://api.github.com/repos/{OWNER}/{REPO}/dispatches`
   - Hoặc enable auto-deploy từ GitHub

---

## 🔧 Fix Steps

### Step 1: Kiểm tra Render API

**Test Render API manually:**
```bash
curl -X POST "https://api.render.com/v1/services/{SERVICE_ID}/deploys" \
  -H "Authorization: Bearer {YOUR_API_KEY}" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected response:** HTTP 200/201 với JSON response

**Nếu fail:**
- Kiểm tra API key có đúng không
- Kiểm tra Service ID có đúng không
- Kiểm tra account có quyền deploy không

---

### Step 2: Kiểm tra Vercel Integration

**A. Kiểm tra GitHub Integration:**
1. Vercel Dashboard → Project → Settings → Git
2. Verify:
   - ✅ Repository connected
   - ✅ Production branch: `main`
   - ✅ Root Directory: `client`
   - ✅ Auto-deploy: Enabled

**B. Nếu chưa connect:**
1. Click "Connect Git Repository"
2. Chọn GitHub → Chọn repo
3. Configure settings
4. Deploy

**C. Test manual deploy:**
1. Vercel Dashboard → Deployments → "Redeploy"
2. Xem build logs để tìm lỗi

---

### Step 3: Kiểm tra GitHub Secrets

**Cần có các secrets sau:**

1. **RENDER_API_KEY**
   - Lấy từ: Render Dashboard → Account Settings → API Keys
   - Format: `rnd_xxxxx`

2. **RENDER_SERVICE_ID**
   - Lấy từ: Render Dashboard → Service → Settings
   - Format: `srv-xxxxx`

3. **VERCEL_TOKEN** (optional)
   - Lấy từ: Vercel Dashboard → Settings → Tokens
   - Format: `xxxxx`

**Cách thêm:**
1. GitHub → Repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add từng secret một

---

### Step 4: Kiểm tra Workflow Logs

**Xem GitHub Actions logs:**
1. GitHub → Repository → Actions tab
2. Click vào workflow run mới nhất
3. Xem logs của từng step
4. Tìm error messages

**Common errors:**
- `404 Not Found` → Service ID sai
- `401 Unauthorized` → API key sai
- `Missing .vercel/project.json` → Project chưa link
- `Vercel CLI failed` → Token sai hoặc project chưa link

---

## 🎯 Quick Fix Checklist

### Render:
- [ ] Service ID đúng (format: `srv-xxxxx`)
- [ ] RENDER_API_KEY được thêm vào GitHub Secrets
- [ ] RENDER_SERVICE_ID được thêm vào GitHub Secrets
- [ ] API endpoint đúng: `/v1/services/{ID}/deploys`
- [ ] Render webhook được setup (hoặc auto-deploy enabled)

### Vercel:
- [ ] GitHub integration connected
- [ ] Root Directory = `client`
- [ ] Production branch = `main`
- [ ] Auto-deploy enabled
- [ ] VERCEL_TOKEN được thêm vào GitHub Secrets (optional)
- [ ] `.vercel/project.json` exists (nếu dùng CLI)

---

## 🚀 Alternative: Manual Deploy

**Nếu auto-deploy không hoạt động, có thể deploy manual:**

### Render:
1. Render Dashboard → Service → Manual Deploy
2. Hoặc: Clear Build Cache → Deploy

### Vercel:
1. Vercel Dashboard → Deployments → "Redeploy"
2. Hoặc: Settings → Git → "Redeploy" button

---

## 📞 Support

Nếu vẫn không work, check:
1. GitHub Actions logs để xem lỗi cụ thể
2. Render logs để xem deployment status
3. Vercel build logs để xem build errors

