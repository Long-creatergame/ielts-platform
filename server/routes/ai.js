import express from 'express';
// import OpenAI from 'openai'; // TEMPORARILY DISABLED
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
//   baseURL: 'https://api.openai.com/v1', // Use OpenAI directly instead of Groq
// }); // TEMPORARILY DISABLED

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

    // TEMPORARY: Disable AI assessment to fix deployment
    // TODO: Re-enable after fixing OpenAI API key and billing
    return res.json({
      bandScore: 6.0,
      feedback: 'AI assessment temporarily disabled. Basic scoring applied. Please contact support if you need detailed feedback.'
    });

    /* COMMENTED OUT TO FIX DEPLOYMENT
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

      writing: `You are an official IELTS Writing examiner. Assess this writing task with the same standards as Cambridge Assessment:

Answer: "${answer}"

Evaluate based on OFFICIAL IELTS Writing criteria:

**Task Achievement (25%):**
- Does the answer address all parts of the task?
- Is the position clear and consistent?
- Are ideas relevant and well-developed?

**Coherence and Cohesion (25%):**
- Is the information organized logically?
- Are cohesive devices used effectively?
- Is there clear progression throughout?

**Lexical Resource (25%):**
- Is vocabulary used flexibly and precisely?
- Are there attempts at less common vocabulary?
- Is word formation and spelling accurate?

**Grammatical Range and Accuracy (25%):**
- Are a variety of sentence structures used?
- Is grammar accurate and appropriate?
- Are complex sentences attempted?

Provide:
1. Band Score (0-9) with decimal precision
2. Detailed feedback on each criterion
3. Specific examples from the text
4. Actionable improvement suggestions

Format your response as JSON:
{
  "bandScore": [number],
  "feedback": "[detailed feedback with specific examples]"
}`,

      speaking: `You are an official IELTS Speaking examiner. Assess this speaking response with Cambridge Assessment standards:

Answer: "${answer}"

Evaluate based on OFFICIAL IELTS Speaking criteria:

**Fluency and Coherence (25%):**
- Can the candidate speak at length without hesitation?
- Is speech coherent and logically organized?
- Are there appropriate pauses and self-correction?

**Lexical Resource (25%):**
- Is vocabulary used flexibly and precisely?
- Are there attempts at less common vocabulary?
- Is paraphrasing attempted when necessary?

**Grammatical Range and Accuracy (25%):**
- Are a variety of sentence structures used?
- Is grammar accurate and appropriate?
- Are complex sentences attempted?

**Pronunciation (25%):**
- Are individual sounds clear and intelligible?
- Is word stress and sentence stress appropriate?
- Is intonation natural and varied?

Note: Since this is text-based, focus on content, vocabulary, and grammar. Assume pronunciation would be assessed in live speaking.

Provide:
1. Band Score (0-9) with decimal precision
2. Detailed feedback on each criterion
3. Specific examples from the response
4. Actionable improvement suggestions

Format your response as JSON:
{
  "bandScore": [number],
  "feedback": "[detailed feedback with specific examples]"
}`
    };

    const prompt = assessmentPrompts[skill] || assessmentPrompts.writing;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4", // Use GPT-4 for better IELTS assessment
      messages: [
        {
          role: "system",
          content: "You are an expert IELTS examiner with 10+ years of experience. Provide accurate, professional assessments based on official IELTS criteria. You have access to the latest IELTS scoring rubrics and assessment standards."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2, // Lower temperature for more consistent scoring
      max_tokens: 1500, // More tokens for detailed feedback
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
    */ // END COMMENTED OUT SECTION

export default router;