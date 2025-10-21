#!/bin/bash

# 🚀 IELTS Platform Deployment Script

echo "🚀 Starting IELTS Platform Deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: IELTS Platform"
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
git commit -m "Deploy: Production ready IELTS Platform"
git push origin main

echo "✅ Code pushed to GitHub!"
echo ""
echo "🌐 Next Steps:"
echo "1. Go to https://render.com"
echo "2. Create new Web Service"
echo "3. Connect your GitHub repo"
echo "4. Set Root Directory: /server"
echo "5. Add environment variables"
echo "6. Deploy backend"
echo ""
echo "7. Go to https://vercel.com"
echo "8. Import your GitHub repo"
echo "9. Set Root Directory: /client"
echo "10. Add environment variables"
echo "11. Deploy frontend"
echo ""
echo "🎉 Deployment complete!"
