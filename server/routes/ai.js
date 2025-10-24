import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

// POST /ai/assess - AI Assessment endpoint
router.post('/assess', async (req, res) => {
  try {
    const { skill, answer, level } = req.body;

    if (!answer || answer.trim().length === 0) {
      return res.json({
        bandScore: 0,
        feedback: 'No answer provided. Please complete the task to receive an assessment.'
      });
    }

    // Use real OpenAI API only
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === '') {
      return res.status(500).json({
        error: 'OpenAI API key not configured. Please contact administrator.'
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const prompt = `You are an IELTS examiner. Assess this ${skill} answer and provide:
1. Overall band score (0-9)
2. Breakdown by IELTS criteria:
   - Task Achievement/Response (0-9)
   - Coherence and Cohesion (0-9)
   - Lexical Resource (0-9)
   - Grammatical Range and Accuracy (0-9)
   - Fluency (0-9) ${skill === 'speaking' ? 'and Pronunciation (0-9)' : ''}
3. Detailed feedback
4. Improvement suggestions

Answer: "${answer}"
Level: ${level}

Respond in JSON format only.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.3
    });

    const aiResponse = completion.choices[0].message.content;
    console.log('✅ Real AI Assessment:', aiResponse);
    
    const parsedResponse = JSON.parse(aiResponse);
    return res.json(parsedResponse);

  } catch (error) {
    console.error('AI assessment error:', error);
    return res.status(500).json({
      error: 'AI assessment failed. Please try again later.',
      details: error.message
    });
  }
});

export default router;