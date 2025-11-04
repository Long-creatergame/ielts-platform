// scripts/cleanupIndexes.js
// Cleanup duplicate MongoDB indexes to remove Render warnings
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

(async () => {
  try {
    console.log('🧹 Starting Mongo duplicate index cleanup...');
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI is missing from environment');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const collections = await mongoose.connection.db.collections();
    let totalRemoved = 0;

    for (const col of collections) {
      try {
        const indexes = await col.indexes();
        // Heuristic: often duplicate compound indexes are suffixed like _1_1 by Mongoose when declared twice
        const duplicateIndexes = (indexes || []).filter((i) => i?.name && i.name.includes('_1_1'));

        if (duplicateIndexes.length > 0) {
          console.log(`\n📦 Collection: ${col.collectionName}`);
          for (const idx of duplicateIndexes) {
            try {
              await col.dropIndex(idx.name);
              totalRemoved++;
              console.log(`   🗑️ Removed index: ${idx.name}`);
            } catch (err) {
              console.log(`   ⚠️ Skip index ${idx.name}: ${err.message}`);
            }
          }
        }
      } catch (err) {
        console.log(`⚠️  Could not list indexes for ${col.collectionName}: ${err.message}`);
      }
    }

    await mongoose.disconnect();
    console.log(`\n✅ Cleanup complete! Removed ${totalRemoved} duplicate indexes.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    try { await mongoose.disconnect(); } catch (_) {}
    process.exit(1);
  }
})();


