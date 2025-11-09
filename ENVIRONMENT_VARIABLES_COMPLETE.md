# 🔑 Environment Variables - Complete Guide

## 📋 Tổng Quan

File này liệt kê **TẤT CẢ** các environment variables cần set cho:
- **Render** (Backend Server)
- **Vercel** (Frontend Client)

---

## 🖥️ RENDER (Backend Server)

### 🔴 **REQUIRED - Bắt Buộc Phải Có**

#### 1. `NODE_ENV`
- **Mô tả**: Môi trường chạy ứng dụng
- **Giá trị**: `production`
- **Ví dụ**: `NODE_ENV=production`
- **Nơi set**: Render Dashboard → Environment Variables

#### 2. `PORT`
- **Mô tả**: Port mà server sẽ chạy (Render tự động set, nhưng nên set để đảm bảo)
- **Giá trị**: `4000` (hoặc để Render tự động)
- **Ví dụ**: `PORT=4000`
- **Lưu ý**: Render thường tự động set PORT, nhưng set để đảm bảo

#### 3. `MONGO_URI` hoặc `MONGODB_URI`
- **Mô tả**: Connection string đến MongoDB Atlas
- **Giá trị**: MongoDB Atlas connection string
- **Ví dụ**: `MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ielts-platform?retryWrites=true&w=majority`
- **Cách lấy**:
  1. Vào https://cloud.mongodb.com
  2. Chọn cluster của bạn
  3. Click "Connect" → "Connect your application"
  4. Copy connection string
  5. Thay `<password>` bằng password thật
  6. Thay `<dbname>` bằng `ielts-platform`

#### 4. `JWT_SECRET`
- **Mô tả**: Secret key để sign JWT tokens (dùng cho authentication)
- **Giá trị**: Random string dài và phức tạp
- **Ví dụ**: `JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-123456789`
- **Cách tạo**: 
  ```bash
  # Tạo random secret
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- **Lưu ý**: ⚠️ **QUAN TRỌNG** - Phải là string ngẫu nhiên, không được để default

#### 5. `FRONTEND_URL` hoặc `CLIENT_URL`
- **Mô tả**: URL của frontend (Vercel) để CORS và redirect
- **Giá trị**: URL Vercel của bạn
- **Ví dụ**: `FRONTEND_URL=https://ielts-platform-two.vercel.app`
- **Lưu ý**: Phải match chính xác với Vercel URL của bạn

---

### 🟡 **OPTIONAL - Tùy Chọn (Nhưng Nên Có)**

#### 6. `OPENAI_API_KEY`
- **Mô tả**: API key của OpenAI để sử dụng AI features (Writing/Speaking feedback, Reading generation, Recommendations)
- **Giá trị**: OpenAI API key
- **Ví dụ**: `OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Cách lấy**:
  1. Vào https://platform.openai.com/api-keys
  2. Login vào tài khoản OpenAI
  3. Click "Create new secret key"
  4. Copy key (chỉ hiện 1 lần, lưu lại ngay)
- **Lưu ý**: 
  - Nếu không có, AI features sẽ dùng fallback mode
  - Có thể để trống nếu không cần AI features

#### 7. `OPENAI_API_BASE`
- **Mô tả**: Base URL của OpenAI API (nếu dùng proxy hoặc custom endpoint)
- **Giá trị mặc định**: `https://api.openai.com/v1`
- **Ví dụ**: `OPENAI_API_BASE=https://api.openai.com/v1`
- **Lưu ý**: Chỉ cần set nếu dùng custom endpoint

#### 8. `OPENAI_MODEL`
- **Mô tả**: Model OpenAI sẽ sử dụng
- **Giá trị mặc định**: `gpt-4o-mini`
- **Ví dụ**: `OPENAI_MODEL=gpt-4o-mini`
- **Các options**: `gpt-4o-mini`, `gpt-4`, `gpt-3.5-turbo`

#### 9. `OPENAI_TEMPERATURE`
- **Mô tả**: Temperature cho AI responses (0.0 - 1.0)
- **Giá trị mặc định**: `0.85`
- **Ví dụ**: `OPENAI_TEMPERATURE=0.85`

---

### 💳 **PAYMENT - Stripe (Nếu Có Payment)**

