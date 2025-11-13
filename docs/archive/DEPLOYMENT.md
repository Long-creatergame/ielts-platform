# 🚀 IELTS Platform Deployment Guide

## 📋 Environment Variables Setup

### 🔧 Server (.env)

```bash
PORT=4000
MONGO_URI=mongodb+srv://your_username:your_password@cluster0.mongodb.net/ielts-platform?retryWrites=true&w=majority
FRONTEND_URL=https://ielts-platform.vercel.app
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
NODE_ENV=production
```

### 🔧 Client (.env)

```bash
VITE_API_BASE_URL=https://ielts-server.onrender.com
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
```

## 🌐 Deployment URLs

### Frontend (Vercel)

- **URL:** https://ielts-platform.vercel.app
- **Framework:** Vite + React
- **Root Directory:** /client

### Backend (Render)

- **URL:** https://ielts-server.onrender.com
- **Framework:** Node.js + Express
- **Root Directory:** /server
- **Build Command:** npm install
- **Start Command:** npm start

### Database (MongoDB Atlas)

- **Connection:** MongoDB Atlas Cluster
- **Database:** ielts-platform

## 🔧 Production Configuration

### 1. Backend (Render)

- **Root Directory:** /server
- **Build Command:** npm install
- **Start Command:** npm start
- **Environment:** Node.js 18+

### 2. Frontend (Vercel)

- **Root Directory:** /client
- **Framework:** Vite
- **Build Command:** npm run build
- **Output Directory:** dist

## 🧪 Test URLs

| Feature      | URL                                          |
| ------------ | -------------------------------------------- |
| Frontend     | https://ielts-platform.vercel.app            |
| Backend API  | https://ielts-server.onrender.com/api        |
| Health Check | https://ielts-server.onrender.com/api/health |
| Dashboard    | https://ielts-platform.vercel.app/dashboard  |
| Pricing      | https://ielts-platform.vercel.app/pricing    |
| Test Start   | https://ielts-platform.vercel.app/test/start |

## 💳 Payment Integration

### Stripe (Test Mode)

- **Test Card:** 4242 4242 4242 4242
- **Webhook:** https://ielts-server.onrender.com/api/payment/verify

### PayOS (Sandbox)

- **Callback URL:** https://ielts-server.onrender.com/api/payment/verify

## 📊 Analytics (Optional)

Add to client/index.html:

```html
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXX"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "G-XXXXXX");
</script>
```

## ✅ Production Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Stripe account setup (test mode)
- [ ] PayOS account setup (sandbox)
- [ ] Render backend deployed
- [ ] Vercel frontend deployed
- [ ] Environment variables configured
- [ ] Payment webhooks working
- [ ] Test flow completed
- [ ] Analytics integrated (optional)

## 🎯 Expected Production Behavior

1. **User Registration** → MongoDB Atlas
2. **Free Test** → 1 test allowed
3. **Paywall** → After first test
4. **Payment** → Stripe/PayOS processing
5. **Webhook** → Unlock results
6. **Dashboard** → Real-time updates
7. **Data Sync** → MongoDB Atlas

## 🚨 Troubleshooting

### Common Issues:

1. **CORS Error** → Check FRONTEND_URL in server
2. **API 404** → Verify VITE_API_BASE_URL in client
3. **Database Connection** → Check MONGO_URI
4. **Payment Failed** → Verify webhook URLs
5. **Build Failed** → Check Node.js version

### Debug Commands:

```bash
# Check server health
curl https://ielts-server.onrender.com/api/health

# Check frontend
curl https://ielts-platform.vercel.app

# Test payment
curl -X POST https://ielts-server.onrender.com/api/payment/create
```
