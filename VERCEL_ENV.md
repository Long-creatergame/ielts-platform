# 🌐 Vercel Environment Variables

## 📋 Required Environment Variables for Vercel

Set these in your Vercel dashboard:

### 🔧 Frontend Environment Variables

```bash
VITE_API_BASE_URL=https://ielts-server.onrender.com
VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_STRIPE_PUBLIC_KEY_HERE
```

## 🎯 Vercel Build Settings

### Framework Preset

- **Framework:** Vite
- **Root Directory:** `client`
- **Install Command:** `npm install`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

## 🚀 Deployment Steps

1. **Connect GitHub repo** to Vercel
2. **Set Root Directory** to `client`
3. **Add Environment Variables** above
4. **Deploy**

## 🧪 Test URLs

- **Frontend:** https://ielts-platform.vercel.app
- **Backend:** https://ielts-server.onrender.com

## 🔧 Troubleshooting

### Common Issues:

1. **White Screen:** Check Root Directory is `client`
2. **MIME Errors:** Verify build output in `client/dist`
3. **API 404:** Check `VITE_API_BASE_URL` environment variable
4. **Build Failed:** Ensure `client/package.json` has correct scripts

### Debug Commands:

```bash
# Check build locally
cd client && npm run build

# Check build output
ls -la client/dist

# Test build
cd client && npm run preview
```