#### 10. `STRIPE_SECRET_KEY`
- **Mô tả**: Stripe Secret Key (server-side)
- **Giá trị**: Stripe secret key (bắt đầu với `sk_test_` hoặc `sk_live_`)
- **Ví dụ**: `STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY_HERE`
- **Cách lấy**:
  1. Vào https://dashboard.stripe.com/test/apikeys
  2. Copy "Secret key" (không phải Publishable key)
- **Lưu ý**: 
  - Test key: `sk_test_...`
  - Live key: `sk_live_...` (chỉ dùng khi production thật)

#### 11. `STRIPE_PUBLIC_KEY`
- **Mô tả**: Stripe Publishable Key (có thể dùng ở client, nhưng nên set ở server để verify)
- **Giá trị**: Stripe publishable key (bắt đầu với `pk_test_` hoặc `pk_live_`)
- **Ví dụ**: `STRIPE_PUBLIC_KEY=pk_test_YOUR_STRIPE_PUBLIC_KEY_HERE`
- **Cách lấy**: Cùng trang với Secret key, copy "Publishable key"

#### 12. `STRIPE_WEBHOOK_SECRET`
- **Mô tả**: Webhook secret để verify Stripe webhook events
- **Giá trị**: Webhook signing secret (bắt đầu với `whsec_`)
- **Ví dụ**: `STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Cách lấy**:
  1. Vào https://dashboard.stripe.com/test/webhooks
  2. Tạo webhook endpoint: `https://your-render-url.onrender.com/api/payment/webhook`
  3. Copy "Signing secret"

---

### 🧪 **DEVELOPMENT/TESTING - Optional**

#### 13. `ENABLE_DEMO_MODE` hoặc `DEMO_MODE`
- **Mô tả**: Bật demo mode (bypass authentication)
- **Giá trị**: `true` hoặc `false`
- **Ví dụ**: `ENABLE_DEMO_MODE=true`
- **Lưu ý**: ⚠️ Chỉ dùng cho testing, không dùng production

#### 14. `AI_FALLBACK_MODE`
- **Mô tả**: Bật fallback mode khi không có OpenAI API key
- **Giá trị**: `true` hoặc `false`
- **Ví dụ**: `AI_FALLBACK_MODE=true`
- **Lưu ý**: Tự động bật nếu không có `OPENAI_API_KEY`

---

## 🌐 VERCEL (Frontend Client)

### 🔴 **REQUIRED - Bắt Buộc Phải Có**

#### 1. `VITE_API_BASE_URL`
- **Mô tả**: Base URL của backend API (Render)
- **Giá trị**: URL Render backend của bạn
- **Ví dụ**: `VITE_API_BASE_URL=https://ielts-platform-emrv.onrender.com`
- **Lưu ý**: 
  - ⚠️ **KHÔNG** thêm `/api` ở cuối
  - Code sẽ tự động thêm `/api` khi gọi API
  - Phải match với Render URL của bạn

---

### 🟡 **OPTIONAL - Tùy Chọn (Nhưng Nên Có)**

#### 2. `VITE_STRIPE_PUBLIC_KEY`
- **Mô tả**: Stripe Publishable Key (client-side)
- **Giá trị**: Stripe publishable key (bắt đầu với `pk_test_` hoặc `pk_live_`)
- **Ví dụ**: `VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_STRIPE_PUBLIC_KEY_HERE`
- **Cách lấy**: 
  1. Vào https://dashboard.stripe.com/test/apikeys
  2. Copy "Publishable key"
- **Lưu ý**: 
  - Test key: `pk_test_...`
  - Live key: `pk_live_...` (chỉ dùng khi production thật)
  - ⚠️ **KHÔNG** hardcode trong code, chỉ set trong Vercel dashboard

---

### 🟢 **OPTIONAL - Features Bổ Sung**

#### 3. `VITE_TAWK_PROPERTY_ID`
- **Mô tả**: Tawk.to chat widget Property ID
- **Giá trị**: Tawk.to property ID
- **Ví dụ**: `VITE_TAWK_PROPERTY_ID=1234567890abcdef`
- **Cách lấy**: 
  1. Vào https://dashboard.tawk.to
  2. Lấy Property ID từ settings
- **Lưu ý**: Chỉ cần nếu muốn dùng Tawk.to chat widget

#### 4. `VITE_TAWK_WIDGET_ID`
- **Mô tả**: Tawk.to chat widget Widget ID
- **Giá trị**: Tawk.to widget ID
- **Ví dụ**: `VITE_TAWK_WIDGET_ID=1h2j3k4l5m6n7o8p`
- **Cách lấy**: Cùng trang với Property ID

