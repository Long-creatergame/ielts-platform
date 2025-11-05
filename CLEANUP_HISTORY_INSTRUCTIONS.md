# 🧹 Git History Cleanup Instructions

## ⚠️ Important

Các file `.env` vẫn còn trong Git history. Để hoàn toàn loại bỏ và khôi phục push access, bạn cần clean Git history.

---

## 🚀 Option 1: Using git-filter-repo (Recommended)

### Step 1: Install git-filter-repo

```bash
# macOS
brew install git-filter-repo

# Linux
pip install git-filter-repo

# Or via pip globally
pip3 install git-filter-repo
```

### Step 2: Clean History

```bash
cd /Users/antoree/Downloads/ielts-platform

# Clean .env files from entire history
git filter-repo --path .env --path server/.env --path client/.env --path client/.env.local --invert-paths --force

# Verify cleanup
git log --all --oneline | grep -i "env\|secret\|key" | head -10
```

### Step 3: Force Push

```bash
git push origin main --force
```

---

## 🚀 Option 2: Using git filter-branch (Alternative)

### Step 1: Backup

```bash
cd /Users/antoree/Downloads/ielts-platform
git branch backup-before-cleanup-$(date +%Y%m%d)
```

### Step 2: Clean History

```bash
# Remove .env files from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env server/.env client/.env client/.env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Clean up refs
git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d

# Expire reflog
git reflog expire --expire=now --all

# Garbage collection
git gc --prune=now --aggressive
```

### Step 3: Force Push

```bash
git push origin main --force
```

---

## 🚀 Option 3: Using BFG Repo-Cleaner (Fastest)

### Step 1: Install BFG

```bash
# macOS
brew install bfg

# Or download from: https://rtyley.github.io/bfg-repo-cleaner/
```

### Step 2: Clean History

```bash
cd /Users/antoree/Downloads/ielts-platform

# Clean .env files
bfg --delete-files .env
bfg --delete-files server/.env
bfg --delete-files client/.env
bfg --delete-files client/.env.local

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Step 3: Force Push

```bash
git push origin main --force
```

---

## ✅ Verification

After cleanup, verify:

```bash
# Check no .env files in history
git log --all --oneline --name-only | grep -E "\.env$" | head -10

# Should return nothing or very few results (from old commits)

# Check current tracking
git ls-files | grep .env

# Should return nothing (except node_modules)
```

---

## 🧪 Test Push

After force push, test:

```bash
git commit --allow-empty -m "test: verify push protection after cleanup"
git push
```

**Expected:** ✅ No GH013 error, push succeeds

---

## ⚠️ Warnings

1. **Force push will rewrite history** - All team members need to re-clone
2. **Backup first** - Create backup branch before cleanup
3. **Notify team** - Let team know about history rewrite
4. **Branch protection** - May need to temporarily disable branch protection

---

## 📝 After Cleanup

1. ✅ Verify push works without GH013 error
2. ✅ Test Render auto-deploy
3. ✅ Test Vercel auto-deploy
4. ✅ Confirm secrets are in dashboards only

---

**Choose the method you prefer and execute. All methods will remove .env files from Git history.**

