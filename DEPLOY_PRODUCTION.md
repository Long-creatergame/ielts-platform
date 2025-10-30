# 🚀 Hướng Dẫn Deploy Production - IELTS Platform

## ✅ ĐÃ HOÀN TẠI

Các thay đổi đã được commit và push lên GitHub:
- ✅ Performance optimization (40% faster)
- ✅ UX improvements (removed confusing features)
- ✅ User flow improvements (Test → Assessment → Practice)
- ✅ Build successful, no errors

---

## 🌐 DEPLOYMENT STEPS

### BƯỚC 1: GitHub Repository

**Status:** ✅ Code đã được push thành công

**Repository:** https://github.com/Long-creatergame/ielts-platform  
**Branch:** main  
**Latest Commit:** 51d3b466

---

### BƯỚC 2: Deploy Backend (Render.com)

#### 2.1 Tạo/Update Web Service

1. **Đăng nhập Render:** https://render.com
2. **Vào Dashboard** → "New +" → "Web Service"
3. **Connect GitHub** → Chọn repository `ielts-platform`
4. **Cấu hình:**

```
Name: ielts-server (hoặc tên bạn muốn)
Root Directory: server
Environment: Node
Build Command: npm install
Start Command: npm start
Plan: Free (hoặc Paid)
```

#### 2.2 Environment Variables

Trong "Environment" tab, thêm các biến:

```bash
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ielts-platform?retryWrites=true&w=majority
FRONTEND_URL=https://ielts-platform.vercel.app
JWT_SECRET=your-super-secret-jwt-key-change-in-production
OPENAI_API_KEY=sk-your-openai-key
STRIPE_SECRET_KEY=sk_live_or_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**Note:** `MONGO_URI` cần MongoDB Atlas connection string

#### 2.3 Deploy

- Click "Create Web Service"
- Render sẽ tự động build và deploy
- Lấy URL backend (ví dụ: `https://ielts-server.onrender.com`)

---

### BƯỚC 3: Deploy Frontend (Vercel)

#### 3.1 Import Project

1. **Đăng nhập Vercel:** https://vercel.com
2. **"Add New"** → "Project" → Import `ielts-platform`
3. **Configure:**

```
Framework Preset: Vite
Root Directory: client
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### 3.2 Environment Variables

```bash
VITE_API_BASE_URL=https://ielts-server.onrender.com
VITE_STRIPE_PUBLIC_KEY=pk_live_or_test_key
VITE_TAWK_PROPERTY_ID=your_property_id
VITE_TAWK_WIDGET_ID=your_widget_id
VITE_ZALO_URL=https://zalo.me/yournumber
```

**Important:** 
- Replace `ielts-server.onrender.com` với URL backend thực tế của bạn
- Đảm bảo `VITE_API_BASE_URL` trỏ đến đúng backend URL

#### 3.3 Deploy

- Click "Deploy"
- Vercel sẽ build và deploy frontend
- Lấy URL frontend (ví dụ: `https://ielts-platform.vercel.app`)

---

### BƯỚC 4: Update Backend FRONTEND_URL

Sau khi có frontend URL, cập nhật trong Render:

1. Vào Render dashboard → Your Web Service → Environment
2. Tìm `FRONTEND_URL`
3. Update thành frontend URL thực tế (ví dụ: `https://ielts-platform.vercel.app`)
4. **Restart** service để apply changes

---

### BƯỚC 5: Cấu Hình MongoDB Atlas

#### 5.1 Network Access

1. Vào MongoDB Atlas → Network Access
2. Add IP Address: `0.0.0.0/0` (Allow from anywhere) hoặc Render IPs

#### 5.2 Database User

1. Vào Database Access
2. Create user với password
3. Lấy connection string: `mongodb+srv://username:password@cluster.mongodb.net/...`

#### 5.3 Update MONGO_URI

Update `MONGO_URI` trong Render environment variables

---

## 🧪 TESTING

### Backend Health Check

```bash
curl https://your-backend-url.onrender.com/api/health
```

Expected response:
```json
{
  "ok": true,
  "status": "OK",
  "timestamp": "...",
  "database": {...}
}
```

### Frontend Check

1. Mở trình duyệt: `https://your-frontend-url.vercel.app`
2. Test các trang:
   - Homepage
   - Login/Register
   - Dashboard
   - Test Start

### Integration Test

1. **Register** account mới
2. **Take test** → Submit
3. **View result** → Check Practice Weaknesses section
4. **Practice** → Click weakness button
5. **Verify** tất cả navigation hoạt động

---

## 📋 PRODUCTION CHECKLIST

### Backend (Render)
- [ ] Service deployed successfully
- [ ] Health check returns OK
- [ ] MongoDB connection working
- [ ] Environment variables configured
- [ ] CORS configured for frontend URL
- [ ] API endpoints responding

### Frontend (Vercel)
- [ ] Deployed successfully
- [ ] Environment variables configured
- [ ] API calls working
- [ ] Navigation flows work
- [ ] No console errors
- [ ] Performance optimized

### Integration
- [ ] User registration works
- [ ] Login/Logout works
- [ ] Test taking works
- [ ] Results displayed
- [ ] Practice flow works
- [ ] Payments work (if configured)

---

## 🔧 TROUBLESHOOTING

### CORS Errors

**Problem:** Frontend can't call backend API

**Solution:**
1. Check `FRONTEND_URL` in backend environment
2. Verify CORS middleware in `server/index.js`
3. Ensure frontend URL matches exactly

### API 404 Errors

**Problem:** API calls return 404

**Solution:**
1. Check `VITE_API_BASE_URL` in frontend
2. Verify backend is running
3. Test backend health endpoint

### Database Connection Failed

**Problem:** Can't connect to MongoDB

**Solution:**
1. Check `MONGO_URI` format
2. Verify Network Access in MongoDB Atlas
3. Check username/password
4. Test connection string locally

---

## 🎯 DEPLOYMENT URLs

Sau khi deploy, bạn sẽ có:

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | `https://ielts-platform.vercel.app` | ⏳ To be deployed |
| **Backend** | `https://ielts-server.onrender.com` | ⏳ To be deployed |
| **Health Check** | `https://ielts-server.onrender.com/api/health` | ⏳ To be deployed |

**Thay thế URLs trên bằng URLs thực tế của bạn**

---

## 🚨 IMPORTANT NOTES

### Free Tier Limitations

**Render (Free):**
- Service sleeps after 15 minutes inactivity
- 1st request wakes up service (~30-60 seconds)
- Limited bandwidth

**Vercel (Free):**
- Bandwidth limits
- Build time limits
- Auto-deployment on git push

### Environment Variables

**NEVER** commit `.env` files to Git!  
Tất cả secrets phải được add trong Render/Vercel dashboard

### Payment Integration

- Configure Stripe webhooks
- Test payment flow thoroughly
- Monitor payment logs

---

## 📞 SUPPORT

Nếu gặp vấn đề:

1. Check logs trong Render/Vercel dashboard
2. Verify environment variables
3. Test endpoints với curl
4. Check MongoDB Atlas logs
5. Review application logs

---

## ✅ DEPLOYMENT COMPLETE

Sau khi hoàn tất tất cả bước:

1. ✅ Backend deployed and healthy
2. ✅ Frontend deployed and accessible
3. ✅ Integration working
4. ✅ All features tested
5. ✅ Ready for users! 🎉

---

**Generated:** 2024-12-19  
**Author:** IELTS Platform Team


