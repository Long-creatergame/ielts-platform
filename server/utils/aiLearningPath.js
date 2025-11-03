/**
 * AI Learning Path Generator
 * Analyzes user performance and generates personalized learning recommendations
 */

const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

/**
 * Calculate average of array
 */
function average(arr = []) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + (val || 0), 0) / arr.length;
}

/**
 * Generate AI learning path based on band progress
 * @param {object} bandProgress - User's band progress per skill
 * @param {number} targetBand - User's target band score
 * @returns {object} Learning path with recommendations
 */
async function generateLearningPath(bandProgress = {}, targetBand = 6.5) {
  try {
    if (!bandProgress || Object.keys(bandProgress).length === 0) {
      console.warn('[AI LearningPath] No band progress data, returning fallback');
      return {
        targetSkill: 'Writing',
        nextFocus: 'Continue practicing IELTS Writing tasks to improve your band score.',
        aiReason: 'Start your journey by completing more tests to receive personalized recommendations.',
        lastUpdated: new Date()
      };
    }

    // Calculate averages per skill
    const averages = {
      reading: average(bandProgress.reading),
      listening: average(bandProgress.listening),
      writing: average(bandProgress.writing),
      speaking: average(bandProgress.speaking)
    };

    // Find weakest skill
    const skillOrder = ['reading', 'listening', 'writing', 'speaking'];
    const weakestSkill = skillOrder.reduce((min, skill) => {
      return averages[skill] < averages[min] ? skill : min;
    });

    console.log(`[AI LearningPath] Band averages:`, averages);
    console.log(`[AI LearningPath] Weakest skill: ${weakestSkill} (${averages[weakestSkill].toFixed(1)})`);

    // If OpenAI is not available, return fallback
    if (!openai) {
      console.warn('[AI LearningPath] OpenAI not configured, using fallback');
      return {
        targetSkill: weakestSkill,
        nextFocus: `Focus on improving ${weakestSkill} skills through targeted practice.`,
        aiReason: `Your current ${weakestSkill} score (${averages[weakestSkill].toFixed(1)}) is below your target of ${targetBand}.`,
        lastUpdated: new Date()
      };
    }

    // Generate AI-powered learning path
    const prompt = `
Analyze the IELTS skill performance below and provide a personalized learning recommendation:

Reading: ${averages.reading.toFixed(1)} / 9.0
Listening: ${averages.listening.toFixed(1)} / 9.0
Writing: ${averages.writing.toFixed(1)} / 9.0
Speaking: ${averages.speaking.toFixed(1)} / 9.0

Target Band: ${targetBand}

Weakest skill identified: ${weakestSkill} (${averages[weakestSkill].toFixed(1)})

Provide one short, actionable learning focus in Cambridge IELTS style.
Output ONLY JSON in this exact format:
{
  "targetSkill": "the weakest skill name",
  "nextFocus": "one specific, actionable recommendation",
  "aiReason": "brief explanation based on performance data"
}

Keep the tone supportive and professional. The recommendation should be practical and achievable.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an IELTS tutor providing personalized learning recommendations. Always respond with valid JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 200
    });

    const response = completion.choices[0].message.content;
    
    // Parse JSON response
    let plan;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        plan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.warn('[AI LearningPath] JSON parsing failed, using fallback');
      plan = {
        targetSkill: weakestSkill,
        nextFocus: `Focus on improving ${weakestSkill} skills through targeted practice.`,
        aiReason: `Your current ${weakestSkill} score needs improvement to reach your target.`
      };
    }

    plan.lastUpdated = new Date();
    
    console.log(`[AI LearningPath] Generated: ${plan.targetSkill} - ${plan.nextFocus}`);
    
    return plan;
  } catch (error) {
    console.error('[AI LearningPath] Error:', error.message);
    return {
      targetSkill: 'Writing',
      nextFocus: 'Continue practicing IELTS tasks to improve your overall band score.',
      aiReason: 'Learning path generation temporarily unavailable.',
      lastUpdated: new Date()
    };
  }
}

/**
 * Update band progress for a skill
 * @param {Array} currentProgress - Current band array
 * @param {number} newBand - New band score
 * @returns {Array} Updated progress array
 */
function updateBandProgress(currentProgress = [], newBand) {
  const updated = [...(currentProgress || [])];
  updated.push(newBand);
  
  // Keep only last 20 scores
  if (updated.length > 20) {
    updated.shift();
  }
  
  return updated;
}

module.exports = {
  generateLearningPath,
  updateBandProgress,
  average
};

