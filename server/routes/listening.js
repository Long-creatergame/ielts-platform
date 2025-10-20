const express = require('express');
const router = express.Router();
const ListeningResult = require('../models/ListeningResult');
const listeningTestData = require('../data/listeningTestFull.json');
const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE || 'https://api.groq.com/openai/v1',
});

// Helper to calculate IELTS Listening Band Score
function calculateBandScore(correctCount, totalQuestions) {
  if (totalQuestions === 0) return 0;
  const percentage = (correctCount / totalQuestions) * 100;

  if (percentage >= 95) return 9.0;
  if (percentage >= 90) return 8.5;
  if (percentage >= 85) return 8.0;
  if (percentage >= 80) return 7.5;
  if (percentage >= 75) return 7.0;
  if (percentage >= 70) return 6.5;
  if (percentage >= 65) return 6.0;
  if (percentage >= 60) return 5.5;
  if (percentage >= 55) return 5.0;
  if (percentage >= 50) return 4.5;
  if (percentage >= 45) return 4.0;
  if (percentage >= 40) return 3.5;
  if (percentage >= 35) return 3.0;
  if (percentage >= 30) return 2.5;
  if (percentage >= 25) return 2.0;
  return 0;
}

// Generate AI feedback for listening performance
async function generateListeningFeedback(correctCount, totalQuestions, bandScore, answerDetails) {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL || "llama3-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are an IELTS Listening examiner. Provide detailed feedback on a student's listening test performance. Focus on listening skills, comprehension, and improvement strategies.`
        },
        {
          role: "user",
          content: `IELTS Listening Test Results:
- Total Questions: ${totalQuestions}
- Correct Answers: ${correctCount}
- Band Score: ${bandScore}
- Performance: ${(correctCount/totalQuestions*100).toFixed(1)}%

Please provide:
1. Overall assessment
2. Strengths demonstrated
3. Areas for improvement
4. Specific listening skill recommendations
5. Tips for better performance

Keep the feedback encouraging but honest, and provide actionable advice for improving listening skills.`
        }
      ],
      temperature: 0.6,
      max_tokens: 500,
    });

    return response.choices[0].message.content || "Good attempt. Keep practicing to improve your listening skills.";
  } catch (error) {
    console.error('AI feedback error:', error);
    return "Good attempt. Keep practicing to improve your listening skills.";
  }
}

// GET /api/listening/test
router.get('/test', (req, res) => {
  try {
    const testData = {
      title: listeningTestData.title,
      duration: listeningTestData.duration,
      sections: listeningTestData.sections.map(section => ({
        id: section.id,
        title: section.title,
        instructions: section.instructions,
        questionCount: section.questions.length
      }))
    };

    res.json(testData);
  } catch (error) {
    console.error('Get test error:', error);
    res.status(500).json({ error: 'Failed to load test data' });
  }
});

// GET /api/listening/questions/:sectionId
router.get('/questions/:sectionId', (req, res) => {
  try {
    const { sectionId } = req.params;
    
    const section = listeningTestData.sections.find(s => s.id === parseInt(sectionId));
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    res.json({
      section: {
        id: section.id,
        title: section.title,
        instructions: section.instructions
      },
      questions: section.questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        type: q.type
      }))
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

// POST /api/listening/submit
router.post('/submit', async (req, res) => {
  try {
    const { testType = 'academic', answers = [], duration, userId = 'guest' } = req.body;
    
    // Get all questions from all sections
    const allQuestions = listeningTestData.sections.flatMap(section => section.questions);
    
    // Check answers and calculate score
    let correctCount = 0;
    const answerDetails = [];

    answers.forEach(userAnswer => {
      const question = allQuestions.find(q => q.id === userAnswer.questionId);
      if (question) {
        const isCorrect = userAnswer.answer && 
          String(userAnswer.answer).toLowerCase() === String(question.answer).toLowerCase();
        
        if (isCorrect) correctCount++;

        answerDetails.push({
          questionId: question.id,
          userAnswer: userAnswer.answer || '',
          correctAnswer: question.answer,
          isCorrect: isCorrect
        });
      }
    });

    const totalQuestions = allQuestions.length;
    const bandScore = calculateBandScore(correctCount, totalQuestions);
    
    // Generate AI feedback
    const feedback = await generateListeningFeedback(correctCount, totalQuestions, bandScore, answerDetails);

    // Save result to database
    const savedResult = await ListeningResult.create({
      userId,
      testType,
      correctCount,
      totalQuestions,
      bandScore,
      duration: duration || 40,
      feedback,
      answers: answerDetails
    });

    res.json({
      message: 'Listening test submitted successfully',
      result: {
        _id: savedResult._id,
        testType: savedResult.testType,
        correctCount,
        totalQuestions,
        bandScore,
        percentage: ((correctCount / totalQuestions) * 100).toFixed(1),
        feedback,
        createdAt: savedResult.createdAt
      }
    });

  } catch (error) {
    console.error('Submit test error:', error);
    res.status(500).json({ error: 'Failed to submit test' });
  }
});

// GET /api/listening/history/:userId
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const results = await ListeningResult.find({ userId }).sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving listening history' });
  }
});

// GET /api/listening/analytics/:userId
router.get('/analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const results = await ListeningResult.find({ userId });

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
      duration: r.duration,
      testType: r.testType
    }));

    res.json({ 
      totalTests: results.length, 
      averageBand: parseFloat(averageBand), 
      averageAccuracy: parseFloat(averageAccuracy), 
      results: chartData 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating analytics' });
  }
});

module.exports = router;
