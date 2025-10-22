# 🚨 MANUAL RENDER REDEPLOY - CORS FIX

## ❌ **VẤN ĐỀ:**

CORS vẫn chưa được fix. Backend vẫn trả về `access-control-allow-origin: http://localhost:5173` thay vì cho phép Vercel domain.

## ✅ **GIẢI PHÁP: MANUAL REDEPLOY TRÊN RENDER**

### **Bước 1: Vào Render Dashboard**

1. Mở browser và vào: https://dashboard.render.com
2. Login vào tài khoản Render của bạn
3. Tìm service backend của IELTS Platform (tên có thể là `ielts-platform` hoặc `ielts-server`)

### **Bước 2: Manual Redeploy**

1. Click vào service backend của bạn
2. Tìm nút **"Manual Deploy"** (thường ở góc trên bên phải)
3. Click **"Manual Deploy"**
4. Chọn **"Clear Build Cache & Deploy"**
5. Click **"Deploy"**

### **Bước 3: Đợi Deployment Hoàn Thành**

- Render sẽ build lại toàn bộ backend
- Quá trình này mất khoảng 2-3 phút
- Bạn sẽ thấy logs deployment real-time

### **Bước 4: Test CORS**

Sau khi deployment hoàn thành, test lại:

```bash
curl -I -X OPTIONS https://ielts-platform-emrv.onrender.com/api/auth/register \
  -H "Origin: https://ielts-platform-two.vercel.app"
```

**Kết quả mong đợi:** `access-control-allow-origin: https://ielts-platform-two.vercel.app`

### **Bước 5: Test Frontend**

1. Vào https://ielts-platform-two.vercel.app
2. Thử đăng ký tài khoản mới
3. Kiểm tra browser console - không còn CORS errors

## 🔧 **TẠI SAO CẦN MANUAL REDEPLOY?**

- Render có thể chưa tự động deploy changes
- Có thể có cache issues
- Manual redeploy sẽ force build lại toàn bộ code mới

## 🎯 **KẾT QUẢ MONG ĐỢI:**

✅ **Không còn CORS errors**  
✅ **Đăng ký/đăng nhập hoạt động**  
✅ **Frontend kết nối được với backend**  
✅ **Tất cả chức năng hoạt động bình thường**

## 🚀 **HÀNH ĐỘNG NGAY:**

**Hãy manual redeploy trên Render ngay bây giờ!** Đây là cách nhanh nhất để fix CORS issue.
