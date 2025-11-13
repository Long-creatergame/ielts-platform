# 🚨 VERCEL SETTINGS CHECKLIST - FIX WHITE SCREEN

## ✅ **CRITICAL SETTINGS TO CHECK:**

### 1. **Vercel Project Settings**

Go to your Vercel dashboard and verify:

```
Framework Preset: Vite
Root Directory: client
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

### 2. **Environment Variables**

In Vercel dashboard, go to Settings → Environment Variables and add:

```
VITE_API_BASE_URL=https://ielts-server.onrender.com
VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_STRIPE_PUBLIC_KEY_HERE
```

### 3. **Domain Settings**

- Check if custom domain is configured correctly
- Try accessing the default Vercel URL first

## 🔧 **TROUBLESHOOTING STEPS:**

### Step 1: Check Build Logs

1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Deployments" tab
4. Click on latest deployment
5. Check "Build Logs" for errors

### Step 2: Check Function Logs

1. Go to "Functions" tab in Vercel
2. Look for any runtime errors

### Step 3: Test API Connection

1. Open browser console (F12)
2. Try accessing: `https://ielts-server.onrender.com/api/health`
3. Check if backend is responding

### Step 4: Clear Cache

1. Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Try incognito/private mode

## 🚨 **COMMON ISSUES:**

### Issue 1: Wrong Root Directory

- **Problem:** Vercel is looking in wrong directory
- **Solution:** Set Root Directory to `client`

### Issue 2: Missing Environment Variables

- **Problem:** API calls failing
- **Solution:** Add VITE_API_BASE_URL environment variable

### Issue 3: Backend Not Running

- **Problem:** Frontend can't connect to backend
- **Solution:** Check if Render backend is running

### Issue 4: Build Errors

- **Problem:** Build failed but deployment shows success
- **Solution:** Check build logs for hidden errors

## 🎯 **QUICK FIXES:**

### Fix 1: Redeploy

1. Go to Vercel Dashboard
2. Click "Redeploy" on latest deployment
3. Wait for build to complete

### Fix 2: Check URL

1. Make sure you're using the correct Vercel URL
2. Try both custom domain and default Vercel URL

### Fix 3: Test Locally

1. Run `cd client && npm run build`
2. Run `cd client && npm run preview`
3. Test if local build works

## 📱 **EXPECTED RESULT:**

After fixing settings:

- ✅ Site loads without white screen
- ✅ Console shows no errors
- ✅ Dashboard displays correctly
- ✅ API calls work to backend

## 🆘 **IF STILL NOT WORKING:**

1. **Check Vercel Status:** https://vercel-status.com
2. **Contact Vercel Support:** https://vercel.com/support
3. **Check Render Backend:** https://ielts-server.onrender.com

**Your IELTS Platform should work after checking these settings!** 🚀
