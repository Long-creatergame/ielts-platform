# 🎯 IELTS Platform Demo Accounts

## 📋 Demo Accounts Created

### 1. 🆓 Free User (Đã dùng hết free trial)

- **Email:** demo@ielts.com
- **Password:** demo123456
- **Goal:** Du học
- **Target Band:** 7.5
- **Current Level:** B2
- **Status:** Free trial used, needs payment

### 2. 💎 Premium User (Paid account)

- **Email:** premium@ielts.com
- **Password:** premium123
- **Goal:** Định cư
- **Target Band:** 8.0
- **Current Level:** C1
- **Status:** Premium subscription active

## 🌐 Access URLs

### Main Application

- **Frontend:** http://localhost:5173/
- **Backend API:** http://localhost:4000/api/

### Key Pages to Test

- **Dashboard:** http://localhost:5173/dashboard
- **Pricing:** http://localhost:5173/pricing
- **Test Start:** http://localhost:5173/test/start
- **Profile:** http://localhost:5173/profile
- **Login:** http://localhost:5173/login
- **Register:** http://localhost:5173/register

## 🎮 Demo Scenarios

### Scenario 1: Free User Experience

1. Login với demo@ielts.com / demo123456
2. Xem Dashboard → Sẽ thấy upgrade banner
3. Thử start test → Sẽ hiện paywall modal
4. Click "Nâng cấp ngay" → Đến pricing page
5. Xem các gói pricing

### Scenario 2: Premium User Experience

1. Login với premium@ielts.com / premium123
2. Xem Dashboard → Không có upgrade banner
3. Start test → Không có paywall
4. Xem full results → Tất cả unlocked

### Scenario 3: New User Registration

1. Go to /register
2. Fill form với personalization fields
3. Submit → Auto login
4. Xem personalized dashboard

## 🎯 Features to Test

### ✅ Personalization Features

- Time-based greetings (morning/evening)
- Goal progress visualization
- Level badges (A1-C2)
- Coach messages
- Skill-based recommendations

### ✅ Monetization Features

- Free trial limit (1 test)
- Paywall modal after free trial
- Upgrade banners
- Smart upsell recommendations
- Pricing page with 4 packages
- Payment flow simulation

### ✅ Test Experience

- Level selection (A1-C2)
- Skill-based test routing
- Timer and progress indicators
- Result locking/unlocking
- Personalized feedback

## 🔧 Technical Details

### Backend Routes

- `/api/auth/register` - User registration
- `/api/auth/login` - User login
- `/api/dashboard` - Personalized dashboard data
- `/api/payment/plans` - Pricing plans
- `/api/tests/can-start` - Paywall check
- `/api/upsell/recommendation/:userId` - AI recommendations

### Database Models

- **User:** Enhanced with personalization + monetization fields
- **Test:** Enhanced with payment + locking fields
- **Payment:** New payment tracking
- **Upsell:** AI recommendation system

## 🚀 Quick Start

1. **Start servers:** `npm run dev:full`
2. **Open browser:** http://localhost:5173/
3. **Login with demo accounts above**
4. **Explore all features!**

## 📊 Expected Results

- **Free User:** Sees paywall after 1 test, upgrade prompts
- **Premium User:** Full access, no restrictions
- **New Users:** Personalized onboarding flow
- **All Users:** AI-powered recommendations and feedback

---

**🎉 Enjoy exploring the complete IELTS Platform with personalization and monetization!**
