const Result = require('../models/Result');

const saveResult = async (req, res) => {
  try {
    const { userId, testId, score, feedback } = req.body;
    const result = await Result.create({ userId, testId, score, feedback });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: "Error saving result", error: err.message });
  }
};

const getUserResults = async (req, res) => {
  try {
    const { userId } = req.params;
    const results = await Result.find({ userId }).populate("testId");
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving results", error: err.message });
  }
};

module.exports = {
  saveResult,
  getUserResults
};
