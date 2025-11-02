/**
 * User Results Routes
 * Provides aggregated user test results for dashboard and learning path
 */

const express = require('express');
const Test = require('../models/Test');
const auth = require('../middleware/auth');

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

module.exports = router;
