const TestBank = require('../models/TestBank');

// Generate test questions for a specific skill and level
async function generateTest(skill, level) {
  try {
    const testBank = await TestBank.findOne({ skill, level });
    
    if (!testBank) {
      // Return mock test data if no test bank exists
      return generateMockTest(skill, level);
    }
    
    return testBank;
  } catch (error) {
    console.error('Error generating test:', error);
    return generateMockTest(skill, level);
  }
}

// Generate mock test data
function generateMockTest(skill, level) {
  const mockTests = {
    reading: {
      questions: [
        {
          question: "What is the main topic of the passage?",
          options: ["Technology", "Education", "Health", "Environment"],
          correctAnswer: "Technology",
          explanation: "The passage discusses technological advancements."
        },
        {
          question: "According to the passage, what is the primary benefit?",
          options: ["Cost reduction", "Time saving", "Quality improvement", "All of the above"],
          correctAnswer: "All of the above",
          explanation: "The passage mentions all these benefits."
        }
      ],
      duration: 900
    },
    listening: {
      questions: [
        {
          question: "What is the speaker discussing?",
          options: ["Travel", "Work", "Study", "Health"],
          correctAnswer: "Study",
          explanation: "The speaker is discussing study methods."
        }
      ],
      duration: 900
    },
    writing: {
      questions: [
        {
          question: "Task 1: Describe the chart showing population growth.",
          correctAnswer: "Write 150 words describing the chart",
          explanation: "Focus on key trends and data points."
        },
        {
          question: "Task 2: Discuss the advantages and disadvantages of technology.",
          correctAnswer: "Write 250 words discussing both sides",
          explanation: "Present balanced arguments with examples."
        }
      ],
      duration: 3600
    },
    speaking: {
      questions: [
        {
          question: "Part 1: Tell me about your hometown.",
          correctAnswer: "Provide personal information about your hometown",
          explanation: "Give specific details and examples."
        },
        {
          question: "Part 2: Describe a memorable experience.",
          correctAnswer: "Speak for 2 minutes about a memorable experience",
          explanation: "Use past tense and descriptive language."
        },
        {
          question: "Part 3: Discuss the importance of education.",
          correctAnswer: "Provide opinions and examples about education",
          explanation: "Use complex vocabulary and give reasons."
        }
      ],
      duration: 660
    }
  };

  return {
    skill,
    level,
    questions: mockTests[skill].questions,
    duration: mockTests[skill].duration
  };
}

module.exports = { generateTest };
