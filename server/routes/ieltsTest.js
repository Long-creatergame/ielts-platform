const express = require('express');
const auth = require('../middleware/auth');
const Test = require('../models/Test');
const { getRandomContent } = require('../services/contentGenerator');

const router = express.Router();

// Generate IELTS test content
router.post('/generate', auth, async (req, res) => {
  try {
    const { level = 'A2', skill = 'reading' } = req.body;
    const userId = req.user._id;

    if (!['reading', 'writing', 'listening', 'speaking'].includes(skill)) {
      return res.status(400).json({ error: 'Invalid skill. Must be reading, writing, listening, or speaking.' });
    }

    // Generate test content based on skill and level
    const randomContent = getRandomContent(skill, level);
    const testContent = randomContent ? formatContentForTest(randomContent, skill) : generateIELTSTestContent(skill, level);
    
    // Create test record
    const testRecord = new Test({
      userId,
      skill,
      level,
      questions: testContent.questions,
      passage: testContent.passage,
      audioUrl: testContent.audioUrl,
      timeLimit: testContent.timeLimit,
      status: 'in_progress',
      createdAt: new Date()
    });

    await testRecord.save();

    res.json({
      success: true,
      data: {
        testId: testRecord._id,
        skill,
        level,
        content: testContent,
        timeLimit: testContent.timeLimit
      }
    });
  } catch (error) {
    console.error('Generate IELTS test error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit test answers
router.post('/submit', auth, async (req, res) => {
  try {
    const { testId, answers, timeSpent } = req.body;
    const userId = req.user._id;

    if (!testId || !answers) {
      return res.status(400).json({ error: 'Test ID and answers are required' });
    }

    // Find test record
    const test = await Test.findById(testId);
    if (!test || test.userId.toString() !== userId.toString()) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Calculate score
    const score = calculateIELTSScore(test, answers);
    
    // Update test record
    test.answers = answers;
    test.score = score;
    test.status = 'completed';
    test.completedAt = new Date();
    test.timeSpent = timeSpent;

    await test.save();

    // Update user statistics
    await updateUserStatistics(userId, score);

    res.json({
      success: true,
      data: {
        testId: test._id,
        score,
        feedback: generateTestFeedback(score),
        completedAt: test.completedAt
      }
    });
  } catch (error) {
    console.error('Submit IELTS test error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get test result
router.get('/result/:testId', auth, async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user._id;

    const test = await Test.findById(testId);
    if (!test || test.userId.toString() !== userId.toString()) {
      return res.status(404).json({ error: 'Test not found' });
    }

    res.json({
      success: true,
      data: {
        testId: test._id,
        skill: test.skill,
        level: test.level,
        score: test.score,
        answers: test.answers,
        completedAt: test.completedAt,
        timeSpent: test.timeSpent
      }
    });
  } catch (error) {
    console.error('Get test result error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

function formatContentForTest(content, skill) {
  switch (skill) {
    case 'reading':
      return {
        title: `IELTS Academic Reading - ${content.title}`,
        instructions: "Read the passage and answer the questions below. You have 60 minutes to complete this section.",
        timeLimit: 60,
        passage: content.content,
        questions: content.questions
      };
    case 'writing':
      return {
        title: `IELTS Academic Writing - ${content.type}`,
        instructions: `You should spend about ${content.timeLimit} minutes on this task. Write at least ${content.wordCount} words.`,
        timeLimit: content.timeLimit,
        task: content.task,
        taskType: content.type,
        wordCount: content.wordCount,
        criteria: [
          "Task Achievement - Address all parts of the task",
          "Coherence and Cohesion - Organize information logically",
          "Lexical Resource - Use appropriate vocabulary",
          "Grammar Range and Accuracy - Use varied sentence structures"
        ]
      };
    case 'listening':
      return {
        title: `IELTS Academic Listening - ${content.title}`,
        instructions: "Listen to the recording and answer the questions below. You will hear the recording once.",
        timeLimit: 30,
        audioUrl: content.audioUrl,
        questions: content.questions
      };
    case 'speaking':
      return {
        title: `IELTS Academic Speaking - Part ${content.part}`,
        instructions: "Answer the questions below clearly and in detail.",
        timeLimit: content.part === 1 ? 5 : content.part === 2 ? 4 : 5,
        questions: content.questions || [content.task],
        preparationTime: content.preparationTime,
        speakingTime: content.speakingTime
      };
    default:
      return content;
  }
}

function generateIELTSTestContent(skill, level) {
  const baseContent = {
    reading: {
      title: "IELTS Academic Reading",
      instructions: "Read the passage and answer questions 1-13. You have 60 minutes to complete this section.",
      timeLimit: 60,
      passage: `The Future of Renewable Energy

As the world grapples with climate change and the need for sustainable energy sources, renewable energy technologies have emerged as a crucial solution. Solar, wind, hydroelectric, and geothermal power are no longer experimental technologies but are becoming mainstream energy sources in many countries.

Solar energy has seen the most dramatic growth in recent years. The cost of solar panels has dropped by over 80% since 2010, making solar power competitive with fossil fuels in many markets. Countries like Germany, China, and the United States have invested heavily in solar infrastructure, with some regions now generating more electricity from solar than from traditional sources during peak hours.

Wind energy has also experienced significant expansion, particularly in offshore installations. Modern wind turbines are more efficient and can generate electricity even in lower wind speeds. Countries with extensive coastlines, such as the United Kingdom and Denmark, have become leaders in offshore wind development.

However, renewable energy faces several challenges. The intermittent nature of solar and wind power requires sophisticated energy storage solutions and grid management systems. Battery technology has improved dramatically, but large-scale storage remains expensive and technically complex.

Another challenge is the need for significant infrastructure investment. While renewable energy sources have low operating costs once installed, the initial capital investment is substantial. Governments and private investors must commit to long-term projects that may not show returns for years.

Despite these challenges, the trend toward renewable energy is accelerating. Many countries have set ambitious targets for renewable energy adoption, and technological advances continue to reduce costs and improve efficiency. The transition to a renewable energy future is not just environmentally necessary but increasingly economically viable.`,
      questions: [
        {
          id: 1,
          question: "According to the passage, what has happened to the cost of solar panels since 2010?",
          type: "multiple_choice",
          options: [
            "It has increased by 80%",
            "It has decreased by 80%",
            "It has remained stable",
            "It has fluctuated significantly"
          ],
          correctAnswer: 1
        },
        {
          id: 2,
          question: "Which countries are mentioned as leaders in offshore wind development?",
          type: "multiple_choice",
          options: [
            "Germany and China",
            "United States and Germany",
            "United Kingdom and Denmark",
            "China and United States"
          ],
          correctAnswer: 2
        },
        {
          id: 3,
          question: "What is the main challenge mentioned regarding renewable energy?",
          type: "multiple_choice",
          options: [
            "High operating costs",
            "Intermittent nature",
            "Lack of government support",
            "Technological limitations"
          ],
          correctAnswer: 1
        }
      ]
    },
    writing: {
      title: "IELTS Academic Writing Task 1",
      instructions: "You should spend about 20 minutes on this task. Write at least 150 words.",
      timeLimit: 20,
      task: "The chart below shows the percentage of households in different income groups who owned cars in a particular country between 1995 and 2015. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
      wordCount: 150,
      criteria: [
        "Task Achievement - Address all parts of the task",
        "Coherence and Cohesion - Organize information logically",
        "Lexical Resource - Use appropriate vocabulary",
        "Grammar Range and Accuracy - Use varied sentence structures"
      ]
    },
    listening: {
      title: "IELTS Academic Listening",
      instructions: "Listen to the recording and answer questions 1-10. You will hear the recording once.",
      timeLimit: 30,
      audioUrl: "/api/audio/ielts-listening-sample-1.mp3",
      transcript: "Good morning, everyone. Today we're going to discuss the course requirements for this semester. First, let me introduce myself. I'm Professor Johnson, and I'll be teaching this course on Environmental Science...",
      questions: [
        {
          id: 1,
          question: "What is the professor's name?",
          type: "multiple_choice",
          options: [
            "Professor Smith",
            "Professor Johnson", 
            "Professor Brown",
            "Professor Davis"
          ],
          correctAnswer: 1,
          explanation: "The professor introduces himself as Professor Johnson."
        },
        {
          id: 2,
          question: "What subject does the professor teach?",
          type: "multiple_choice",
          options: [
            "Biology",
            "Environmental Science",
            "Chemistry",
            "Physics"
          ],
          correctAnswer: 1,
          explanation: "The professor mentions teaching Environmental Science."
        },
        {
          id: 3,
          question: "When are the lectures held?",
          type: "multiple_choice",
          options: [
            "Monday and Wednesday",
            "Tuesday and Thursday",
            "Monday and Friday",
            "Wednesday and Friday"
          ],
          correctAnswer: 1,
          explanation: "Lectures are held every Tuesday and Thursday."
        },
        {
          id: 4,
          question: "What time do lectures start?",
          type: "multiple_choice",
          options: [
            "8:00 AM",
            "9:00 AM",
            "10:00 AM",
            "11:00 AM"
          ],
          correctAnswer: 1,
          explanation: "Lectures are from 9 AM to 10:30 AM."
        },
        {
          id: 5,
          question: "Where are the lectures held?",
          type: "multiple_choice",
          options: [
            "Room 105",
            "Room 205",
            "Room 305",
            "Room 405"
          ],
          correctAnswer: 1,
          explanation: "Lectures are held in Room 205."
        }
      ]
    },
    speaking: {
      title: "IELTS Academic Speaking",
      instructions: "This speaking test has three parts. Answer all questions clearly and in detail.",
      timeLimit: 15,
      parts: [
        {
          part: 1,
          title: "Introduction and Interview",
          questions: [
            "What is your full name?",
            "Where are you from?",
            "Do you work or study?",
            "What do you like about your job/studies?"
          ]
        },
        {
          part: 2,
          title: "Individual Long Turn",
          task: "Describe a memorable journey you have taken. You should say: where you went, when you went there, who you went with, what you did there, and explain why this journey was memorable for you.",
          preparationTime: 1,
          speakingTime: 2
        },
        {
          part: 3,
          title: "Two-way Discussion",
          questions: [
            "What are the benefits of traveling?",
            "How has technology changed the way people travel?",
            "Do you think travel will become more or less popular in the future?"
          ]
        }
      ]
    }
  };

  return baseContent[skill];
}

function calculateIELTSScore(test, answers) {
  // Simple scoring logic - in real implementation, this would be more sophisticated
  const totalQuestions = test.questions ? test.questions.length : 1;
  const correctAnswers = answers.filter(answer => answer.isCorrect).length;
  
  const percentage = (correctAnswers / totalQuestions) * 100;
  const bandScore = Math.max(4, Math.min(9, 4 + (percentage / 100) * 5));
  
  return {
    total: totalQuestions,
    correct: correctAnswers,
    percentage: Math.round(percentage),
    bandScore: Math.round(bandScore * 10) / 10
  };
}

function generateTestFeedback(score) {
  const bandScore = score.bandScore;
  
  if (bandScore >= 7) {
    return "Excellent performance! You demonstrate strong proficiency in this skill.";
  } else if (bandScore >= 6) {
    return "Good work! You're making solid progress. Focus on areas where you can improve.";
  } else if (bandScore >= 5) {
    return "Keep practicing! You're on the right track but need more work on this skill.";
  } else {
    return "Don't give up! This skill needs more attention. Consider reviewing the fundamentals.";
  }
}

async function updateUserStatistics(userId, score) {
  try {
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (user) {
      user.totalTests = (user.totalTests || 0) + 1;
      
      // Update average band score
      const currentAverage = user.averageBand || 0;
      const totalTests = user.totalTests;
      user.averageBand = ((currentAverage * (totalTests - 1)) + score.bandScore) / totalTests;
      
      await user.save();
    }
  } catch (error) {
    console.error('Update user statistics error:', error);
  }
}

module.exports = router;
