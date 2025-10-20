const OpenAI = require('openai');
const Test = require('../models/Test');
const EssayResult = require('../models/EssayResult');
const dotenv = require('dotenv');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
});

// AI Scoring function
const aiScore = async (req, res) => {
  try {
    const { skill, answer } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!skill || !answer) {
      return res.status(400).json({ error: 'Skill and answer are required' });
    }

    if (!['writing', 'speaking'].includes(skill.toLowerCase())) {
      return res.status(400).json({ error: 'AI scoring is only available for Writing and Speaking' });
    }

    // Create test record first
    const testRecord = new Test({
      userId,
      skill: skill.toLowerCase(),
      answers: [{
        content: answer
      }],
      status: 'pending'
    });

    await testRecord.save();

    // Create prompt for OpenAI
    const prompt = `
You are an experienced IELTS examiner. Please score the student's ${skill} response on a 0-9 scale.

For ${skill === 'writing' ? 'Writing' : 'Speaking'}, evaluate based on these criteria:
1. Task Response (Writing) / Fluency and Coherence (Speaking)
2. Coherence and Cohesion
3. Lexical Resource
4. Grammar Range and Accuracy

Student's ${skill} answer:
"""${answer}"""

Please provide your response in this exact JSON format:
{
  "overall": 7.0,
  "task": 7,
  "coherence": 7,
  "lexical": 6.5,
  "grammar": 7,
  "feedback": "Your essay shows good organization and clear arguments. However, you could improve vocabulary variety and sentence structure complexity. Focus on using more advanced linking words and varied sentence patterns."
}

Make sure the feedback is constructive and specific, around 50-100 words.
`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert IELTS examiner. Always respond with valid JSON format as requested.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    // Parse the response
    const aiResponse = completion.choices[0].message.content;
    let scoreData;

    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scoreData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw AI response:', aiResponse);
      
      // Fallback scoring if JSON parsing fails
      scoreData = {
        overall: 6.0,
        task: 6,
        coherence: 6,
        lexical: 6,
        grammar: 6,
        feedback: 'AI scoring completed. Please review your response for improvement.'
      };
    }

    // Update test record with scores
    testRecord.score = {
      overall: scoreData.overall,
      task: scoreData.task,
      coherence: scoreData.coherence,
      lexical: scoreData.lexical,
      grammar: scoreData.grammar
    };
    testRecord.aiFeedback = scoreData.feedback;
    testRecord.status = 'scored';

    await testRecord.save();

    // Return the scoring result
    res.json({
      success: true,
      testId: testRecord._id,
      score: {
        overall: scoreData.overall,
        task: scoreData.task,
        coherence: scoreData.coherence,
        lexical: scoreData.lexical,
        grammar: scoreData.grammar
      },
      feedback: scoreData.feedback
    });

  } catch (error) {
    console.error('AI scoring error:', error);
    
    if (error.code === 'insufficient_quota') {
      return res.status(402).json({ error: 'OpenAI API quota exceeded. Please check your API key and billing.' });
    }
    
    res.status(500).json({ error: 'AI scoring failed. Please try again.' });
  }
};

// Get test results for a user
const getTestResults = async (req, res) => {
  try {
    const userId = req.user._id;
    const { skill } = req.query;

    let query = { userId, status: 'scored' };
    if (skill) {
      query.skill = skill.toLowerCase();
    }

    const tests = await Test.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      tests: tests.map(test => ({
        id: test._id,
        skill: test.skill,
        score: test.score,
        feedback: test.aiFeedback,
        submittedAt: test.createdAt
      }))
    });

  } catch (error) {
    console.error('Get test results error:', error);
    res.status(500).json({ error: 'Failed to fetch test results' });
  }
};

// New essay scoring function for direct API calls
const scoreEssay = async (req, res) => {
  try {
    const { essay, userId } = req.body;
    
    if (!essay) {
      return res.status(400).json({ error: 'Essay content is required' });
    }

    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL || "llama3-8b-instant",
      messages: [
        { 
          role: "system", 
          content: "You are an IELTS examiner. Score essays on Task Response, Coherence, Lexical Resource, and Grammar. Respond with a band score (0-9) and short feedback." 
        },
        { role: "user", content: essay },
      ],
      temperature: 0.6,
      max_tokens: 500,
    });

    const aiText = response.choices[0].message?.content || "No feedback generated.";

    // Parse band score if available
    const bandMatch = aiText.match(/(\d(\.\d)?)/);
    const score = bandMatch ? parseFloat(bandMatch[0]) : 0;

    // ✅ Save result to MongoDB
    const saved = await EssayResult.create({
      userId: userId || "guest",
      essay,
      score,
      feedback: aiText,
      model: process.env.AI_MODEL,
    });

    return res.json({
      message: "Scoring complete and saved.",
      result: {
        _id: saved._id,
        score: saved.score,
        feedback: saved.feedback,
        createdAt: saved.createdAt,
      },
    });
  } catch (error) {
    console.error('AI Scoring Error:', error.message || error);
    return res.status(500).json({
      error: "AI scoring failed",
      details: error.message,
    });
  }
};

module.exports = {
  aiScore,
  getTestResults,
  scoreEssay
};

