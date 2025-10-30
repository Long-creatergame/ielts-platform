# ✅ Quick Deploy Checklist

## 🎯 READY TO DEPLOY

### Code Status
- ✅ All changes committed
- ✅ Pushed to GitHub (branch: main)
- ✅ Build successful (no errors)
- ✅ No linter errors
- ✅ Performance optimized

---

## 🚀 DEPLOYMENT (5 Steps)

### STEP 1: Backend on Render
```
1. Go to render.com → New Web Service
2. Connect GitHub repo
3. Configure:
   - Root Directory: server
   - Build: npm install
   - Start: npm start
4. Add Environment Variables:
   - NODE_ENV=production
   - PORT=4000
   - MONGO_URI=mongodb+srv://...
   - FRONTEND_URL=https://your-frontend.vercel.app
   - JWT_SECRET=...
   - OPENAI_API_KEY=...
5. Deploy & Copy Backend URL
```

### STEP 2: Frontend on Vercel
```
1. Go to vercel.com → Import Project
2. Select repo → Configure:
   - Framework: Vite
   - Root Directory: client
   - Output: dist
3. Add Environment Variables:
   - VITE_API_BASE_URL=https://your-backend.onrender.com
   - VITE_STRIPE_PUBLIC_KEY=...
4. Deploy & Copy Frontend URL
```

### STEP 3: Update Backend
```
1. In Render → Environment Variables
2. Update FRONTEND_URL with Vercel URL
3. Restart service
```

### STEP 4: Configure MongoDB
```
1. MongoDB Atlas → Network Access
2. Add IP: 0.0.0.0/0
3. Get connection string
4. Update MONGO_URI in Render
```

### STEP 5: Test
```
1. Visit frontend URL
2. Register account
3. Take test
4. Check Practice Weaknesses
5. Verify all flows work
```

---

## 📋 CHECKLIST

### Pre-Deploy
- [x] Code committed & pushed
- [x] Build successful
- [x] No errors
- [x] Performance optimized

### Backend (Render)
- [ ] Service created
- [ ] Environment variables added
- [ ] Deployed successfully
- [ ] Health check OK

### Frontend (Vercel)
- [ ] Project imported
- [ ] Environment variables added
- [ ] Deployed successfully
- [ ] Loads correctly

### Integration
- [ ] API calls work
- [ ] User registration works
- [ ] Login works
- [ ] Tests work
- [ ] Practice flow works

---

## 🌐 EXPECTED URLs

**Replace with your actual URLs:**

```
Backend:  https://ielts-server.onrender.com
Frontend: https://ielts-platform.vercel.app
```

---

## 📞 NEED HELP?

See `DEPLOY_PRODUCTION.md` for detailed instructions.

---

**Status:** ✅ Ready to deploy!  
**Date:** 2024-12-19


