const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function migrateCollections() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    const db = mongoose.connection.db;

    const oldName = 'testsessions';
    const newName = 'examsessions';

    const collections = await db.listCollections().toArray();
    const hasOld = collections.some(c => c.name === oldName);
    if (!hasOld) {
      console.log('ℹ️ No legacy collection found:', oldName);
      process.exit(0);
    }

    const oldColl = db.collection(oldName);
    const newColl = db.collection(newName);
    const cursor = oldColl.find({});
    let count = 0;
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      await newColl.updateOne({ _id: doc._id }, { $set: doc }, { upsert: true });
      count++;
    }
    console.log(`✅ Migration complete: ${oldName} → ${newName} (${count} docs)`);

    await db.collection(oldName).drop();
    console.log(`🧹 Removed old collection: ${oldName}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  }
}

migrateCollections();


