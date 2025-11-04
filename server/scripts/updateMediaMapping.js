const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const CambridgeTest = require('../models/CambridgeTest');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mediaBasePath = '/audio/cambridge/';
const imageBasePath = '/images/writing/';

async function syncMedia() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const listeningTests = await CambridgeTest.find({ skill: 'listening' });
    for (const test of listeningTests) {
      const base = (test.setId || 'test1').toLowerCase();
      test.audio_urls = [1,2,3,4].map(n => `${mediaBasePath}${base}_section${n}.mp3`);
      await test.save();
      console.log(`🎧 Updated listening media for setId=${test.setId || 'N/A'}`);
    }

    const writingTests = await CambridgeTest.find({ skill: 'writing' });
    for (const test of writingTests) {
      test.image_urls = [`${imageBasePath}task1_bar_chart.png`];
      await test.save();
      console.log(`🖼️  Updated writing media for setId=${test.setId || 'N/A'}`);
    }

    await mongoose.disconnect();
    console.log('✅ Media mapping completed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Media mapping error:', err.message);
    process.exit(1);
  }
}

syncMedia();


