# 🔧 OpenAI Billing Setup Guide

## 🎯 VẤN ĐỀ HIỆN TẠI:

- **Error**: `You exceeded your current quota, please check your plan and billing details`
- **Error**: `The model gpt-4 does not exist or you do not have access to it`

## 💳 GIẢI PHÁP: SETUP OPENAI BILLING

### **BƯỚC 1: KIỂM TRA ACCOUNT**

1. Truy cập: https://platform.openai.com/account/billing
2. Đăng nhập với tài khoản OpenAI của bạn
3. Kiểm tra "Usage" và "Billing" sections

### **BƯỚC 2: ADD PAYMENT METHOD**

1. Vào "Billing" → "Payment methods"
2. Thêm credit card hoặc PayPal
3. Set spending limit (recommend: $10-20/month)

### **BƯỚC 3: VERIFY API ACCESS**

1. Vào "API Keys" section
2. Tạo new API key nếu cần
3. Copy key và update trong Render environment variables

### **BƯỚC 4: CHECK MODEL ACCESS**

1. Vào "Models" section
2. Đảm bảo có access to:
   - `gpt-3.5-turbo` ✅ (đang dùng)
   - `gpt-4` (nếu cần upgrade)

## 🔧 ALTERNATIVE: SỬA CODE ĐỂ DÙNG FALLBACK

Nếu không muốn setup billing, có thể:

1. Disable AI features
2. Dùng rule-based assessment
3. Hoặc dùng free alternatives

## 📊 COST ESTIMATION:

- **gpt-3.5-turbo**: ~$0.002 per 1K tokens
- **Typical IELTS assessment**: ~500 tokens
- **Cost per assessment**: ~$0.001
- **Monthly cost (1000 assessments)**: ~$1-2

## 🚀 QUICK FIX:

1. Add $5-10 to OpenAI account
2. Update API key in Render
3. Test AI assessment endpoint
