/**
 * User Results Routes
 * Provides aggregated user test results for dashboard and learning path
 */

const express = require('express');
const Test = require('../models/Test');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Get user's latest test results by skill
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('[UserResults] Fetching results for user:', userId);
    
    // Get all completed tests for the user
    const tests = await Test.find({ 
      userId, 
      completed: true 
    })
    .sort({ dateTaken: -1 })
    .limit(20); // Last 20 tests for average calculation
    
    // Aggregate results by skill
    const skillResults = {
      reading: [],
      listening: [],
      writing: [],
      speaking: []
    };
    
    tests.forEach(test => {
      // Handle both skillBands and totalBand
      if (test.skillBands) {
        Object.entries(test.skillBands).forEach(([skill, band]) => {
          // Handle both number and object formats
          const bandScore = typeof band === 'number' ? band : parseFloat(band);
          if (!isNaN(bandScore)) {
            skillResults[skill].push(bandScore);
          }
        });
      }
    });
    
    // Calculate averages
    const averageResults = {};
    Object.entries(skillResults).forEach(([skill, scores]) => {
      if (scores.length > 0) {
        const sum = scores.reduce((acc, score) => acc + score, 0);
        averageResults[skill] = Math.round((sum / scores.length) * 10) / 10;
      } else {
        averageResults[skill] = 0;
      }
    });
    
    // Get latest test date
    const latestTest = tests.length > 0 ? tests[0] : null;
    
    console.info('[UserResults] Results:', averageResults);
    
    return res.json({
      success: true,
      data: averageResults,
      testCount: tests.length,
      lastTestDate: latestTest?.dateTaken || null
    });
  } catch (error) {
    console.error('[UserResults] Error:', error.message);
    return res.status(200).json({
      success: false,
      message: 'Failed to fetch results',
      data: {
        reading: 0,
        listening: 0,
        writing: 0,
        speaking: 0
      },
      testCount: 0,
      lastTestDate: null
    });
  }
});

// Get user's test history by skill
router.get('/:skill', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { skill } = req.params;
    
    if (!['reading', 'listening', 'writing', 'speaking'].includes(skill)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill'
      });
    }
    
    const tests = await Test.find({
      userId,
      completed: true,
      [`skillBands.${skill}`]: { $exists: true }
    })
    .sort({ dateTaken: -1 })
    .limit(50)
    .select('skillBands totalBand dateTaken createdAt');
    
    const results = tests.map(test => ({
      testId: test._id,
      bandScore: typeof test.skillBands[skill] === 'number' 
        ? test.skillBands[skill] 
        : parseFloat(test.skillBands[skill]),
      totalBand: typeof test.totalBand === 'number' 
        ? test.totalBand 
        : parseFloat(test.totalBand),
      dateTaken: test.dateTaken || test.createdAt
    }));
    
    return res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('[UserResults] Error:', error.message);
    return res.status(200).json({
      success: false,
      message: 'Failed to fetch results',
      data: [],
      count: 0
    });
  }
});

// Get full band history timeline for all skills
router.get('/history/timeline', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    console.info('[BandHistory] Fetching band timeline for user:', userId);
    
    // Get all completed tests
    const tests = await Test.find({
      userId,
      completed: true
    })
    .sort({ dateTaken: 1 }) // Chronological order
    .limit(100) // Last 100 tests
    .select('skillBands dateTaken createdAt');
    
    // Aggregate by skill
    const skillHistory = {
      reading: [],
      listening: [],
      writing: [],
      speaking: []
    };
    
    tests.forEach(test => {
      const testDate = test.dateTaken || test.createdAt;
      
      if (test.skillBands) {
        Object.entries(test.skillBands).forEach(([skill, band]) => {
          const bandScore = typeof band === 'number' ? band : parseFloat(band);
          if (!isNaN(bandScore) && bandScore > 0) {
            skillHistory[skill].push({
              band: bandScore,
              date: testDate.toISOString().split('T')[0], // YYYY-MM-DD format
              timestamp: testDate
            });
          }
        });
      }
    });
    
    // Sort each skill's history by date
    Object.keys(skillHistory).forEach(skill => {
      skillHistory[skill].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });
    
    console.info('[BandHistory] Loaded timeline:', {
      reading: skillHistory.reading.length,
      listening: skillHistory.listening.length,
      writing: skillHistory.writing.length,
      speaking: skillHistory.speaking.length
    });
    
    return res.json({
      success: true,
      data: skillHistory
    });
  } catch (error) {
    console.error('[BandHistory] Error:', error.message);
    return res.status(200).json({
      success: false,
      message: 'Failed to fetch band history',
      data: {
        reading: [],
        listening: [],
        writing: [],
        speaking: []
      }
    });
  }
});

module.exports = router;
