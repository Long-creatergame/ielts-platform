process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.NODE_ENV = 'test';
process.env.PORT = process.env.PORT || '4000';

// Ensure clean teardown: close mongoose connection after tests
const mongoose = require('mongoose');
afterAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  } catch (_) {}
});


