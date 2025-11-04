// Migration script to add weakSkills field to existing LearningPath documents
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const LearningPath = require('../models/LearningPath');

async function migrate() {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('❌ MONGO_URI not found');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Update all LearningPath documents that don't have weakSkills
    const result = await LearningPath.updateMany(
      { weakSkills: { $exists: false } },
      { $set: { weakSkills: [] } }
    );

    console.log(`✅ Updated ${result.modifiedCount} LearningPath documents with weakSkills field`);
    
    // Also sync from weaknesses array if exists
    const pathsWithWeaknesses = await LearningPath.find({ 
      weaknesses: { $exists: true, $ne: [] },
      $or: [
        { weakSkills: { $exists: false } },
        { weakSkills: { $size: 0 } }
      ]
    });

    for (const path of pathsWithWeaknesses) {
      if (path.weaknesses && path.weaknesses.length > 0) {
        path.weakSkills = path.weaknesses;
        await path.save();
      }
    }

    console.log(`✅ Synced ${pathsWithWeaknesses.length} documents from weaknesses to weakSkills`);

    await mongoose.connection.close();
    console.log('✅ Migration completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrate();

