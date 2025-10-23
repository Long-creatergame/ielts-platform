import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE || 'https://api.groq.com/openai/v1',
});

// AI-powered IELTS assessment endpoint
router.post('/assess', async (req, res) => {
  try {
    const { skill, answer, level } = req.body;
    
    if (!answer || answer.trim().length === 0) {
      return res.json({
        bandScore: 0,
        feedback: 'No answer provided. Please complete the task to receive an assessment.'
      });
    }

    // Create skill-specific assessment prompts
    const assessmentPrompts = {
      reading: `You are an IELTS Reading examiner. Assess this reading comprehension answer:

Answer: "${answer}"

Provide:
1. Band Score (0-9) based on IELTS Reading criteria
2. Detailed feedback on:
   - Content relevance
   - Answer accuracy
   - Understanding of the passage
   - Areas for improvement

Format your response as JSON:
{
  "bandScore": [number],
  "feedback": "[detailed feedback]"
}`,

      listening: `You are an IELTS Listening examiner. Assess this listening comprehension answer:

Answer: "${answer}"

Provide:
1. Band Score (0-9) based on IELTS Listening criteria
2. Detailed feedback on:
   - Information accuracy
   - Listening comprehension
   - Note-taking skills
   - Areas for improvement

Format your response as JSON:
{
  "bandScore": [number],
  "feedback": "[detailed feedback]"
}`,

      writing: `You are an IELTS Writing examiner. Assess this writing task:

Answer: "${answer}"

Evaluate based on IELTS Writing criteria:
1. Task Achievement (25%)
2. Coherence and Cohesion (25%)
3. Lexical Resource (25%)
4. Grammatical Range and Accuracy (25%)

Provide:
1. Band Score (0-9)
2. Detailed feedback on each criterion
3. Specific improvement suggestions

Format your response as JSON:
{
  "bandScore": [number],
  "feedback": "[detailed feedback]"
}`,

      speaking: `You are an IELTS Speaking examiner. Assess this speaking response:

Answer: "${answer}"

Evaluate based on IELTS Speaking criteria:
1. Fluency and Coherence (25%)
2. Lexical Resource (25%)
3. Grammatical Range and Accuracy (25%)
4. Pronunciation (25%)

Provide:
1. Band Score (0-9)
2. Detailed feedback on each criterion
3. Specific improvement suggestions

Format your response as JSON:
{
  "bandScore": [number],
  "feedback": "[detailed feedback]"
}`
    };

    const prompt = assessmentPrompts[skill] || assessmentPrompts.writing;
    
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL || "llama3-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are an expert IELTS examiner with 10+ years of experience. Provide accurate, professional assessments based on official IELTS criteria."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const aiResponse = response.choices[0].message.content;
    
    try {
      // Try to parse JSON response
      const parsedResponse = JSON.parse(aiResponse);
      res.json(parsedResponse);
    } catch (parseError) {
      // If JSON parsing fails, extract band score and create structured response
      const bandScoreMatch = aiResponse.match(/bandScore["\s]*:[\s]*([0-9.]+)/i);
      const bandScore = bandScoreMatch ? parseFloat(bandScoreMatch[1]) : 5.0;
      
      res.json({
        bandScore: Math.min(9, Math.max(0, bandScore)),
        feedback: aiResponse || 'AI assessment completed.'
      });
    }

  } catch (error) {
    console.error('AI assessment error:', error);
    res.status(500).json({
      bandScore: 5.0,
      feedback: 'AI assessment temporarily unavailable. Please try again later.'
    });
  }
});

export default router;