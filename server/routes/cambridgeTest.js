const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.get('/:skill/:setId', async (req, res) => {
  try {
    const { skill, setId } = req.params;
    const skillSafe = String(skill).toLowerCase();
    const fileMap = {
      reading: 'readingCambridge.json',
      listening: 'listeningCambridge.json',
      writing: 'writingCambridge.json',
      speaking: 'speakingCambridge.json'
    };
    const filename = fileMap[skillSafe];
    if (!filename) {
      return res.status(400).json({ success: false, message: 'Invalid skill' });
    }
    const dataPath = path.join(__dirname, `../data/cambridge/${filename}`);
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const testSet = data.setId === setId ? data : null;
    if (!testSet) return res.status(404).json({ success: false, message: 'Set not found' });

    // Fallback media
    if (skillSafe === 'listening') {
      if (Array.isArray(testSet.sections)) {
        testSet.sections = testSet.sections.map((sec) => ({
          ...sec,
          audioUrl: sec.audioUrl || '/audio/cambridge/default_listening.mp3'
        }));
      }
    }
    if (skillSafe === 'writing') {
      if (testSet.task1 && !testSet.task1.image) {
        testSet.task1.image = '/images/charts/default_chart.png';
      }
    }

    res.json({ success: true, data: testSet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;


