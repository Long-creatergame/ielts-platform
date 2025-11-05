# 🚨 FIX DEPLOYMENT NGAY - Hướng dẫn chi tiết

## ❌ Vấn đề hiện tại

1. ✅ Git commit thành công
2. ❌ Vercel không deploy (không tự động cập nhật)
3. ❌ Render deploy fail

---

## 🔍 Nguyên nhân

### 1. **Render Deploy Fail**

**Vấn đề:** Workflow đang dùng `${{ secrets.RENDER_SERVICE_ID }}` nhưng có thể:
- Secret chưa được thêm vào GitHub
- Service ID không đúng
- API endpoint format sai

**Service ID cũ từ file deploy-old.yml:** `srv-d3rq06lsf0hr37d5kmng`

### 2. **Vercel không deploy**

**Vấn đề:** Vercel GitHub integration chưa được setup hoặc bị disconnect

---

## ✅ GIẢI PHÁP - Làm theo từng bước

### STEP 1: Fix Render Deployment

#### A. Lấy Service ID từ Render Dashboard

1. Vào https://dashboard.render.com
2. Click vào service của bạn
3. Vào Settings tab
4. Copy **Service ID** (format: `srv-xxxxx`)

#### B. Lấy API Key từ Render

1. Vào Render Dashboard → Account Settings (icon user góc trên)
2. Click vào **API Keys** tab
3. Tạo mới hoặc copy API key hiện có (format: `rnd_xxxxx`)

#### C. Thêm vào GitHub Secrets

1. Vào GitHub repo: https://github.com/Long-creatergame/ielts-platform
2. Click **Settings** tab
3. Vào **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Thêm 2 secrets:

   **Secret 1:**
   - Name: `RENDER_API_KEY`
   - Value: `rnd_xxxxx` (API key bạn vừa copy)

   **Secret 2:**
   - Name: `RENDER_SERVICE_ID`
   - Value: `srv-xxxxx` (Service ID bạn vừa copy)

#### D. Test Render API (Optional)

Mở terminal và chạy:

```bash
curl -X POST "https://api.render.com/v1/services/srv-xxxxx/deploys" \
  -H "Authorization: Bearer rnd_xxxxx" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected:** HTTP 200/201 với JSON response

---

### STEP 2: Fix Vercel Deployment

#### A. Kiểm tra Vercel GitHub Integration

1. Vào https://vercel.com/dashboard
2. Click vào project của bạn
3. Vào **Settings** → **Git**
4. Kiểm tra:

   ✅ **Repository:** `Long-creatergame/ielts-platform` (phải connected)
   
   ✅ **Production Branch:** `main`
   
   ✅ **Root Directory:** `client`
   
   ✅ **Auto-deploy:** Enabled

#### B. Nếu chưa connect hoặc bị disconnect

1. Click **Connect Git Repository**
2. Chọn GitHub
3. Chọn repo: `Long-creatergame/ielts-platform`
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Click **Deploy**

#### C. Enable Auto-deploy (nếu chưa)

1. Vercel Dashboard → Project → Settings → Git
2. Tìm **Auto-deploy** section
3. Enable cho branch `main`

---

### STEP 3: Verify GitHub Actions Workflow

#### A. Kiểm tra workflow file

Workflow file: `.github/workflows/deploy-fixed.yml`

**Đảm bảo:**
- ✅ Render API endpoint: `https://api.render.com/v1/services/${{ secrets.RENDER_SERVICE_ID }}/deploys`
- ✅ Vercel CLI step có `working-directory: ./client`
- ✅ Có `continue-on-error: true` cho resilience

#### B. Test workflow

1. Push một commit mới (hoặc trigger workflow manually)
2. Vào GitHub → **Actions** tab
3. Xem workflow run mới nhất
4. Check logs của từng step

**Expected logs:**
- ✅ "RENDER_API_KEY found"
- ✅ "RENDER_SERVICE_ID found"
- ✅ "Render deployment triggered successfully (HTTP 200/201)"
- ✅ "Vercel deployment successful" hoặc "Vercel will use GitHub integration"

---

### STEP 4: Manual Deploy (Nếu cần)

#### Render Manual Deploy:

1. Render Dashboard → Service → **Manual Deploy**
2. Hoặc: **Clear Build Cache** → **Deploy**

#### Vercel Manual Deploy:

1. Vercel Dashboard → Deployments
2. Click **Redeploy** trên deployment mới nhất
3. Hoặc: Settings → Git → **Redeploy** button

---

## 🔍 Debug Checklist

### Render Issues:

- [ ] RENDER_API_KEY đã được thêm vào GitHub Secrets?
- [ ] RENDER_SERVICE_ID đã được thêm vào GitHub Secrets?
- [ ] Service ID có đúng format `srv-xxxxx`?
- [ ] API key có đúng format `rnd_xxxxx`?
- [ ] Render webhook enabled trong Render Dashboard?
- [ ] GitHub Actions logs có hiển thị HTTP 200/201?

### Vercel Issues:

- [ ] GitHub repo connected trong Vercel Dashboard?
- [ ] Root Directory = `client`?
- [ ] Production Branch = `main`?
- [ ] Auto-deploy enabled?
- [ ] Environment variables đã được set?
- [ ] Build logs có error không?

---

## 📊 Expected Results

### Sau khi fix:

**GitHub Actions:**
- ✅ Workflow chạy thành công
- ✅ Render API call thành công (HTTP 200/201)
- ✅ Vercel deployment triggered

**Render:**
- ✅ New deployment được trigger
- ✅ Build logs show "Build successful"
- ✅ Service online

**Vercel:**
- ✅ New deployment được trigger
- ✅ Build logs show "Build successful"
- ✅ Frontend accessible

---

## 🆘 Nếu vẫn không work

### Check GitHub Actions Logs:

1. GitHub → Actions → Click vào workflow run mới nhất
2. Xem logs của step "Deploy Backend to Render"
3. Xem logs của step "Deploy Frontend to Vercel"
4. Copy error messages và tìm kiếm trên Google

### Common Errors:

**Error 404:**
- Service ID sai → Check lại RENDER_SERVICE_ID secret

**Error 401:**
- API key sai → Check lại RENDER_API_KEY secret

**Error: Missing .vercel/project.json:**
- Không sao, Vercel sẽ dùng GitHub integration
- Hoặc run: `cd client && npx vercel link`

**Error: Vercel CLI failed:**
- Không sao, Vercel sẽ dùng GitHub integration
- Check Vercel Dashboard → Deployments

---

## ✅ Quick Fix Summary

1. **Render:** Thêm `RENDER_API_KEY` và `RENDER_SERVICE_ID` vào GitHub Secrets
2. **Vercel:** Check GitHub integration trong Vercel Dashboard, enable auto-deploy
3. **Test:** Push một commit mới và xem GitHub Actions logs

---

**Sau khi fix xong, push một commit test để verify!** 🚀

