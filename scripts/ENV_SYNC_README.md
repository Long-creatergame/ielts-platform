# Environment Variable Auto-Sync

Tự động đồng bộ environment variables từ file `.env` local lên Render và Vercel.

## 🚀 Cách sử dụng

### 1. Cài đặt API Keys

#### Render API
1. Vào [Render Dashboard](https://dashboard.render.com/) → Account Settings → API Keys
2. Tạo API Key mới
3. Lấy Service ID từ service settings (URL: `https://dashboard.render.com/web/[SERVICE_ID]`)

#### Vercel API
1. Vào [Vercel Dashboard](https://vercel.com/dashboard) → Settings → Tokens
2. Tạo token mới với quyền `Full Account` hoặc `Project`
3. Lấy Project ID từ project settings

### 2. Thiết lập Environment Variables

**Cho local testing:**
```bash
export RENDER_API_KEY="rnd_..."
export RENDER_SERVICE_ID="srv-..."
export VERCEL_API_TOKEN="vercel_..."
export VERCEL_PROJECT_ID="prj_..."
export VERCEL_TEAM_ID="team_..." # Optional, chỉ cần nếu project trong team
```

**Cho GitHub Actions:**
Thêm các secrets vào GitHub repository:
- Settings → Secrets and variables → Actions → New repository secret
- Thêm: `RENDER_API_KEY`, `RENDER_SERVICE_ID`, `VERCEL_API_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID` (optional)

### 3. Chạy sync thủ công

```bash
npm run sync:env
```

Script sẽ:
1. Đọc `env.template.json` để lấy danh sách biến cần sync
2. Load giá trị từ `server/.env` và `client/.env.local`
3. Sync lên Render (backend env vars)
4. Sync lên Vercel (frontend env vars)
5. Ghi log vào `logs/env-sync.log`

### 4. Tự động sync qua GitHub Actions

Khi push code lên branch `main`, workflow sẽ tự động chạy nếu có thay đổi:
- `env.template.json`
- `server/.env`
- `client/.env.local`
- `scripts/autoSyncEnv.js`

Hoặc có thể trigger thủ công:
- Vào Actions tab → "AutoSync Environment" → Run workflow

## 📋 Template Structure

File `env.template.json` định nghĩa các biến cần sync:

```json
{
  "render": [
    "MONGO_URI",
    "OPENAI_API_KEY",
    ...
  ],
  "vercel": [
    "VITE_API_BASE_URL",
    "VITE_STRIPE_PUBLIC_KEY",
    ...
  ]
}
```

## 🔍 Logging

Tất cả các lần sync đều được ghi vào `logs/env-sync.log`:
```
[2024-01-01T12:00:00.000Z] Sync completed: 25 success, 0 errors ✅
```

## ⚠️ Lưu ý

1. Script sẽ **update** env var nếu đã tồn tại, **create** nếu chưa có
2. Chỉ sync các biến có giá trị trong file `.env` local
3. Render và Vercel API có rate limit, script sẽ xử lý lỗi và tiếp tục với các biến khác
4. Vercel env vars được set với `target: ["production"]` và `type: "encrypted"`

## 🐛 Troubleshooting

**Lỗi "Missing Render API credentials"**
- Kiểm tra `RENDER_API_KEY` và `RENDER_SERVICE_ID` đã được set chưa

**Lỗi "Missing Vercel API credentials"**
- Kiểm tra `VERCEL_API_TOKEN` và `VERCEL_PROJECT_ID` đã được set chưa

**Lỗi "Failed to sync"**
- Kiểm tra API key có đủ quyền không
- Kiểm tra Service ID / Project ID có đúng không
- Xem chi tiết lỗi trong `logs/env-sync.log`

