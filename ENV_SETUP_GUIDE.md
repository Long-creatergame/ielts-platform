# 🔐 Environment Variables Setup Guide

## 📋 Render (Backend) - Environment Variables

### Cách set Environment Variables trên Render:

1. **Vào Render Dashboard**: https://dashboard.render.com
2. **Chọn service** của bạn (ielts-server hoặc ielts-platform)
3. **Vào tab "Environment"** ở sidebar bên trái
4. **Add từng biến một**:

```
NODE_ENV = production
PORT = 4000
MONGO_URI = mongodb+srv://username:password@cluster.mongodb.net/ielts-platform?retryWrites=true&w=majority
JWT_SECRET = your-secret-key-here-min-32-chars
OPENAI_API_KEY = sk-...
OPENAI_API_BASE = https://api.openai.com/v1
OPENAI_MODEL = gpt-4o-mini
OPENAI_TEMPERATURE = 0.85
AI_FALLBACK_MODE = false
FRONTEND_URL = https://ielts-platform-two.vercel.app
STRIPE_SECRET_KEY = sk_test_...
SENDGRID_API_KEY = SG....
PAYOS_CLIENT_ID = ...
PAYOS_API_KEY = ...
```

5. **Click "Save Changes"**
6. **Render sẽ tự động restart** service với env vars mới

### ⚠️ Lưu ý:
- **KHÔNG** commit file `.env` lên GitHub
- **KHÔNG** hardcode secrets trong code
- Chỉ set trong Render dashboard

---

## 📋 Vercel (Frontend) - Environment Variables

### Cách set Environment Variables trên Vercel:

1. **Vào Vercel Dashboard**: https://vercel.com/dashboard
2. **Chọn project** của bạn (ielts-platform)
3. **Vào Settings → Environment Variables**
4. **Add từng biến một**:

```
VITE_API_BASE_URL = https://your-render-url.onrender.com/api
VITE_STRIPE_PUBLIC_KEY = pk_test_...
```

5. **Chọn môi trường** (Production, Preview, Development)
6. **Click "Save"**
7. **Redeploy** để áp dụng thay đổi

### ⚠️ Lưu ý:
- Vercel cần **Redeploy** để áp dụng env vars mới
- **KHÔNG** commit file `.env` lên GitHub
- Env vars với prefix `VITE_` sẽ được expose cho frontend

---

## ✅ Checklist

### Render (Backend):
- [ ] MONGO_URI đã set
- [ ] JWT_SECRET đã set
- [ ] OPENAI_API_KEY đã set
- [ ] FRONTEND_URL đã set (cho CORS)
- [ ] Service đã restart sau khi set env vars

### Vercel (Frontend):
- [ ] VITE_API_BASE_URL đã set (trỏ tới Render backend)
- [ ] VITE_STRIPE_PUBLIC_KEY đã set (nếu dùng Stripe)
- [ ] Đã redeploy sau khi set env vars

---

## 🔍 Verify Environment Variables

### Render:
1. Vào service → Logs
2. Xem console output khi start
3. Nên thấy: `✅ MongoDB Connected`, `✅ Server running on port 4000`

### Vercel:
1. Vào project → Deployments → Latest
2. Check build logs
3. Nên thấy build thành công
4. Test app: check browser console (F12)

---

## 🚨 Troubleshooting

### Render không nhận env vars:
- Kiểm tra tên biến đúng chưa (case-sensitive)
- Restart service manually
- Check logs để xem lỗi

### Vercel không nhận env vars:
- Redeploy sau khi set env vars
- Kiểm tra prefix `VITE_` cho frontend vars
- Check build logs

### Backend không connect được:
- Kiểm tra MONGO_URI format đúng chưa
- Kiểm tra MongoDB Atlas whitelist IP
- Check Render logs

---

## 📝 Notes

- **File `.env` local** chỉ dùng cho development
- **Production** dùng env vars từ dashboard
- **KHÔNG BAO GIỜ** commit `.env` lên GitHub
- Nếu cần share env vars với team, dùng `.env.example` file

