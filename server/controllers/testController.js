const Test = require('../models/Test');
const { generateTest } = require('../utils/generateTest');
const { calculateBand, calculateOverallBand } = require('../utils/calculateBand');

// Start new test
const startTest = async (req, res) => {
  try {
    const { level } = req.body;
    const userId = req.user.userId;

    // Generate test for each skill
    const skills = ['reading', 'listening', 'writing', 'speaking'];
    const testData = {};

    for (const skill of skills) {
      testData[skill] = await generateTest(skill, level);
    }

    // Create test record
    const test = new Test({
      userId,
      level,
      skills: testData,
      totalBand: 0,
      paid: false,
      dateTaken: new Date()
    });

    await test.save();

    res.json({
      message: 'Test started successfully',
      testId: test._id,
      testData
    });
  } catch (error) {
    console.error('Start test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit test
const submitTest = async (req, res) => {
  try {
    const { testId, answers } = req.body;
    const userId = req.user.userId;

    // Find test
    const test = await Test.findOne({ _id: testId, userId });
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Calculate scores for each skill
    const skillScores = {};
    const skillBands = {};

    for (const [skill, skillData] of Object.entries(test.skills)) {
      const userAnswers = answers[skill] || [];
      const correctAnswers = skillData.questions.filter(q => 
        userAnswers.includes(q.correctAnswer)
      ).length;
      
      const band = calculateBand(correctAnswers, skillData.questions.length, skill);
      skillScores[skill] = { correct: correctAnswers, total: skillData.questions.length };
      skillBands[skill] = band;
    }

    // Calculate overall band
    const overallBand = calculateOverallBand(Object.values(skillBands));

    // Update test
    test.skillScores = skillScores;
    test.skillBands = skillBands;
    test.totalBand = overallBand;
    test.answers = answers;
    test.completed = true;

    await test.save();

    res.json({
      message: 'Test submitted successfully',
      results: {
        skillBands,
        overallBand,
        testId: test._id
      }
    });
  } catch (error) {
    console.error('Submit test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get test history
const getTestHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const tests = await Test.find({ userId })
      .sort({ dateTaken: -1 })
      .select('-answers');

    res.json({ tests });
  } catch (error) {
    console.error('Test history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  startTest,
  submitTest,
  getTestHistory
};
