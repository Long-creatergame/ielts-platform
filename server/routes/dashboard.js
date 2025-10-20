const express = require('express');
const router = express.Router();
const ReadingResult = require('../models/ReadingResult');
const ListeningResult = require('../models/ListeningResult');
const EssayResult = require('../models/EssayResult');
const Task1Result = require('../models/Task1Result');
const SpeakingResult = require('../models/SpeakingResult');
const { authMiddleware } = require('./auth');

// Helper function to calculate average
const calcAvg = (arr, field) => {
  if (!arr || arr.length === 0) return 0;
  const validItems = arr.filter(item => item[field] !== null && item[field] !== undefined);
  if (validItems.length === 0) return 0;
  return validItems.reduce((a, b) => a + (b[field] || 0), 0) / validItems.length;
};

// GET /api/dashboard/overview/:userId (supports both authenticated and guest users)
router.get('/overview/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch all test results
    const [readingResults, listeningResults, essayResults, task1Results, speakingResults] = await Promise.all([
      ReadingResult.find({ userId }),
      ListeningResult.find({ userId }),
      EssayResult.find({ userId }),
      Task1Result.find({ userId }),
      SpeakingResult.find({ userId })
    ]);

    // Calculate averages
    const readingBand = calcAvg(readingResults, 'bandScore');
    const listeningBand = calcAvg(listeningResults, 'bandScore');
    
    // For writing, combine both Task 1 and Task 2 results
    const allWritingResults = [...essayResults, ...task1Results];
    const writingBand = calcAvg(allWritingResults, 'score');
    
    const speakingBand = calcAvg(speakingResults, 'overall');

    const overview = {
      userId,
      readingBand: parseFloat(readingBand.toFixed(1)),
      listeningBand: parseFloat(listeningBand.toFixed(1)),
      writingBand: parseFloat(writingBand.toFixed(1)),
      speakingBand: parseFloat(speakingBand.toFixed(1)),
      totalTests: readingResults.length + listeningResults.length + allWritingResults.length + speakingResults.length
    };

    // Calculate overall band
    const validBands = [overview.readingBand, overview.listeningBand, overview.writingBand, overview.speakingBand].filter(band => band > 0);
    overview.overallBand = validBands.length > 0 ? parseFloat((validBands.reduce((a, b) => a + b, 0) / validBands.length).toFixed(1)) : 0;

    res.json({
      message: 'IELTS Overview fetched successfully',
      overview
    });
  } catch (err) {
    console.error('Dashboard overview error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/dashboard/history/:userId
router.get('/history/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const [readingResults, listeningResults, essayResults, task1Results, speakingResults] = await Promise.all([
      ReadingResult.find({ userId }).sort({ createdAt: -1 }).limit(5),
      ListeningResult.find({ userId }).sort({ createdAt: -1 }).limit(5),
      EssayResult.find({ userId }).sort({ createdAt: -1 }).limit(5),
      Task1Result.find({ userId }).sort({ createdAt: -1 }).limit(5),
      SpeakingResult.find({ userId }).sort({ createdAt: -1 }).limit(5)
    ]);

    // Combine writing results
    const allWritingResults = [
      ...essayResults.map(r => ({ ...r.toObject(), type: 'Task 2' })),
      ...task1Results.map(r => ({ ...r.toObject(), type: 'Task 1' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    const results = {
      reading: readingResults,
      listening: listeningResults,
      writing: allWritingResults,
      speaking: speakingResults
    };

    res.json(results);
  } catch (error) {
    console.error('Dashboard history error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dashboard/analytics/:userId
router.get('/analytics/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const [readingResults, listeningResults, essayResults, task1Results, speakingResults] = await Promise.all([
      ReadingResult.find({ userId }).sort({ createdAt: 1 }),
      ListeningResult.find({ userId }).sort({ createdAt: 1 }),
      EssayResult.find({ userId }).sort({ createdAt: 1 }),
      Task1Result.find({ userId }).sort({ createdAt: 1 }),
      SpeakingResult.find({ userId }).sort({ createdAt: 1 })
    ]);

    // Prepare chart data for each skill
    const chartData = {
      reading: readingResults.map((r, index) => ({
        testNumber: index + 1,
        bandScore: r.bandScore,
        date: new Date(r.createdAt).toLocaleDateString(),
        testType: r.testType
      })),
      listening: listeningResults.map((r, index) => ({
        testNumber: index + 1,
        bandScore: r.bandScore,
        date: new Date(r.createdAt).toLocaleDateString()
      })),
      writing: [
        ...essayResults.map((r, index) => ({
          testNumber: index + 1,
          bandScore: r.score,
          date: new Date(r.createdAt).toLocaleDateString(),
          type: 'Task 2'
        })),
        ...task1Results.map((r, index) => ({
          testNumber: index + 1,
          bandScore: r.score,
          date: new Date(r.createdAt).toLocaleDateString(),
          type: r.taskType
        }))
      ].sort((a, b) => new Date(a.date) - new Date(b.date)),
      speaking: speakingResults.map((r, index) => ({
        testNumber: index + 1,
        bandScore: r.overall,
        date: new Date(r.createdAt).toLocaleDateString()
      }))
    };

    res.json({
      message: 'Analytics data fetched successfully',
      chartData
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
