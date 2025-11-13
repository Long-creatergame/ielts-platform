# ⚡ Quick Start - IELTS Platform Deployment

## 🎯 5-Minute Deployment

### 1️⃣ Push to GitHub

```bash
# Initialize Git (if not done)
git init
git add .
git commit -m "Initial commit"

# Add remote (replace with your repo)
git remote add origin https://github.com/yourusername/ielts-platform.git
git push -u origin main
```

### 2️⃣ Deploy Backend (Render)

1. Go to [Render](https://render.com)
2. Click "New" → "Web Service"
3. Connect GitHub repo
4. Configure:
   - **Name:** `ielts-server`
   - **Root Directory:** `/server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=4000
   MONGO_URI=your_mongodb_atlas_uri
   FRONTEND_URL=https://ielts-platform.vercel.app
   STRIPE_SECRET_KEY=sk_test_...
   PAYOS_CLIENT_ID=your_client_id
   PAYOS_API_KEY=your_api_key
   ```
6. Click "Deploy"

### 3️⃣ Deploy Frontend (Vercel)

1. Go to [Vercel](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repo
4. Configure:
   - **Root Directory:** `/client`
   - **Framework:** Vite
5. Add Environment Variables:
   ```
   VITE_API_BASE_URL=https://ielts-server.onrender.com
   VITE_STRIPE_PUBLIC_KEY=pk_test_...
   ```
6. Click "Deploy"

### 4️⃣ Test Production

1. **Backend Health:** https://ielts-server.onrender.com/api/health
2. **Frontend:** https://ielts-platform.vercel.app
3. **Register:** Create test account
4. **Test Flow:** Take free test → See paywall → Test payment

## 🔧 Environment Variables Reference

### Backend (Render)

```bash
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ielts-platform
FRONTEND_URL=https://ielts-platform.vercel.app
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
```

### Frontend (Vercel)

```bash
VITE_API_BASE_URL=https://ielts-server.onrender.com
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
```

## 🧪 Test URLs

| Feature          | URL                                          |
| ---------------- | -------------------------------------------- |
| **Frontend**     | https://ielts-platform.vercel.app            |
| **Backend API**  | https://ielts-server.onrender.com/api        |
| **Health Check** | https://ielts-server.onrender.com/api/health |
| **Dashboard**    | https://ielts-platform.vercel.app/dashboard  |
| **Pricing**      | https://ielts-platform.vercel.app/pricing    |
| **Test Start**   | https://ielts-platform.vercel.app/test/start |

## 💳 Payment Testing

### Stripe Test Mode

- **Test Card:** `4242 4242 4242 4242`
- **Expiry:** Any future date
- **CVC:** Any 3 digits
- **Webhook:** https://ielts-server.onrender.com/api/payment/verify

### PayOS Sandbox

- **Callback URL:** https://ielts-server.onrender.com/api/payment/verify

## 🎯 Expected Production Flow

1. **User visits:** https://ielts-platform.vercel.app
2. **Registers:** Creates account with goal/target
3. **Takes test:** 1 free test allowed
4. **Sees paywall:** After first test
5. **Pays:** Stripe/PayOS processing
6. **Unlocks:** Full results and unlimited tests
7. **Dashboard:** Personalized progress tracking

## 🚨 Troubleshooting

### Common Issues

1. **CORS Error:** Check FRONTEND_URL in Render
2. **API 404:** Verify VITE_API_BASE_URL in Vercel
3. **Database:** Check MONGO_URI connection
4. **Payment:** Verify webhook URLs

### Debug Commands

```bash
# Check backend
curl https://ielts-server.onrender.com/api/health

# Check frontend
curl https://ielts-platform.vercel.app

# Test login
curl -X POST https://ielts-server.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## ✅ Success Checklist

- [ ] GitHub repo pushed
- [ ] Render backend deployed
- [ ] Vercel frontend deployed
- [ ] MongoDB Atlas connected
- [ ] Stripe account configured
- [ ] PayOS account configured
- [ ] Environment variables set
- [ ] Health checks passing
- [ ] User registration works
- [ ] Test taking works
- [ ] Paywall triggers
- [ ] Payment processing works
- [ ] Results unlock
- [ ] Dashboard updates

## 🎉 Production Ready!

Your IELTS Platform is now live and ready for users!

**Frontend:** https://ielts-platform.vercel.app
**Backend:** https://ielts-server.onrender.com
**Database:** MongoDB Atlas
**Payments:** Stripe + PayOS

---

**🚀 Deploy in 5 minutes and start monetizing!**
