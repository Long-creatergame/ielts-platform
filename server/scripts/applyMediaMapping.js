const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const CambridgeTest = require('../models/CambridgeTest');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mappingPath = path.resolve('./server/data/cambridge/mediaMapping.json');
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

async function applyMediaMapping() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB ✅');

    const { listening = [], writing = [] } = mapping;

    for (const item of listening) {
      const test = await CambridgeTest.findOne({ skill: 'listening', setId: item.setId });
      if (test) {
        test.audio_urls = item.audio_urls;
        await test.save();
        console.log(`🎧 Updated audio for ${item.setId}`);
      }
    }

    for (const item of writing) {
      const test = await CambridgeTest.findOne({ skill: 'writing', setId: item.setId });
      if (test) {
        test.image_urls = item.image_urls;
        await test.save();
        console.log(`🖼️ Updated images for ${item.setId}`);
      }
    }

    console.log('✅ Media mapping applied successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error applying media mapping:', err.message);
    process.exit(1);
  }
}

applyMediaMapping();


