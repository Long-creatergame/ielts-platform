# 🔄 Render & Vercel Reset Guide

## 🎯 Mục tiêu

Khôi phục cấu hình Render và Vercel về trạng thái auto-deploy mặc định, không cần CI/CD workflows.

---

## 🚀 Render (Backend) - Manual Reset

### Bước 1: Vào Render Dashboard

1. Đăng nhập: https://dashboard.render.com
2. Click vào service của bạn (IELTS Platform backend)

### Bước 2: Kiểm tra Settings

**Vào Settings tab và verify:**

- ✅ **Auto Deploy:** ON (from GitHub)
- ✅ **Branch:** `main`
- ✅ **Build Command:** `cd server && npm install && npm start`
- ✅ **Start Command:** `cd server && node index.js` (hoặc `npm start`)
- ✅ **Node Version:** 18.x (hoặc latest stable)

### Bước 3: Xóa Custom Deploy Hooks (nếu có)

1. Vào **Settings** → **Webhooks**
2. Tìm các webhook custom (không phải GitHub webhook)
3. Xóa các webhook không cần thiết
4. **Giữ lại:** GitHub webhook (auto-deploy)

### Bước 4: Verify GitHub Integration

1. Vào **Settings** → **Git**
2. Verify:
   - ✅ Repository: `Long-creatergame/ielts-platform`
   - ✅ Branch: `main`
   - ✅ Auto Deploy: Enabled

### Bước 5: Test Auto-Deploy

1. Push một commit test vào `main` branch
2. Check Render Dashboard → Deployments
3. Verify: New deployment tự động được trigger

**Expected Result:**
- ✅ Render tự động deploy mỗi lần push `main`
- ✅ Không cần GitHub Actions workflow
- ✅ Không cần manual deploy

---

## 🎨 Vercel (Frontend) - Manual Reset

### Bước 1: Vào Vercel Dashboard

1. Đăng nhập: https://vercel.com/dashboard
2. Click vào project của bạn (IELTS Platform frontend)

### Bước 2: Kiểm tra Git Integration

**Vào Settings → Git và verify:**

- ✅ **GitHub Repository:** Connected to `Long-creatergame/ielts-platform`
- ✅ **Root Directory:** `client`
- ✅ **Build Command:** `npm run build`
- ✅ **Output Directory:** `dist`
- ✅ **Install Command:** `npm install`
- ✅ **Framework Preset:** Vite
- ✅ **Production Branch:** `main`
- ✅ **Auto Deploy:** Enabled

### Bước 3: Verify Build Settings

1. Vào **Settings** → **General**
2. Verify:
   - ✅ **Root Directory:** `client`
   - ✅ **Build & Development Settings:**
     - Framework: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

### Bước 4: Verify Environment Variables

1. Vào **Settings** → **Environment Variables**
2. Verify các variables cần thiết:
   - `VITE_API_BASE_URL`
   - `VITE_STRIPE_PUBLIC_KEY`
   - (và các variables khác nếu có)

### Bước 5: Xóa Custom Deploy Hooks (nếu có)

1. Vào **Settings** → **Git**
2. Check xem có custom webhooks/hooks không
3. Xóa các hooks không cần thiết
4. **Giữ lại:** GitHub integration (auto-deploy)

### Bước 6: Test Auto-Deploy

1. Push một commit test vào `main` branch
2. Check Vercel Dashboard → Deployments
3. Verify: New deployment tự động được trigger

**Expected Result:**
- ✅ Vercel tự động deploy mỗi lần push `main`
- ✅ Không cần GitHub Actions workflow
- ✅ Không cần manual deploy

---

## ✅ Verification Checklist

### Render

- [ ] Auto Deploy: ON (from GitHub)
- [ ] Branch: `main`
- [ ] Build Command: `cd server && npm install && npm start`
- [ ] GitHub webhook enabled
- [ ] Custom deploy hooks removed (if any)
- [ ] Test deploy successful (push commit → auto deploy)

### Vercel

- [ ] GitHub repository connected
- [ ] Root Directory: `client`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Production Branch: `main`
- [ ] Auto Deploy: Enabled
- [ ] Custom deploy hooks removed (if any)
- [ ] Test deploy successful (push commit → auto deploy)

---

## 🆘 Troubleshooting

### Render không auto-deploy

**Kiểm tra:**
1. GitHub webhook có enabled không?
2. Branch có đúng là `main` không?
3. Repository có đúng không?

**Fix:**
1. Vào Settings → Git
2. Disconnect và reconnect GitHub repository
3. Verify auto-deploy enabled

### Vercel không auto-deploy

**Kiểm tra:**
1. GitHub integration có connected không?
2. Root Directory có đúng là `client` không?
3. Production branch có đúng là `main` không?

**Fix:**
1. Vào Settings → Git
2. Click "Connect Git Repository"
3. Re-connect GitHub repository
4. Verify auto-deploy enabled

---

## 📝 Notes

- **Không cần GitHub Actions workflows** - Render và Vercel tự động deploy qua GitHub webhooks/integration
- **Không cần manual deploy** - Chỉ cần push code lên `main` branch
- **Environment variables** được quản lý trong Render/Vercel dashboard, không cần script
- **Build commands** được set trong dashboard, không cần workflow files

---

**Sau khi hoàn tất, hệ thống sẽ auto-deploy hoàn toàn qua Render và Vercel, không cần CI/CD workflows.**

