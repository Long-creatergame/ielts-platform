#!/bin/bash

# Clean secrets from Git history using git filter-branch
# This script removes .env files from entire Git history

echo "🧹 Starting Git history cleanup for .env files..."

# Backup current branch
echo "📦 Creating backup branch..."
git branch backup-before-cleanup

# Remove .env files from all commits
echo "🧼 Removing .env files from Git history..."
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env server/.env client/.env client/.env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Clean up refs
echo "🧹 Cleaning up refs..."
git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d

# Expire reflog
echo "🗑️  Expiring reflog..."
git reflog expire --expire=now --all

# Garbage collection
echo "🗑️  Running garbage collection..."
git gc --prune=now --aggressive

echo "✅ Git history cleanup complete!"
echo "⚠️  Next step: git push origin main --force"

