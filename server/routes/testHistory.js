const express = require('express');
const { authenticateToken } = require('../middleware/auth.js');

const router = express.Router();

// Get test history for a user
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Mock data for demonstration
    const mockTestHistory = [
      {
        id: 1,
        testType: 'IELTS Academic',
        level: 'A2',
        date: '2024-01-15',
        duration: '2h 30m',
        overallScore: 6.5,
        skills: {
          reading: { score: 6.5, band: 'B2' },
          listening: { score: 7.0, band: 'B2' },
          writing: { score: 6.0, band: 'B1' },
          speaking: { score: 6.5, band: 'B2' }
        },
        status: 'completed',
        answers: {
          reading: ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D'],
          listening: ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D'],
          writing: ['Task 1: The chart shows...', 'Task 2: In my opinion...'],
          speaking: ['Part 1: I am from...', 'Part 2: I would like to describe...', 'Part 3: I think that...']
        }
      },
      {
        id: 2,
        testType: 'IELTS General',
        level: 'B1',
        date: '2024-01-10',
        duration: '2h 15m',
        overallScore: 7.0,
        skills: {
          reading: { score: 7.0, band: 'B2' },
          listening: { score: 7.5, band: 'B2' },
          writing: { score: 6.5, band: 'B2' },
          speaking: { score: 7.0, band: 'B2' }
        },
        status: 'completed',
        answers: {
          reading: ['B', 'A', 'C', 'D', 'B', 'A', 'C', 'D', 'B', 'A', 'C', 'D', 'B', 'A', 'C', 'D', 'B', 'A', 'C', 'D', 'B', 'A', 'C', 'D', 'B', 'A', 'C', 'D', 'B', 'A', 'C', 'D', 'B', 'A', 'C', 'D', 'B', 'A', 'C', 'D'],
          listening: ['B', 'A', 'C', 'D', 'B', 'A', 'C', 'D', 'B', 'A', 'C', 'D', 'B', 'A', 'C', 'D', 'B', 'A', 'C', 'D', 'B', 'A', 'C', 'D', 'B', 'A', 'C', 'D', 'B', 'A', 'C', 'D', 'B', 'A', 'C', 'D', 'B', 'A', 'C', 'D'],
          writing: ['Task 1: The graph illustrates...', 'Task 2: There are both advantages and disadvantages...'],
          speaking: ['Part 1: I live in...', 'Part 2: Let me tell you about...', 'Part 3: From my perspective...']
        }
      }
    ];

    res.json({
      success: true,
      tests: mockTestHistory
    });
  } catch (error) {
    console.error('Error fetching test history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching test history'
    });
  }
});

// Get specific test details
router.get('/history/:testId', authenticateToken, async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user.id;
    
    // Mock data for specific test
    const mockTest = {
      id: parseInt(testId),
      testType: 'IELTS Academic',
      level: 'A2',
      date: '2024-01-15',
      duration: '2h 30m',
      overallScore: 6.5,
      skills: {
        reading: { score: 6.5, band: 'B2' },
        listening: { score: 7.0, band: 'B2' },
        writing: { score: 6.0, band: 'B1' },
        speaking: { score: 6.5, band: 'B2' }
      },
      status: 'completed',
      answers: {
        reading: ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D'],
        listening: ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D'],
        writing: ['Task 1: The chart shows...', 'Task 2: In my opinion...'],
        speaking: ['Part 1: I am from...', 'Part 2: I would like to describe...', 'Part 3: I think that...']
      },
      questions: {
        reading: [
          "According to the passage, what is the main purpose of urban gardening?",
          "The author mentions that urban gardening can reduce stress by what percentage?",
          "What does the passage say about the environmental benefits of urban gardens?",
          // ... more questions
        ],
        listening: [
          "What is the person's name?",
          "Where is the conversation taking place?",
          "What time does the event start?",
          // ... more questions
        ],
        writing: [
          "Describe the chart below showing transport usage.",
          "Discuss the advantages and disadvantages of technology."
        ],
        speaking: [
          "Tell me about your hometown.",
          "Describe a memorable trip you have taken.",
          "Discuss education and learning."
        ]
      }
    };

    res.json({
      success: true,
      test: mockTest
    });
  } catch (error) {
    console.error('Error fetching test details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching test details'
    });
  }
});

// Save test result
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { testType, level, answers, scores, duration } = req.body;
    
    // Calculate overall score
    const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;
    
    // Determine band levels
    const getBand = (score) => {
      if (score >= 8.0) return 'C2';
      if (score >= 7.0) return 'B2';
      if (score >= 6.0) return 'B1';
      if (score >= 5.0) return 'A2';
      return 'A1';
    };
    
    const skills = {};
    Object.entries(scores).forEach(([skill, score]) => {
      skills[skill] = {
        score: score,
        band: getBand(score)
      };
    });
    
    const testResult = {
      id: Date.now(), // Simple ID generation
      testType,
      level,
      date: new Date().toISOString().split('T')[0],
      duration,
      overallScore: Math.round(overallScore * 10) / 10,
      skills,
      status: 'completed',
      answers
    };
    
    // In a real application, save to database
    console.log('Test result saved:', testResult);
    
    res.json({
      success: true,
      testId: testResult.id,
      message: 'Test result saved successfully'
    });
  } catch (error) {
    console.error('Error saving test result:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving test result'
    });
  }
});

module.exports = router;
