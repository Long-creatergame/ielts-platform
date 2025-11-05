const mongoose = require('mongoose');
const connectDB = require('../server/database');
const User = require('../server/models/User');

(async () => {
  try {
    await connectDB();
    const users = await User.find({});
    let fixed = 0;
    for (const user of users) {
      // Normalize invalid or undefined goals to null
      if (user.goal === undefined || user.goal === 'undefined' || user.goal === '' || isNaN(Number(user.goal))) {
        user.goal = null;
        await user.save();
        fixed += 1;
        console.log(`Fixed goal for ${user.email}`);
      }
    }
    console.log(`\n✅ Migration complete. Fixed ${fixed} users.`);
    process.exit(0);
  } catch (e) {
    console.error('Migration error:', e);
    process.exit(1);
  }
})();


