/**
 * IELTS Test Generator Controller
 * Now with AI cache system to reduce OpenAI costs
 */

const OpenAI = require('openai');
const { writingTemplates } = require('../prompts/ieltsTemplates/writingTemplate.js');
const { speakingTemplates } = require('../prompts/ieltsTemplates/speakingTemplate.js');
const { readingTemplates } = require('../prompts/ieltsTemplates/readingTemplate.js');
const { listeningTemplates } = require('../prompts/ieltsTemplates/listeningTemplate.js');
const { bandToCEFR } = require('../utils/levelMapper.js');
const CachedPrompt = require('../models/CachedPrompt');
const User = require('../models/User');

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const USE_AI_CACHE = process.env.USE_AI_CACHE !== 'false'; // Default true

/**
 * Generate IELTS test content using AI templates with cache system
 */
const generateIELTSTest = async (req, res) => {
  try {
    const { skill, level, topic, language } = req.body;
    const userId = req.user?._id;

    // Normalize level
    const levelMap = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const normalizedLevel = levelMap.includes(level) ? level : bandToCEFR(level);
    const normalizedTopic = topic || 'General English';

    // 1. Check cache if enabled
    if (USE_AI_CACHE && userId) {
      try {
        // Find a cached prompt that user hasn't used yet
        const cachedPrompt = await CachedPrompt.findOne({
          skill,
          level: normalizedLevel,
          topic: normalizedTopic,
          usedBy: { $ne: userId } // User hasn't received this prompt
        });

        if (cachedPrompt) {
          // CACHE HIT - return cached prompt
          console.log(`✅ [CACHE HIT] ${skill} ${normalizedLevel} ${normalizedTopic} - Served from DB`);

          // Update cache document
          await CachedPrompt.findByIdAndUpdate(cachedPrompt._id, {
            $addToSet: { usedBy: userId },
            $inc: { usageCount: 1 }
          });

          // Update user's completed prompts
          await User.findByIdAndUpdate(userId, {
            $addToSet: {
              completedPrompts: {
                promptId: cachedPrompt._id,
                skill: skill,
                completedAt: new Date()
              }
            }
          });

          return res.json({
            success: true,
            content: cachedPrompt.questionSet,
            cached: true,
            badge: '✨ Loaded from IELTS Library'
          });
        } else {
          console.log(`⚠️ [CACHE MISS] ${skill} ${normalizedLevel} ${normalizedTopic} - Generating new prompt from OpenAI`);
        }
      } catch (cacheError) {
        console.error('❌ Cache lookup error:', cacheError.message);
        // Continue to OpenAI generation if cache fails
      }
    }

    // 2. Generate new prompt via OpenAI
    const templates = { 
      writing: writingTemplates, 
      speaking: speakingTemplates, 
      reading: readingTemplates, 
      listening: listeningTemplates 
    };
    const baseTemplate = templates[skill]?.[normalizedLevel];

    if (!baseTemplate) {
      return res.status(400).json({ 
        success: false, 
        message: "Template not found for given skill/level" 
      });
    }

    // Check OpenAI availability
    if (!openai) {
      return res.status(503).json({ 
        success: false, 
        message: "AI service unavailable" 
      });
    }

    // Build system prompt
    const systemPrompt = `
You are an IELTS examiner.
Generate an authentic ${skill} test for IELTS ${normalizedLevel} based on Cambridge IELTS official format.
Topic: ${normalizedTopic}.

Use this base structure:
${JSON.stringify(baseTemplate, null, 2)}

Return ONLY JSON:
{
  "instructions": "string",
  "questions": [ "..." ],
  "expectedResponseFormat": "string"
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.8
    });

    // Parse response with robust fallback handling
    let content;
    const rawResponse = completion.choices[0].message.content;
    
    try {
      // First try: Direct JSON parse
      content = JSON.parse(rawResponse);
      console.log("✅ Successfully parsed JSON response");
    } catch (err) {
      // Second try: Extract JSON from markdown code blocks
      try {
        const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/) || rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          content = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          console.log("✅ Successfully parsed JSON from markdown");
        } else {
          throw new Error("No JSON found");
        }
      } catch (extractError) {
        // Fallback: Return raw text in a structured format
        console.warn("⚠️ OpenAI response not in JSON format. Returning raw text.");
        console.warn("Raw response preview:", rawResponse.substring(0, 200));
        
        content = {
          instructions: `Generated IELTS ${skill} test for level ${normalizedLevel}.`,
          questions: [rawResponse],
          expectedResponseFormat: "Descriptive text",
          metadata: {
            parsedSuccessfully: false,
            rawResponseUsed: true
          }
        };
      }
    }

    console.log(`✅ Generated IELTS test for: ${skill} ${normalizedLevel}`);

    // 3. Save to cache if enabled
    if (USE_AI_CACHE && userId) {
      try {
        // Transform content to questionSet format
        const questionSet = Array.isArray(content.questions) 
          ? content.questions.map((q, idx) => ({
              taskType: `${skill} ${idx + 1}`,
              question: typeof q === 'string' ? q : q.question || q,
              options: q.options || [],
              correctAnswer: q.correctAnswer || null
            }))
          : [{
              taskType: skill,
              question: content.questions || content.instructions,
              options: [],
              correctAnswer: null
            }];

        // Create new cached prompt
        const newCachedPrompt = new CachedPrompt({
          skill,
          level: normalizedLevel,
          topic: normalizedTopic,
          questionSet: questionSet,
          usedBy: [userId],
          usageCount: 1,
          metadata: {
            aiModel: 'gpt-4o-mini',
            tokensUsed: completion.usage?.total_tokens || 0,
            generatedAt: new Date()
          }
        });

        await newCachedPrompt.save();

        // Update user's completed prompts
        await User.findByIdAndUpdate(userId, {
          $addToSet: {
            completedPrompts: {
              promptId: newCachedPrompt._id,
              skill: skill,
              completedAt: new Date()
            }
          }
        });

        console.log(`💾 [CACHE SAVED] ${skill} ${normalizedLevel} ${normalizedTopic} - Saved to DB`);
      } catch (saveError) {
        console.error('❌ Cache save error:', saveError.message);
        // Continue even if cache save fails
      }
    }

    return res.json({
      success: true,
      content: content,
      cached: false,
      badge: '🤖 New AI-Generated Question'
    });

  } catch (error) {
    console.error("❌ Error generating IELTS test:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to generate test content'
    });
  }
};

module.exports = { generateIELTSTest };