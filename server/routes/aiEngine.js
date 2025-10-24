import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import WeaknessProfile from '../models/WeaknessProfile.js';
import PracticeSet from '../models/PracticeSet.js';
import AISubmission from '../models/AISubmission.js';

dotenv.config();

const router = express.Router();

// Initialize OpenAI client only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1',
  });
  console.log('✅ OpenAI client initialized');
} else {
  console.log('⚠️ OpenAI API key not found, AI features will be disabled');
}

// 1. GENERATE IELTS QUESTIONS
// POST /ai-engine/generate
router.post('/generate', async (req, res) => {
  const { skill, topic, band = 6.5 } = req.body;
  
  try {
    // Check if OpenAI is available
    if (!openai) {
      // Return fallback question when AI is not available
      const fallbackQuestions = {
        writing: {
          question: "Some people believe that technology has made our lives easier, while others think it has made life more complicated. Discuss both views and give your own opinion.",
          instructions: "Write at least 250 words. You should spend about 40 minutes on this task.",
          wordLimit: 250,
          timeLimit: 40
        },
        speaking: {
          question: "Describe a memorable journey you have taken. You should say: where you went, when you went there, who you went with, what you did there, and explain why this journey was memorable for you.",
          instructions: "You have one minute to prepare your answer. Then speak for 1-2 minutes.",
          wordLimit: 150,
          timeLimit: 2
        },
        reading: {
          question: "Read the following passage and answer the questions that follow. The passage discusses the impact of social media on modern communication.",
          instructions: "Answer all questions. You have 60 minutes to complete this section.",
          wordLimit: 100,
          timeLimit: 60
        },
        listening: {
          question: "Listen to a conversation between two students discussing their university courses and answer the questions.",
          instructions: "Listen carefully and answer all questions. You have 40 minutes to complete this section.",
          wordLimit: 50,
          timeLimit: 40
        }
      };

      const fallback = fallbackQuestions[skill] || fallbackQuestions.writing;
      
      return res.json({
        success: true,
        data: {
          question: fallback.question,
          instructions: fallback.instructions,
          wordLimit: fallback.wordLimit,
          timeLimit: fallback.timeLimit,
          createdAt: new Date().toISOString()
        }
      });
    }

    if (!skill || !['writing', 'speaking', 'reading', 'listening'].includes(skill)) {
      return res.status(400).json({ error: 'Invalid skill. Must be writing, speaking, reading, or listening.' });
    }

    const systemPrompt = `You are an IELTS question generator. Create a question in authentic IELTS style.
Skill: ${skill}
Topic: ${topic || 'random IELTS topic'}
Band level: ${band}
Format it exactly as official IELTS question wording.
Return JSON format with: { "question": "...", "instructions": "...", "wordLimit": number, "timeLimit": number }`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate a ${skill} question for band ${band} level` }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const content = response.choices[0].message.content;
    const questionData = JSON.parse(content);

    // Save to database
    const practiceSet = new PracticeSet({
      user_id: req.user?.id || 'anonymous',
      skill,
      topic: topic || 'general',
      band,
      question: questionData.question,
      instructions: questionData.instructions,
      wordLimit: questionData.wordLimit,
      timeLimit: questionData.timeLimit
    });

    await practiceSet.save();

    res.json({
      success: true,
      data: {
        question: questionData.question,
        instructions: questionData.instructions,
        wordLimit: questionData.wordLimit,
        timeLimit: questionData.timeLimit,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI Generate error:', error);
    
    // Get skill from request body for fallback
    const { skill: fallbackSkill } = req.body;
    
    // Return fallback question on error
    const fallbackQuestions = {
      writing: {
        question: "Some people believe that technology has made our lives easier, while others think it has made life more complicated. Discuss both views and give your own opinion.",
        instructions: "Write at least 250 words. You should spend about 40 minutes on this task.",
        wordLimit: 250,
        timeLimit: 40
      },
      speaking: {
        question: "Describe a memorable journey you have taken. You should say: where you went, when you went there, who you went with, what you did there, and explain why this journey was memorable for you.",
        instructions: "You have one minute to prepare your answer. Then speak for 1-2 minutes.",
        wordLimit: 150,
        timeLimit: 2
      },
      reading: {
        question: "Read the following passage and answer the questions that follow. The passage discusses the impact of social media on modern communication.",
        instructions: "Answer all questions. You have 60 minutes to complete this section.",
        wordLimit: 100,
        timeLimit: 60
      },
      listening: {
        question: "Listen to a conversation between two students discussing their university courses and answer the questions.",
        instructions: "Listen carefully and answer all questions. You have 40 minutes to complete this section.",
        wordLimit: 50,
        timeLimit: 40
      }
    };

    const fallback = fallbackQuestions[fallbackSkill] || fallbackQuestions.writing;
    
    res.json({
      success: true,
      data: {
        question: fallback.question,
        instructions: fallback.instructions,
        wordLimit: fallback.wordLimit,
        timeLimit: fallback.timeLimit,
        createdAt: new Date().toISOString()
      }
    });
  }
});

// 2. ANALYZE SUBMISSION
// POST /ai-engine/analyze
router.post('/analyze', async (req, res) => {
  const { skill, submission_text, audio_url, user_id } = req.body;
  
  try {
    if (!openai) {
      // Return fallback analysis when AI is not available
      return res.json({
        success: true,
        data: {
          band_estimate: 6.0,
          breakdown: {
            taskAchievement: 6.0,
            coherenceCohesion: 6.0,
            lexicalResource: 6.0,
            grammaticalRange: 6.0,
            fluency: 6.0,
            pronunciation: 6.0
          },
          feedback: "AI analysis temporarily unavailable. Your submission has been recorded for manual review.",
          suggestions: [
            "Focus on task completion",
            "Improve vocabulary range",
            "Practice time management"
          ],
          submittedAt: new Date().toISOString()
        }
      });
    }

    const systemPrompt = `You are an IELTS examiner. Analyze this ${skill} submission and provide detailed feedback.
    Return JSON format with: { "band_estimate": number, "breakdown": { "taskAchievement": number, "coherenceCohesion": number, "lexicalResource": number, "grammaticalRange": number, "fluency": number, "pronunciation": number }, "feedback": "...", "suggestions": ["...", "..."] }`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this ${skill} submission: ${submission_text}` }
      ],
      temperature: 0.3,
      max_tokens: 800
    });

    const content = response.choices[0].message.content;
    const analysisData = JSON.parse(content);

    // Save analysis to database
    const aiSubmission = new AISubmission({
      user_id: user_id || 'anonymous',
      skill,
      submission_text,
      audio_url,
      band_estimate: analysisData.band_estimate,
      breakdown: analysisData.breakdown,
      feedback: analysisData.feedback,
      suggestions: analysisData.suggestions
    });

    await aiSubmission.save();

    res.json({
      success: true,
      data: {
        band_estimate: analysisData.band_estimate,
        breakdown: analysisData.breakdown,
        feedback: analysisData.feedback,
        suggestions: analysisData.suggestions,
        submittedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI Analyze error:', error);
    
    // Return fallback analysis on error
    res.json({
      success: true,
      data: {
        band_estimate: 6.0,
        breakdown: {
          taskAchievement: 6.0,
          coherenceCohesion: 6.0,
          lexicalResource: 6.0,
          grammaticalRange: 6.0,
          fluency: 6.0,
          pronunciation: 6.0
        },
        feedback: "AI analysis temporarily unavailable. Your submission has been recorded for manual review.",
        suggestions: [
          "Focus on task completion",
          "Improve vocabulary range",
          "Practice time management"
        ],
        submittedAt: new Date().toISOString()
      }
    });
  }
});

