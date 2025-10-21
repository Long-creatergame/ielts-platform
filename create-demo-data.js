const mongoose = require('mongoose');
const User = require('./server/models/User');
const Test = require('./server/models/Test');
require('dotenv').config();

async function createDemoData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create demo user
    const demoUser = new User({
      name: 'Demo User',
      email: 'demo@ielts.com',
      password: 'demo123456',
      goal: 'Du học',
      targetBand: 7.5,
      currentLevel: 'B2',
      freeTestsUsed: 1, // Already used free trial
      paid: false,
      subscriptionPlan: 'free',
      totalSpent: 0,
      streakDays: 5,
      totalTests: 1,
      averageBand: 6.8
    });

    await demoUser.save();
    console.log('✅ Demo user created:', demoUser._id);

    // Create demo test
    const demoTest = new Test({
      userId: demoUser._id,
      level: 'B2',
      skill: 'reading',
      totalBand: 6.8,
      skillBands: {
        reading: 7.0,
        listening: 6.5,
        writing: 6.5,
        speaking: 7.0
      },
      isPaid: false,
      resultLocked: true,
      price: 29000,
      feedbackUnlocked: false,
      feedback: 'Bạn làm tốt phần Reading và Speaking, nhưng Listening và Writing cần cải thiện thêm.',
      coachMessage: '🎯 Gần đạt mục tiêu rồi! Bạn chỉ còn thiếu 0.7 band nữa để đạt Band 7.5.',
      completed: true
    });

    await demoTest.save();
    console.log('✅ Demo test created:', demoTest._id);

    // Create paid user for comparison
    const paidUser = new User({
      name: 'Premium User',
      email: 'premium@ielts.com',
      password: 'premium123',
      goal: 'Định cư',
      targetBand: 8.0,
      currentLevel: 'C1',
      freeTestsUsed: 1,
      paid: true,
      subscriptionPlan: 'premium',
      totalSpent: 249000,
      streakDays: 12,
      totalTests: 8,
      averageBand: 7.8
    });

    await paidUser.save();
    console.log('✅ Premium user created:', paidUser._id);

    // Create paid test
    const paidTest = new Test({
      userId: paidUser._id,
      level: 'C1',
      skill: 'writing',
      totalBand: 7.8,
      skillBands: {
        reading: 8.0,
        listening: 7.5,
        writing: 7.5,
        speaking: 8.0
      },
      isPaid: true,
      resultLocked: false,
      price: 0,
      feedbackUnlocked: true,
      feedback: 'Xuất sắc! Bạn đã đạt Band 7.8, gần với mục tiêu 8.0. Tiếp tục luyện tập để đạt band cao hơn.',
      coachMessage: '🔥 Tuyệt vời! Bạn đã vượt mục tiêu ban đầu. Hãy thử đặt mục tiêu Band 8.5!',
      completed: true
    });

    await paidTest.save();
    console.log('✅ Premium test created:', paidTest._id);

    console.log('\n🎉 Demo data created successfully!');
    console.log('\n📋 Demo Accounts:');
    console.log('1. Free User: demo@ielts.com / demo123456');
    console.log('2. Premium User: premium@ielts.com / premium123');
    console.log('\n🌐 Access URLs:');
    console.log('- Main App: http://localhost:5173/');
    console.log('- Pricing: http://localhost:5173/pricing');
    console.log('- Dashboard: http://localhost:5173/dashboard');

  } catch (error) {
    console.error('❌ Error creating demo data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

createDemoData();
