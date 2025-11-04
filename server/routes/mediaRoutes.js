const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

/**
 * Media proxy endpoint for audio and image files
 * GET /api/media/audio/:id
 * GET /api/media/image/:id
 */
router.get('/:type/:id', (req, res) => {
  try {
    const { type, id } = req.params;
    
    // Determine base path based on type
    let basePath;
    if (type === 'audio') {
      basePath = path.join(process.cwd(), 'public', 'audio', 'cambridge');
    } else if (type === 'image') {
      basePath = path.join(process.cwd(), 'public', 'images', 'charts');
    } else {
      return res.status(400).json({ error: 'Invalid media type. Use "audio" or "image".' });
    }

    const filePath = path.join(basePath, id);

    // Security: prevent directory traversal
    if (!filePath.startsWith(basePath)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.warn(`[MediaRoute] File not found: ${filePath}`);
      return res.status(404).json({ error: 'Media not found' });
    }

    // Set appropriate content type
    const ext = path.extname(id).toLowerCase();
    const contentType = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    }[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Send file
    res.sendFile(filePath);
  } catch (error) {
    console.error('[MediaRoute] Error serving media:', error.message);
    res.status(500).json({ error: 'Failed to serve media file' });
  }
});

module.exports = router;