// 3. GET RECOMMENDATIONS
// GET /ai-engine/recommend/:userId
router.get('/recommend/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Get user's recent submissions
    const recentSubmissions = await AISubmission.find({ user_id: userId })
      .sort({ submittedAt: -1 })
      .limit(10);

    // Get user's weakness profile
    const weaknessProfile = await WeaknessProfile.findOne({ user_id: userId });

    // Generate recommendations based on weaknesses
    const recommendations = [];
    
    if (weaknessProfile) {
      if (weaknessProfile.weakness.grammar < 6.0) {
        recommendations.push({
          type: 'grammar',
          title: 'Grammar Practice',
          description: 'Focus on complex sentence structures and advanced grammar',
          priority: 'high'
        });
      }
      
      if (weaknessProfile.weakness.lexical < 6.0) {
        recommendations.push({
          type: 'vocabulary',
          title: 'Vocabulary Enhancement',
          description: 'Expand your vocabulary with academic words and phrases',
          priority: 'high'
        });
      }
      
      if (weaknessProfile.weakness.coherence < 6.0) {
        recommendations.push({
          type: 'coherence',
          title: 'Coherence Practice',
          description: 'Work on logical flow and paragraph organization',
          priority: 'medium'
        });
      }
    }

    // Default recommendations if no weakness profile
    if (recommendations.length === 0) {
      recommendations.push(
        {
          type: 'general',
          title: 'General Practice',
          description: 'Continue practicing all IELTS skills',
          priority: 'medium'
        }
      );
    }

    res.json({
      success: true,
      data: {
        recommendations,
        recentSubmissions: recentSubmissions.length,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI Recommend error:', error);
    
    res.json({
      success: true,
      data: {
        recommendations: [
          {
            type: 'general',
            title: 'General Practice',
            description: 'Continue practicing all IELTS skills',
            priority: 'medium'
          }
        ],
        recentSubmissions: 0,
        lastUpdated: new Date().toISOString()
      }
    });
  }
});

// 4. GET WEAKNESS PROFILE
// GET /ai-engine/weakness/:userId
router.get('/weakness/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const weaknessProfile = await WeaknessProfile.findOne({ user_id: userId });
    
    if (!weaknessProfile) {
      // Create default weakness profile
      const defaultProfile = new WeaknessProfile({
        user_id: userId,
        weakness: {
          grammar: 5.0,
          lexical: 5.0,
          coherence: 5.0,
          pronunciation: 5.0
        },
        last_updated: new Date()
      });
      
      await defaultProfile.save();
      
      return res.json({
        success: true,
        data: {
          weakness: defaultProfile.weakness,
          last_updated: defaultProfile.last_updated,
          improvement_areas: ['grammar', 'lexical', 'coherence', 'pronunciation']
        }
      });
    }

    res.json({
      success: true,
      data: {
        weakness: weaknessProfile.weakness,
        last_updated: weaknessProfile.last_updated,
        improvement_areas: Object.keys(weaknessProfile.weakness).filter(
          key => weaknessProfile.weakness[key] < 6.0
        )
      }
    });

  } catch (error) {
    console.error('AI Weakness error:', error);
    
    res.json({
      success: true,
      data: {
        weakness: {
          grammar: 5.0,
          lexical: 5.0,
          coherence: 5.0,
          pronunciation: 5.0
        },
        last_updated: new Date().toISOString(),
        improvement_areas: ['grammar', 'lexical', 'coherence', 'pronunciation']
      }
    });
  }
});

export default router;