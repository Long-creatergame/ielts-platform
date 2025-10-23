import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import WeaknessProfile from '../models/WeaknessProfile.js';
import PracticeSet from '../models/PracticeSet.js';
import AISubmission from '../models/AISubmission.js';

dotenv.config();

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.openai.com/v1',
});

// 1. GENERATE IELTS QUESTIONS
// POST /ai/generate
router.post('/generate', async (req, res) => {
  try {
    const { skill, topic, band = 6.5 } = req.body;
    
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
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate a ${skill} question for band ${band}` }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = response.choices[0].message.content;
    
    try {
      const questionData = JSON.parse(aiResponse);
      res.json({
        success: true,
        data: {
          skill,
          band,
          topic: topic || 'General',
          question: questionData.question,
          instructions: questionData.instructions,
          wordLimit: questionData.wordLimit || (skill === 'writing' ? 250 : 150),
          timeLimit: questionData.timeLimit || (skill === 'speaking' ? 120 : 60),
          createdAt: new Date().toISOString()
        }
      });
    } catch (parseError) {
      // Fallback if JSON parsing fails
      res.json({
        success: true,
        data: {
          skill,
          band,
          topic: topic || 'General',
          question: aiResponse,
          instructions: `Complete this ${skill} task following IELTS standards.`,
          wordLimit: skill === 'writing' ? 250 : 150,
          timeLimit: skill === 'speaking' ? 120 : 60,
          createdAt: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('AI Generate error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate IELTS question. Please try again.'
    });
  }
});

// 2. ANALYZE SUBMISSION
// POST /ai/analyze
router.post('/analyze', async (req, res) => {
  try {
    const { user_id, skill, submission_text, audio_url } = req.body;
    
    if (!user_id || !skill || !submission_text) {
      return res.status(400).json({ error: 'Missing required fields: user_id, skill, submission_text' });
    }

    // For speaking with audio, we would use Whisper API here
    // For now, we'll analyze the text directly
    let textToAnalyze = submission_text;
    
    if (audio_url && skill === 'speaking') {
      // TODO: Implement Whisper API transcription
      // const transcription = await transcribeAudio(audio_url);
      // textToAnalyze = transcription;
    }

    const systemPrompt = `You are an IELTS examiner. Evaluate this student's ${skill} submission using IELTS band descriptors.
Give numeric band scores (0–9) for each criterion, overall band estimate, and feedback with 3 actionable suggestions.

For ${skill}:
- Grammar: Grammatical range and accuracy
- Lexical: Lexical resource and vocabulary
- Coherence: Coherence and cohesion
- Pronunciation: Pronunciation (for speaking) or Task Achievement (for writing)

Return JSON format:
{
  "band_estimate": number,
  "breakdown": {
    "grammar": number,
    "lexical": number,
    "coherence": number,
    "pronunciation": number
  },
  "feedback": ["string", "string", "string"],
  "suggestions": ["string", "string", "string"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this ${skill} submission:\n\n${textToAnalyze}` }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const aiResponse = response.choices[0].message.content;
    
    try {
      const analysisData = JSON.parse(aiResponse);
      
      // Update user weakness profile
      await updateWeaknessProfile(user_id, analysisData.breakdown);
      
      res.json({
        success: true,
        data: {
          user_id,
          skill,
          band_estimate: analysisData.band_estimate,
          breakdown: analysisData.breakdown,
          feedback: analysisData.feedback,
          suggestions: analysisData.suggestions,
          analyzedAt: new Date().toISOString()
        }
      });
    } catch (parseError) {
      // Fallback analysis
      const fallbackAnalysis = {
        band_estimate: 6.0,
        breakdown: {
          grammar: 6.0,
          lexical: 6.0,
          coherence: 6.0,
          pronunciation: 6.0
        },
        feedback: [
          "Good attempt. Continue practicing to improve your skills.",
          "Focus on grammar accuracy and vocabulary range.",
          "Work on coherence and organization of ideas."
        ],
        suggestions: [
          "Practice more ${skill} exercises",
          "Review grammar rules and vocabulary",
          "Focus on time management and structure"
        ]
      };
      
      await updateWeaknessProfile(user_id, fallbackAnalysis.breakdown);
      
      res.json({
        success: true,
        data: {
          user_id,
          skill,
          ...fallbackAnalysis,
          analyzedAt: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('AI Analyze error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze submission. Please try again.'
    });
  }
});

// 3. RECOMMEND PRACTICE
// GET /ai/recommend/:userId
router.get('/recommend/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's weakness profile
    const weaknessProfile = await getWeaknessProfile(userId);
    
    if (!weaknessProfile) {
      return res.json({
        success: true,
        data: {
          recommendations: [
            {
              type: 'general',
              title: 'Start with Basic Practice',
              description: 'Begin with fundamental IELTS exercises',
              difficulty: 'beginner',
              estimatedTime: '30 minutes'
            }
          ]
        }
      });
    }

    const systemPrompt = `You are an IELTS practice recommender.
Given user's weakness profile:
${JSON.stringify(weaknessProfile)}
Suggest 3 practice questions or tasks focusing on the weakest areas.
Return JSON format:
{
  "recommendations": [
    {
      "type": "writing|speaking|reading|listening",
      "title": "string",
      "description": "string",
      "difficulty": "beginner|intermediate|advanced",
      "estimatedTime": "string",
      "focusAreas": ["string", "string"]
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: 'Generate personalized practice recommendations' }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = response.choices[0].message.content;
    
    try {
      const recommendations = JSON.parse(aiResponse);
      res.json({
        success: true,
        data: recommendations
      });
    } catch (parseError) {
      // Fallback recommendations
      res.json({
        success: true,
        data: {
          recommendations: [
            {
              type: 'writing',
              title: 'Improve Grammar Practice',
              description: 'Focus on grammatical accuracy and sentence structure',
              difficulty: 'intermediate',
              estimatedTime: '45 minutes',
              focusAreas: ['grammar', 'coherence']
            },
            {
              type: 'speaking',
              title: 'Vocabulary Enhancement',
              description: 'Expand lexical resource and pronunciation',
              difficulty: 'intermediate',
              estimatedTime: '30 minutes',
              focusAreas: ['lexical', 'pronunciation']
            }
          ]
        }
      });
    }

  } catch (error) {
    console.error('AI Recommend error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations. Please try again.'
    });
  }
});

// 4. GET WEAKNESS PROFILE
// GET /ai/weakness/:userId
router.get('/weakness/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const weaknessProfile = await getWeaknessProfile(userId);
    
    res.json({
      success: true,
      data: weaknessProfile || {
        user_id: userId,
        weakness: {
          grammar: 0,
          lexical: 0,
          coherence: 0,
          pronunciation: 0
        },
        last_updated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get weakness error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get weakness profile.'
    });
  }
});

// Helper functions with better error handling
async function updateWeaknessProfile(userId, breakdown) {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, skipping weakness profile update');
      return null;
    }
    const profile = await WeaknessProfile.updateUserWeakness(userId, breakdown);
    return profile;
  } catch (error) {
    console.error('Error updating weakness profile:', error);
    return null; // Don't throw error, just return null
  }
}

async function getWeaknessProfile(userId) {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, returning null weakness profile');
      return null;
    }
    const profile = await WeaknessProfile.getUserWeakness(userId);
    return profile;
  } catch (error) {
    console.error('Error getting weakness profile:', error);
    return null;
  }
}

export default router;