#### 5. `VITE_ZALO_URL`
- **Mô tả**: Zalo contact URL
- **Giá trị**: Zalo contact link
- **Ví dụ**: `VITE_ZALO_URL=https://zalo.me/0923456789`
- **Lưu ý**: Chỉ cần nếu muốn hiển thị Zalo contact button

#### 6. `VITE_DEMO_MODE`
- **Mô tả**: Bật demo mode indicator
- **Giá trị**: `true` hoặc `false`
- **Ví dụ**: `VITE_DEMO_MODE=true`
- **Lưu ý**: Chỉ dùng cho testing

---

## 📝 **TÓM TẮT - Checklist**

### ✅ **RENDER (Backend) - Minimum Required**

```
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ielts-platform?retryWrites=true&w=majority
JWT_SECRET=your-random-secret-key-here
FRONTEND_URL=https://ielts-platform-two.vercel.app
```

### ✅ **RENDER (Backend) - Recommended**

```
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ielts-platform?retryWrites=true&w=majority
JWT_SECRET=your-random-secret-key-here
FRONTEND_URL=https://ielts-platform-two.vercel.app
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### ✅ **VERCEL (Frontend) - Minimum Required**

```
VITE_API_BASE_URL=https://ielts-platform-emrv.onrender.com
```

### ✅ **VERCEL (Frontend) - Recommended**

```
VITE_API_BASE_URL=https://ielts-platform-emrv.onrender.com
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🚀 **HƯỚNG DẪN SET ENVIRONMENT VARIABLES**

### **Render Dashboard:**

1. Vào https://dashboard.render.com
2. Click vào service "ielts-platform"
3. Vào tab **"Environment"**
4. Click **"Add Environment Variable"**
5. Nhập **Key** và **Value**
6. Click **"Save Changes"**
7. Service sẽ tự động redeploy

### **Vercel Dashboard:**

1. Vào https://vercel.com/dashboard
2. Click vào project "ielts-platform-two"
3. Vào **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Nhập **Key** và **Value**
6. Chọn **Environment** (Production, Preview, Development)
7. Click **"Save"**
8. **Redeploy** để apply changes

---

## 🔒 **SECURITY BEST PRACTICES**

1. ⚠️ **KHÔNG BAO GIỜ** commit keys/secrets vào Git
2. ✅ **LUÔN** sử dụng environment variables
3. ✅ **KIỂM TRA** GitHub Secret Scanning alerts
4. ✅ **REVOKE** keys nếu bị expose
5. ✅ **SỬ DỤNG** .gitignore để exclude .env files
6. ✅ **ROTATE** keys định kỳ (đặc biệt là JWT_SECRET)
7. ✅ **SỬ DỤNG** test keys cho development, live keys cho production

---

## 🧪 **TESTING ENVIRONMENT VARIABLES**

### **Test Render Backend:**

```bash
# Test health endpoint
curl https://ielts-platform-emrv.onrender.com/api/health

# Expected: {"ok":true,"status":"OK",...}
```

### **Test Vercel Frontend:**

1. Vào https://ielts-platform-two.vercel.app
2. Mở Developer Tools (F12)
3. Vào Console tab
4. Kiểm tra không có errors về missing environment variables
5. Test API calls - verify `VITE_API_BASE_URL` được load đúng

---

## 📞 **SUPPORT**

Nếu gặp vấn đề:
1. Kiểm tra logs trên Render/Vercel dashboard
2. Verify environment variables đã set đúng
3. Kiểm tra format của values (không có spaces, quotes, etc.)
4. Redeploy sau khi thay đổi environment variables

---

## ✅ **VERIFICATION CHECKLIST**

### **Render:**
- [ ] NODE_ENV set
- [ ] MONGO_URI set và test connection thành công
- [ ] JWT_SECRET set (không phải default)
- [ ] FRONTEND_URL match với Vercel URL
- [ ] OPENAI_API_KEY set (nếu cần AI features)
- [ ] STRIPE keys set (nếu cần payment)
- [ ] Health check endpoint hoạt động

### **Vercel:**
- [ ] VITE_API_BASE_URL set đúng Render URL
- [ ] VITE_STRIPE_PUBLIC_KEY set (nếu cần payment)
- [ ] Frontend build thành công
- [ ] API calls hoạt động
- [ ] Không có console errors về missing env vars

---

**Last Updated:** 2025-01-27  
**Status:** ✅ Complete

