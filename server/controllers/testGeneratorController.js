/**
 * IELTS Test Generator Controller
 * Now with AI cache system + user preferences integration
 */

const OpenAI = require('openai');
const { writingTemplates } = require('../prompts/ieltsTemplates/writingTemplate.js');
const { speakingTemplates } = require('../prompts/ieltsTemplates/speakingTemplate.js');
const { readingTemplates } = require('../prompts/ieltsTemplates/readingTemplate.js');
const { listeningTemplates } = require('../prompts/ieltsTemplates/listeningTemplate.js');
const { bandToCEFR } = require('../utils/levelMapper.js');
const CachedPrompt = require('../models/CachedPrompt');
const User = require('../models/User');
const UserPreferences = require('../models/UserPreferences');

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const USE_AI_CACHE = process.env.USE_AI_CACHE !== 'false'; // Default true

/**
 * Generate IELTS test content using AI templates with cache system + user preferences
 */
const generateIELTSTest = async (req, res) => {
  try {
    const { skill, level, topic, language } = req.body;
    const userId = req.user?._id;

    // Log generation request
    console.info('[AI:Generate]', userId, skill, level, topic);

    // Validate required fields
    if (!skill) {
      return res.status(400).json({
        success: false,
        message: 'Skill is required'
      });
    }

    if (!level) {
      return res.status(400).json({
        success: false,
        message: 'Level is required'
      });
    }

    // Normalize level
    const levelMap = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const normalizedLevel = levelMap.includes(level) ? level : bandToCEFR(level);
    const normalizedTopic = topic || 'General English';

    // Fetch user preferences for personalization
    let userPreferences = null;
    if (userId) {
      try {
        const prefs = await UserPreferences.findOne({ userId });
        if (prefs) {
          userPreferences = prefs;
          console.info('[GenerateTest] User preferences loaded:', prefs.tone, prefs.difficulty);
        }
      } catch (prefsError) {
        console.warn('⚠️ Could not load user preferences:', prefsError.message);
      }
    }

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
          console.info('[AI:Cached]', skill, normalizedLevel, normalizedTopic);

          // Update cache document
          await CachedPrompt.findByIdAndUpdate(cachedPrompt._id, {
            $addToSet: { usedBy: userId },
            $inc: { usageCount: 1 }
          }).catch(() => {});

          // Update user's completed prompts
          await User.findByIdAndUpdate(userId, {
            $addToSet: {
              completedPrompts: {
                promptId: cachedPrompt._id,
                skill: skill,
                completedAt: new Date()
              }
            }
          }).catch(() => {});

          return res.json({
            success: true,
            data: {
              skill,
              topic: normalizedTopic,
              level: normalizedLevel,
              questions: cachedPrompt.questionSet,
              timeLimit: 30,
              cached: true
            },
            badge: '✨ Loaded from IELTS Library'
          });
        } else {
          console.info('[AI:CacheMiss]', skill, normalizedLevel, normalizedTopic);
        }
      } catch (cacheError) {
        console.error('[MongoDB:CacheError]', cacheError.message);
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
      console.warn('[AI:Fallback] Missing template for skill:', skill, 'level:', normalizedLevel);
      return res.status(200).json({ 
        success: false, 
        message: "Template not found for given skill/level. Please try a different level.",
        data: null
      });
    }

    // Check OpenAI availability
    if (!openai) {
      return res.status(503).json({ 
        success: false, 
        message: "AI service unavailable" 
      });
    }

    // Skip OpenAI calls during test/deploy to prevent timeout
    if (process.env.NODE_ENV === 'test') {
      console.log('[TestGenerator] Skipping OpenAI call during test/deploy');
      return res.status(200).json({ 
        success: false, 
        message: "AI service temporarily unavailable during deployment",
        data: null
      });
    }

    // Build enhanced system prompt with user preferences
    const preferenceContext = userPreferences 
      ? `User preferences: Tone=${userPreferences.tone || 'academic'}, Difficulty=${userPreferences.difficulty || 'adaptive'}, AI Style=${userPreferences.aiStyle || 'encouraging'}. Adapt the questions accordingly.`
      : 'Use standard academic IELTS format.';

    const systemPrompt = `
You are an IELTS examiner.
Generate an authentic ${skill} test for IELTS ${normalizedLevel} based on Cambridge IELTS official format.
Topic: ${normalizedTopic}.

${preferenceContext}

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
        console.info('[AI:Generated]', skill, normalizedLevel, '- JSON parsed successfully');
    } catch (err) {
      // Second try: Extract JSON from markdown code blocks
      try {
        const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/) || rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          content = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          console.info('[AI:Generated]', skill, normalizedLevel, '- JSON extracted from markdown');
        } else {
          throw new Error("No JSON found");
        }
      } catch (extractError) {
        // Fallback: Return raw text in a structured format
        console.warn('[AI:Fallback] OpenAI response not in JSON format, using raw text');
        
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

    console.info('[AI:Generated] Test created:', skill, normalizedLevel, normalizedTopic);

    // Transform content for consistent response format
    const questions = Array.isArray(content.questions) 
      ? content.questions 
      : [content.questions || content.instructions];

    // 3. Save to cache if enabled
    if (USE_AI_CACHE && userId) {
      try {
        // Transform content to questionSet format
        const questionSet = questions.map((q, idx) => ({
          taskType: `${skill} ${idx + 1}`,
          question: typeof q === 'string' ? q : q.question || q,
          options: q.options || [],
          correctAnswer: q.correctAnswer || null
        }));

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
        }).catch(() => {});

        console.info('[MongoDB:Cached] Prompt saved:', skill, normalizedLevel);
      } catch (saveError) {
        console.error('[MongoDB:SaveError]', saveError.message);
        // Continue even if cache save fails
      }
    }

    // Cambridge form structure based on mode
    const mode = req.body.mode || 'academic';
    let blueprint = {};
    
    if (mode === 'academic') {
      blueprint = {
        reading: { sections: 3, questions: 40 },
        listening: { sections: 4, questions: 40 },
        writing: {
          tasks: ['chart/diagram description', 'essay (argument/discussion)']
        },
        speaking: { parts: 3, duration: '11–14 min' }
      };
    } else {
      // General mode
      blueprint = {
        reading: { sections: 3, questions: 40 },
        listening: { sections: 4, questions: 40 },
        writing: {
          tasks: ['letter', 'essay (opinion/discussion)']
        },
        speaking: { parts: 3, duration: '11–14 min' }
      };
    }

    return res.json({
      success: true,
      data: {
        skill,
        topic: normalizedTopic,
        level: normalizedLevel,
        mode,
        blueprint,
        questions: questions,
        instructions: content.instructions,
        timeLimit: 30,
        cached: false
      },
      badge: '🤖 New AI-Generated Question'
    });

  } catch (error) {
    console.error('[AI:Error]', error.message);
    return res.status(200).json({ 
      success: false, 
      message: 'Failed to generate test content. Please try again later.',
      data: null
    });
  }
};

module.exports = { generateIELTSTest };