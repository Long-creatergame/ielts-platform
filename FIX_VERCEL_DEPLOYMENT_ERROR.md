# 🚨 Fix Vercel Deployment Error - Key/Secret Issue

## ❌ Vấn Đề

**Vercel deployment fail** với thông báo:
- "Deployment failed"
- Có thể do GitHub Secret Scanning phát hiện keys/secrets
- Hoặc thiếu environment variables trên Vercel

## 🔍 Nguyên Nhân Có Thể

### 1. GitHub Secret Scanning
- GitHub có thể phát hiện keys/secrets trong code
- Tự động chặn deployment để bảo vệ
- Cần xóa keys khỏi code và sử dụng environment variables

### 2. Stripe Key Bị Hardcode
- Tìm thấy Stripe public key test trong documentation files:
  - `VERCEL_SETTINGS_CHECKLIST.md`
  - `VERCEL_ENV_UPDATE.md`
- Key này chỉ là test key (pk_test_) nhưng vẫn nên được remove

### 3. Thiếu Environment Variables trên Vercel
- Vercel có thể không có đủ environment variables
- Cần set trong Vercel dashboard

## ✅ Giải Pháp

### Bước 1: Xóa Keys Khỏi Documentation Files

**Files cần sửa:**
1. `VERCEL_SETTINGS_CHECKLIST.md` - Thay key thật bằng placeholder
2. `VERCEL_ENV_UPDATE.md` - Thay key thật bằng placeholder
3. Các file documentation khác có chứa keys

### Bước 2: Kiểm tra GitHub Secrets

1. Vào https://github.com/Long-creatergame/ielts-platform/settings/secrets/actions
2. Kiểm tra xem có secrets nào bị flagged không
3. Nếu có, xóa và tạo lại

### Bước 3: Set Environment Variables trên Vercel

1. Vào https://vercel.com/dashboard
2. Click vào project "ielts-platform-two"
3. Vào Settings → Environment Variables
4. Thêm các variables:
   ```
   VITE_API_BASE_URL=https://ielts-platform-emrv.onrender.com
   VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
   ```
5. **KHÔNG** hardcode keys trong code

### Bước 4: Kiểm tra Vercel Deployment Logs

1. Vào Vercel Dashboard
2. Click vào failed deployment
3. Xem "Build Logs" để tìm lỗi cụ thể:
   - Missing environment variables?
   - Build errors?
   - Secret scanning errors?

### Bước 5: Revoke và Tạo Lại Keys (Nếu Cần)

**Nếu keys bị expose:**
1. Vào Stripe Dashboard
2. Revoke keys cũ
3. Tạo keys mới
4. Update trong Vercel environment variables

## 🔧 Quick Fix

### 1. Replace Hardcoded Keys trong Docs

```bash
# Tìm và thay thế keys trong docs
find . -name "*.md" -type f -exec sed -i '' 's/pk_test_51SJco3JGcJnrmm75B1K5kR2uPlWzUharxQNwN0WxsW6VE5LAf59RwBUPcv7hkiSVGOTnvbzPbZVtvUiq3Jw78v5400AccSRVpR/pk_test_YOUR_KEY_HERE/g' {} +
```

### 2. Commit và Push

```bash
git add .
git commit -m "fix: Remove hardcoded keys from documentation"
git push origin main
```

### 3. Manual Redeploy trên Vercel

1. Vào Vercel Dashboard
2. Click "Redeploy" với clear cache
3. Đợi deployment hoàn thành

## 📋 Checklist

### Pre-Fix:
- [ ] Tìm tất cả hardcoded keys trong code
- [ ] Xóa keys khỏi documentation
- [ ] Verify không có keys trong code source

### Vercel Setup:
- [ ] Set environment variables trong Vercel dashboard
- [ ] Verify VITE_API_BASE_URL
- [ ] Verify VITE_STRIPE_PUBLIC_KEY
- [ ] Enable auto-deploy

### Post-Fix:
- [ ] Commit và push changes
- [ ] Manual redeploy trên Vercel
- [ ] Verify deployment successful
- [ ] Test frontend functionality

## 🚨 Lưu Ý Quan Trọng

1. **KHÔNG BAO GIỜ** commit keys/secrets vào Git
2. **LUÔN** sử dụng environment variables
3. **KIỂM TRA** GitHub Secret Scanning alerts
4. **REVOKE** keys nếu bị expose
5. **SỬ DỤNG** .gitignore để exclude .env files

## 🔗 Useful Links

- **GitHub Secret Scanning**: https://docs.github.com/en/code-security/secret-scanning
- **Vercel Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables
- **Stripe API Keys**: https://dashboard.stripe.com/test/apikeys

## 🎯 Expected Results

Sau khi fix:
- ✅ Không còn hardcoded keys trong code
- ✅ Environment variables set đúng trên Vercel
- ✅ Vercel deployment successful
- ✅ Frontend hoạt động bình thường
- ✅ GitHub Secret Scanning không còn alerts

