const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Serve audio files
router.get('/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const audioPath = path.join(__dirname, '../public/audio', filename);
    
    // Check if file exists
    if (!fs.existsSync(audioPath)) {
      return res.status(404).json({ error: 'Audio file not found' });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');
    
    // Stream the audio file
    const audioStream = fs.createReadStream(audioPath);
    audioStream.pipe(res);
    
  } catch (error) {
    console.error('Audio serving error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get available audio files
router.get('/list', (req, res) => {
  try {
    const audioDir = path.join(__dirname, '../public/audio');
    
    if (!fs.existsSync(audioDir)) {
      // Create audio directory if it doesn't exist
      fs.mkdirSync(audioDir, { recursive: true });
    }
    
    const files = fs.readdirSync(audioDir)
      .filter(file => file.endsWith('.mp3') || file.endsWith('.wav'))
      .map(file => ({
        filename: file,
        url: `/api/audio/${file}`,
        size: fs.statSync(path.join(audioDir, file)).size
      }));
    
    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('List audio files error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
