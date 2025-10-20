const express = require("express");
const router = express.Router();
const ReadingResult = require("../models/ReadingResult");

// GET - Retrieve reading history for a user
router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const results = await ReadingResult.find({ userId }).sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving reading history" });
  }
});

// GET - Analytics summary
router.get("/analytics/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const results = await ReadingResult.find({ userId });

    if (results.length === 0) {
      return res.json({ 
        totalTests: 0, 
        averageBand: 0, 
        averageAccuracy: 0, 
        results: [] 
      });
    }

    const averageBand = (
      results.reduce((sum, r) => sum + r.bandScore, 0) / results.length
    ).toFixed(1);

    const averageAccuracy = (
      results.reduce((sum, r) => sum + (r.correctCount / r.totalQuestions) * 100, 0) /
      results.length
    ).toFixed(1);

    // Prepare chart data
    const chartData = results.map((r, index) => ({
      testNumber: index + 1,
      bandScore: r.bandScore,
      accuracy: ((r.correctCount / r.totalQuestions) * 100).toFixed(1),
      date: new Date(r.createdAt).toLocaleDateString(),
      correctCount: r.correctCount,
      totalQuestions: r.totalQuestions,
      duration: r.duration
    }));

    res.json({ 
      totalTests: results.length, 
      averageBand: parseFloat(averageBand), 
      averageAccuracy: parseFloat(averageAccuracy), 
      results: chartData 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating analytics" });
  }
});

// GET - All users' reading history (for admin purposes)
router.get("/all", async (req, res) => {
  try {
    const results = await ReadingResult.find().sort({ createdAt: -1 }).limit(100);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving all reading history" });
  }
});

module.exports = router;
