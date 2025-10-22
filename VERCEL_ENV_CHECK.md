# 🔍 VERCEL ENVIRONMENT VARIABLES CHECK

## ❌ **VẤN ĐỀ CHÍNH:**

Frontend đang sử dụng `import.meta.env.VITE_API_BASE_URL` để gọi API, nhưng environment variable này có thể chưa được set đúng trên Vercel.

## 🔧 **KIỂM TRA VERCEL ENVIRONMENT VARIABLES:**

### **BƯỚC 1: Kiểm tra Vercel Project Settings**
1. Vào **https://vercel.com/dashboard**
2. Click vào project **ielts-platform-two**
3. Click tab **"Settings"**
4. Click **"Environment Variables"** ở sidebar trái

### **BƯỚC 2: Kiểm tra các biến môi trường cần có:**
```
VITE_API_BASE_URL = https://ielts-platform-emrv.onrender.com/api
VITE_STRIPE_PUBLIC_KEY = pk_test_...
```

### **BƯỚC 3: Nếu thiếu hoặc sai:**
1. Click **"Add New"**
2. Thêm:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `https://ielts-platform-emrv.onrender.com/api`
   - **Environment:** Production, Preview, Development
3. Click **"Save"**

### **BƯỚC 4: Redeploy Vercel**
Sau khi thêm environment variables:
1. Click tab **"Deployments"**
2. Click **"Redeploy"** trên deployment mới nhất
3. Chọn **"Use existing Build Cache"** = OFF
4. Click **"Redeploy"**

## 🎯 **KIỂM TRA SAU KHI FIX:**

1. Mở **https://ielts-platform-two.vercel.app/register**
2. Mở **Developer Tools** (F12)
3. Vào tab **"Console"**
4. Thử đăng ký tài khoản
5. Kiểm tra xem có lỗi CORS không

## 🚨 **NẾU VẪN CÓ LỖI CORS:**

Nếu vẫn có lỗi CORS sau khi fix environment variables, thì vấn đề là Render backend vẫn chưa deploy code mới. Trong trường hợp này:

1. **Manual redeploy Render** với "Clear build cache & deploy"
2. Hoặc **tạo tài khoản demo** để test

## 💡 **GIẢI PHÁP TẠM THỜI:**

Nếu không thể fix ngay, có thể dùng tài khoản demo đã tạo:

**Email:** testuser@example.com  
**Password:** 123456

**Email:** testuser2@example.com  
**Password:** 123456
