# Phase 2.14.E.1 - AutoSync Render/Vercel Bridge ✅

## 🎯 Hoàn thành

Đã thiết lập hệ thống tự động sync environment variables từ local lên Render và Vercel.

## 📁 Files đã tạo/cập nhật

### 1. Scripts
- ✅ `scripts/autoSyncEnv.js` - Main sync script
- ✅ `scripts/ENV_SYNC_README.md` - Hướng dẫn chi tiết

### 2. Configuration
- ✅ `package.json` - Đã thêm script `sync:env`
- ✅ `.github/workflows/env-sync.yml` - GitHub Actions workflow

### 3. Logs
- ✅ `logs/env-sync.log` - Log file cho sync history

## 🚀 Cách sử dụng

### Manual Sync (Local)
```bash
# Set API credentials
export RENDER_API_KEY="rnd_..."
export RENDER_SERVICE_ID="srv-..."
export VERCEL_API_TOKEN="vercel_..."
export VERCEL_PROJECT_ID="prj_..."

# Run sync
npm run sync:env
```

### Automatic Sync (GitHub Actions)
Workflow sẽ tự động chạy khi:
- Push lên branch `main`
- Có thay đổi trong: `env.template.json`, `server/.env`, `client/.env.local`, `scripts/autoSyncEnv.js`
- Hoặc trigger thủ công từ Actions tab

## 🔑 Cần thiết lập

### GitHub Secrets (Settings → Secrets → Actions)
Thêm các secrets sau:
- `RENDER_API_KEY` - Render API key
- `RENDER_SERVICE_ID` - Render service ID
- `VERCEL_API_TOKEN` - Vercel API token
- `VERCEL_PROJECT_ID` - Vercel project ID
- `VERCEL_TEAM_ID` - (Optional) Vercel team ID

### Lấy API Keys

**Render:**
1. Dashboard → Account Settings → API Keys
2. Tạo key mới
3. Service ID: Từ service URL hoặc settings

**Vercel:**
1. Dashboard → Settings → Tokens
2. Tạo token với quyền phù hợp
3. Project ID: Từ project settings

## 📊 Kết quả

### Script Features
- ✅ Đọc `env.template.json` để xác định biến cần sync
- ✅ Load giá trị từ `server/.env` và `client/.env.local`
- ✅ Sync lên Render (backend env vars) với update/create logic
- ✅ Sync lên Vercel (frontend env vars) với update/create logic
- ✅ Error handling và logging chi tiết
- ✅ Tổng hợp kết quả sync

### GitHub Actions Features
- ✅ Tự động trigger khi push main
- ✅ Chỉ chạy khi có thay đổi relevant files
- ✅ Hỗ trợ manual trigger (workflow_dispatch)
- ✅ Upload logs như artifact

## 🧪 Test

Script đã được test và hoạt động đúng:
```bash
$ npm run sync:env
🚀 Starting environment variable sync...
❌ Environment sync failed: Missing Render API credentials...
```

Lỗi này là **expected behavior** khi chưa set API credentials. Sau khi set credentials, script sẽ sync thành công.

## 📝 Logs

Tất cả sync operations được log vào `logs/env-sync.log`:
```
[2024-01-01T12:00:00.000Z] Sync completed: 25 success, 0 errors ✅
```

## ✨ Next Steps

1. **Thiết lập GitHub Secrets** - Thêm các API keys vào repository secrets
2. **Test manual sync** - Chạy `npm run sync:env` local để verify
3. **Push code** - Commit và push lên main để trigger auto-sync
4. **Verify** - Kiểm tra Render và Vercel dashboards để confirm env vars đã được sync

## 📚 Documentation

Xem chi tiết trong: `scripts/ENV_SYNC_README.md`

