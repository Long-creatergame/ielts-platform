#!/bin/bash

# 🚀 Vercel Auto-Deploy Script for IELTS Platform

echo "🚀 Starting Vercel deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: IELTS Platform with Vercel config"
fi

# Check if remote exists
if ! git remote | grep -q origin; then
    echo "🔗 Please add your GitHub remote:"
    echo "git remote add origin https://github.com/yourusername/ielts-platform.git"
    echo "git push -u origin main"
    exit 1
fi

echo "📤 Pushing to GitHub..."
git add .
git commit -m "auto-fix: corrected vercel vite build config"
git push origin main

echo "✅ Code pushed to GitHub!"
echo ""
echo "🌐 Next Steps for Vercel:"
echo "1. Go to https://vercel.com"
echo "2. Import your GitHub repository"
echo "3. Configure settings:"
echo "   - Framework: Vite"
echo "   - Root Directory: client"
echo "   - Build Command: npm run build"
echo "   - Output Directory: dist"
echo "4. Add Environment Variables:"
echo "   - VITE_API_BASE_URL=https://ielts-server.onrender.com"
echo "   - VITE_STRIPE_PUBLIC_KEY=pk_test_..."
echo "5. Deploy"
echo ""
echo "🎉 Vercel deployment ready!"
