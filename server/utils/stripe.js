const path = require("path");
const dotenv = require("dotenv");

// ✅ Load .env chính xác từ thư mục gốc server
dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log("🔍 Stripe key check:", process.env.STRIPE_SECRET_KEY ? "Loaded ✅" : "Not found ❌");

const Stripe = require("stripe");

// ✅ Nếu vẫn lỗi, dòng log trên sẽ giúp ta biết
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

module.exports = stripe;