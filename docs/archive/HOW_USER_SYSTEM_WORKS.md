# 🎯 HỆ THỐNG ĐĂNG KÝ/ĐĂNG NHẬP IELTS PLATFORM

## 📋 **TỔNG QUAN HỆ THỐNG:**

### **1. ĐĂNG KÝ TÀI KHOẢN MỚI:**

**API Endpoint:** `POST /api/auth/register`

**Dữ liệu gửi lên:**

```json
{
  "name": "Tên người dùng",
  "email": "email@example.com",
  "password": "mật khẩu",
  "goal": "Thử sức", // Du học, Định cư, Việc làm, Thử sức
  "targetBand": 6.5, // Band mục tiêu (4.0 - 9.0)
  "currentLevel": "A2" // A1, A2, B1, B2, C1, C2
}
```

**Quy trình xử lý:**

1. ✅ **Validation:** Kiểm tra đầy đủ thông tin, email unique, password >= 6 ký tự
2. ✅ **Hash Password:** Tự động mã hóa password bằng bcrypt
3. ✅ **Lưu Database:** Tạo user mới trong MongoDB với schema đầy đủ
4. ✅ **Generate JWT:** Tạo token JWT có thời hạn 7 ngày
5. ✅ **Response:** Trả về token + thông tin user (không có password)

**Dữ liệu trả về:**

```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "68f84657a719946822f1d26a",
    "name": "Demo User",
    "email": "demo@example.com",
    "goal": "Thử sức",
    "targetBand": 6.5,
    "currentLevel": "A2"
  }
}
```

### **2. ĐĂNG NHẬP TÀI KHOẢN:**

**API Endpoint:** `POST /api/auth/login`

**Dữ liệu gửi lên:**

```json
{
  "email": "email@example.com",
  "password": "mật khẩu"
}
```

**Quy trình xử lý:**

1. ✅ **Find User:** Tìm user theo email trong database
2. ✅ **Verify Password:** So sánh password với hash đã lưu
3. ✅ **Generate JWT:** Tạo token mới có thời hạn 7 ngày
4. ✅ **Response:** Trả về token + thông tin user đầy đủ

**Dữ liệu trả về:**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "68f84657a719946822f1d26a",
    "name": "Demo User",
    "email": "demo@example.com",
    "goal": "Thử sức",
    "targetBand": 6.5,
    "currentLevel": "A2",
    "streakDays": 0,
    "totalTests": 0,
    "averageBand": 0
  }
}
```

### **3. XÁC THỰC TOKEN:**

**API Endpoint:** `GET /api/auth/profile`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Quy trình xử lý:**

1. ✅ **Extract Token:** Lấy token từ header Authorization
2. ✅ **Verify JWT:** Xác thực token với JWT_SECRET
3. ✅ **Find User:** Tìm user theo userId trong token
4. ✅ **Response:** Trả về thông tin user profile

### **4. DATABASE SCHEMA:**

**User Model trong MongoDB:**

```javascript
{
  name: String,           // Tên người dùng
  email: String,          // Email (unique)
  password: String,       // Password đã hash
  avatar: String,         // Avatar URL
  goal: String,           // Mục tiêu: Du học, Định cư, Việc làm, Thử sức
  targetBand: Number,     // Band mục tiêu (4.0-9.0)
  currentLevel: String,   // Trình độ hiện tại: A1, A2, B1, B2, C1, C2
  testsTaken: [ObjectId], // Danh sách test đã làm
  streakDays: Number,     // Số ngày liên tiếp luyện tập
  totalTests: Number,     // Tổng số test đã làm
  averageBand: Number,    // Band trung bình
  paid: Boolean,          // Đã thanh toán chưa
  freeTestsUsed: Number,  // Số test miễn phí đã dùng
  subscriptionPlan: String, // Gói đăng ký: free, standard, premium, ultimate
  subscriptionExpires: Date, // Ngày hết hạn subscription
  totalSpent: Number,     // Tổng số tiền đã chi
  lastActiveDate: Date,   // Ngày hoạt động cuối cùng
  createdAt: Date,        // Ngày tạo
  updatedAt: Date         // Ngày cập nhật
}
```

### **5. BẢO MẬT:**

**Password Security:**

- ✅ **bcrypt hash:** Password được hash với salt rounds = 12
- ✅ **Pre-save hook:** Tự động hash password trước khi lưu
- ✅ **Never expose:** Password không bao giờ trả về trong response

**JWT Security:**

- ✅ **7-day expiry:** Token có thời hạn 7 ngày
- ✅ **Secret key:** Sử dụng JWT_SECRET từ environment
- ✅ **User verification:** Mỗi request đều verify user tồn tại

### **6. DEMO ACCOUNTS:**

**Tài khoản đã tạo:**

- **Email:** demo@example.com
- **Password:** password123
- **Name:** Demo User
- **Goal:** Thử sức
- **Target Band:** 6.5
- **Current Level:** A2

### **7. FRONTEND INTEGRATION:**

**AuthContext trong React:**

```javascript
// Lưu token và user info vào localStorage
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));

// Gửi token trong mọi request
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### **8. CORS ISSUE:**

**Vấn đề hiện tại:**

- ❌ **CORS preflight:** Browser block OPTIONS request
- ❌ **Backend response:** Vẫn trả về localhost origin
- ✅ **API functionality:** Đăng ký/đăng nhập hoạt động hoàn hảo

**Giải pháp:**

- Cần manual redeploy trên Render để fix CORS
- Sau khi fix CORS, frontend sẽ hoạt động 100%

## 🎯 **KẾT LUẬN:**

✅ **Hệ thống đăng ký/đăng nhập đã hoàn chỉnh và hoạt động tốt**
✅ **Database lưu trữ user đầy đủ và bảo mật**
✅ **JWT authentication hoạt động chính xác**
✅ **Chỉ cần fix CORS để frontend hoạt động**

**Tài khoản demo đã sẵn sàng để test:**

- Email: demo@example.com
- Password: password123
