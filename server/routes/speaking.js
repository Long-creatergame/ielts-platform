const express = require('express');
const router = express.Router();
const SpeakingResult = require('../models/SpeakingResult');
const speakingQuestions = require('../data/speakingQuestions.json');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
});

// Configure multer for audio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/speaking/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'speaking-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'), false);
    }
  }
});

// Generate AI feedback for speaking performance
async function generateSpeakingFeedback(fluency, lexical, grammar, pronunciation, overall) {
  // Skip OpenAI calls during test/deploy to prevent timeout
  if (process.env.NODE_ENV === 'test') {
    console.log('[Speaking] Skipping OpenAI call during test/deploy');
    return {
      overall: "Feedback generation skipped during test/deploy",
      fluency: { score: fluency, feedback: "Analysis skipped during test" },
      lexical: { score: lexical, feedback: "Analysis skipped during test" },
      grammar: { score: grammar, feedback: "Analysis skipped during test" },
      pronunciation: { score: pronunciation, feedback: "Analysis skipped during test" },
      recommendations: []
    };
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an IELTS Speaking examiner. Provide detailed feedback on a student's speaking performance. 
          Focus on the four assessment criteria: Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, and Pronunciation.
          
          Scores provided:
          - Fluency and Coherence: ${fluency}
          - Lexical Resource: ${lexical}
          - Grammatical Range and Accuracy: ${grammar}
          - Pronunciation: ${pronunciation}
          - Overall Band Score: ${overall}
          
          Provide constructive feedback with specific improvement suggestions for each criterion.`
        },
        {
          role: "user",
          content: `Please provide detailed feedback for this IELTS Speaking performance with the scores above. 
          Include strengths, areas for improvement, and specific recommendations for each assessment criterion.`
        }
      ],
      temperature: 0.6,
      max_tokens: 600,
    });

    return response.choices[0].message.content || "Good attempt. Keep practicing to improve your speaking skills.";
  } catch (error) {
    console.error('AI feedback error:', error);
    return "Good attempt. Keep practicing to improve your speaking skills.";
  }
}

// GET /api/speaking/questions
router.get('/questions', (req, res) => {
  try {
    res.json(speakingQuestions);
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Failed to load speaking questions' });
  }
});

// POST /api/speaking/submit
router.post('/submit', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { userId = 'guest' } = req.body;

    // For demo purposes, we'll simulate AI scoring
    // In a real implementation, you would send the audio to a speech-to-text service
    // and then analyze the transcript for IELTS scoring
    
    const simulatedScores = {
      fluency: Math.round((Math.random() * 2 + 5) * 10) / 10, // 5.0-7.0
      lexical: Math.round((Math.random() * 2 + 5) * 10) / 10, // 5.0-7.0
      grammar: Math.round((Math.random() * 2 + 5) * 10) / 10, // 5.0-7.0
      pronunciation: Math.round((Math.random() * 2 + 5) * 10) / 10, // 5.0-7.0
    };
    
    simulatedScores.overall = Math.round(
      (simulatedScores.fluency + simulatedScores.lexical + 
       simulatedScores.grammar + simulatedScores.pronunciation) / 4 * 10
    ) / 10;

    // Generate AI feedback
    const feedback = await generateSpeakingFeedback(
      simulatedScores.fluency,
      simulatedScores.lexical,
      simulatedScores.grammar,
      simulatedScores.pronunciation,
      simulatedScores.overall
    );

    // Save result to database
    const savedResult = await SpeakingResult.create({
      userId,
      testType: 'academic',
      fluency: simulatedScores.fluency,
      lexical: simulatedScores.lexical,
      grammar: simulatedScores.grammar,
      pronunciation: simulatedScores.pronunciation,
      overall: simulatedScores.overall,
      feedback: feedback,
      duration: req.body.duration || 300, // duration in seconds
      audioUrl: req.file.path
    });

    // Clean up the uploaded file after processing
    setTimeout(() => {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }, 5000);

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
      message: 'Speaking test submitted successfully',
      result: {
        _id: savedResult._id,
        testType: savedResult.testType,
        fluency: savedResult.fluency,
        lexical: savedResult.lexical,
        grammar: savedResult.grammar,
        pronunciation: savedResult.pronunciation,
        overall: savedResult.overall,
        feedback: savedResult.feedback,
        duration: savedResult.duration,
        createdAt: savedResult.createdAt
      }
    });

  } catch (error) {
    console.error('Submit speaking test error:', error);
    
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Failed to submit speaking test' });
  }
});

// GET /api/speaking/history/:userId
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const results = await SpeakingResult.find({ userId }).sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving speaking history' });
  }
});

// GET /api/speaking/analytics/:userId
router.get('/analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const results = await SpeakingResult.find({ userId });

    if (results.length === 0) {
      return res.json({ 
        totalTests: 0, 
        avgFluency: 0, 
        avgLexical: 0, 
        avgGrammar: 0, 
        avgPronunciation: 0, 
        avgOverall: 0, 
        results: [] 
      });
    }

    const avgFluency = (results.reduce((sum, r) => sum + r.fluency, 0) / results.length).toFixed(1);
    const avgLexical = (results.reduce((sum, r) => sum + r.lexical, 0) / results.length).toFixed(1);
    const avgGrammar = (results.reduce((sum, r) => sum + r.grammar, 0) / results.length).toFixed(1);
    const avgPronunciation = (results.reduce((sum, r) => sum + r.pronunciation, 0) / results.length).toFixed(1);
    const avgOverall = (results.reduce((sum, r) => sum + r.overall, 0) / results.length).toFixed(1);

    // Prepare chart data
    const chartData = results.map((r, index) => ({
      testNumber: index + 1,
      fluency: r.fluency,
      lexical: r.lexical,
      grammar: r.grammar,
      pronunciation: r.pronunciation,
      overall: r.overall,
      date: new Date(r.createdAt).toLocaleDateString(),
      duration: Math.round(r.duration / 60), // convert to minutes
      testType: r.testType
    }));

    res.json({ 
      totalTests: results.length, 
      avgFluency: parseFloat(avgFluency), 
      avgLexical: parseFloat(avgLexical), 
      avgGrammar: parseFloat(avgGrammar), 
      avgPronunciation: parseFloat(avgPronunciation), 
      avgOverall: parseFloat(avgOverall), 
      results: chartData 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating speaking analytics' });
  }
});

module.exports = router;
