const express = require('express');
const router = express.Router();
const ReadingResult = require('../models/ReadingResult');
const academicReadingData = require('../data/academicReadingFull.json');
const generalReadingData = require('../data/generalReadingFull.json');
const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
});

// Calculate IELTS Band Score based on correct answers
function calculateBandScore(correctCount, totalQuestions) {
  const percentage = (correctCount / totalQuestions) * 100;
  
  if (percentage >= 95) return 9.0;
  if (percentage >= 88) return 8.5;
  if (percentage >= 82) return 8.0;
  if (percentage >= 75) return 7.5;
  if (percentage >= 68) return 7.0;
  if (percentage >= 60) return 6.5;
  if (percentage >= 52) return 6.0;
  if (percentage >= 45) return 5.5;
  if (percentage >= 38) return 5.0;
  if (percentage >= 30) return 4.5;
  if (percentage >= 22) return 4.0;
  if (percentage >= 15) return 3.5;
  if (percentage >= 8) return 3.0;
  if (percentage >= 3) return 2.5;
  return 2.0;
}

// Generate feedback using AI
async function generateFeedback(correctCount, totalQuestions, bandScore, answers) {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an IELTS Reading expert. Provide detailed feedback on a student's reading test performance. Focus on strengths, weaknesses, and specific improvement suggestions."
        },
        {
          role: "user",
          content: `IELTS Reading Test Results:
- Correct Answers: ${correctCount}/${totalQuestions}
- Band Score: ${bandScore}
- Performance: ${(correctCount/totalQuestions*100).toFixed(1)}%

Please provide:
1. Overall assessment
2. Strengths demonstrated
3. Areas for improvement
4. Specific study recommendations
5. Tips for better time management

Keep the feedback encouraging but honest, and provide actionable advice.`
        }
      ],
      temperature: 0.6,
      max_tokens: 500,
    });

    return response.choices[0].message.content || "Good attempt. Keep practicing to improve your reading skills.";
  } catch (error) {
    console.error('AI feedback error:', error);
    return "Good attempt. Keep practicing to improve your reading skills.";
  }
}

// GET /api/reading/test?type=academic or ?type=general
router.get('/test', (req, res) => {
  try {
    const { type = 'academic' } = req.query;
    
    let testData;
    if (type === 'general') {
      testData = {
        title: generalReadingData.title,
        duration: generalReadingData.duration,
        passages: generalReadingData.passages.map(passage => ({
          id: passage.id,
          title: passage.title,
          content: passage.content,
          questionCount: passage.questions.length
        }))
      };
    } else {
      // Default to academic
      testData = {
        title: academicReadingData.title,
        duration: 60,
        passages: academicReadingData.passages.map(passage => ({
          id: passage.id,
          title: passage.title,
          content: passage.content,
          questionCount: passage.questions.length
        }))
      };
    }

    res.json(testData);
  } catch (error) {
    console.error('Get test error:', error);
    res.status(500).json({ error: 'Failed to load test data' });
  }
});

// POST /api/reading/submit
router.post('/submit', async (req, res) => {
  try {
    const { testType = 'academic', answers = [], duration, userId = 'guest' } = req.body;
    
    // Get all questions from the appropriate test data
    const testData = testType === 'general' ? generalReadingData : academicReadingData;
    const allQuestions = testData.passages.flatMap(passage => passage.questions);
    
    // Check answers and calculate score
    let correctCount = 0;
    const answerDetails = [];

    answers.forEach(userAnswer => {
      const question = allQuestions.find(q => q.id === userAnswer.questionId);
      if (!question) return;

      let isCorrect = false;
      let correctAnswer = '';

      if (question.type === 'multiple-choice') {
        correctAnswer = question.options[question.correct];
        isCorrect = userAnswer.answer === correctAnswer;
      } else if (question.type === 'true-false') {
        correctAnswer = question.correct ? 'True' : 'False';
        isCorrect = userAnswer.answer === correctAnswer;
      } else if (question.type === 'fill-blank') {
        correctAnswer = question.answer;
        isCorrect = userAnswer.answer.toLowerCase().trim() === question.answer.toLowerCase().trim();
      }

      if (isCorrect) correctCount++;
      
      answerDetails.push({
        questionId: userAnswer.questionId,
        userAnswer: userAnswer.answer,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect
      });
    });

    const totalQuestions = allQuestions.length;
    const bandScore = calculateBandScore(correctCount, totalQuestions);
    
    // Generate AI feedback
    const feedback = await generateFeedback(correctCount, totalQuestions, bandScore, answerDetails);

    // Save result to database
    const savedResult = await ReadingResult.create({
      userId,
      testType,
      correctCount,
      totalQuestions,
      bandScore,
      duration: duration || 60,
      sectionFeedback: feedback,
      answers: answerDetails
    });

    // Auto-update achievements
    try {
      await fetch(`http://localhost:4000/api/achievements/update/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (achievementError) {
      console.log('Achievement update failed (non-critical):', achievementError.message);
    }

    // Auto-update challenge progress
    try {
      await fetch(`http://localhost:4000/api/challenges/progress/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (challengeError) {
      console.log('Challenge progress update failed (non-critical):', challengeError.message);
    }

    res.json({
      message: 'Reading test submitted successfully',
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

// GET /api/reading/results
router.get('/results', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.max(1, Math.min(50, Number(req.query.limit || 20)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      ReadingResult.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ReadingResult.countDocuments(),
    ]);

    res.json({
      page,
      limit,
      total,
      items
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Failed to get reading results' });
  }
});

// GET /api/reading/questions/:passageId?type=academic or ?type=general
router.get('/questions/:passageId', (req, res) => {
  try {
    const { passageId } = req.params;
    const { type = 'academic' } = req.query;
    
    const testData = type === 'general' ? generalReadingData : academicReadingData;
    const passage = testData.passages.find(p => p.id === parseInt(passageId));
    if (!passage) {
      return res.status(404).json({ error: 'Passage not found' });
    }

    res.json({
      passage: {
        id: passage.id,
        title: passage.title,
        content: passage.content
      },
      questions: passage.questions.map(q => ({
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options || null,
        correct: q.correct,
        answer: q.answer || null
      }))
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

module.exports = router;
