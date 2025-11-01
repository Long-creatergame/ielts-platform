/**
 * Learning Path Controller
 * AI-powered personalized learning path generation based on test results
 */

const OpenAI = require('openai');
const Test = require('../models/Test');
const LearningPath = require('../models/LearningPath');
const { bandToCEFR, cefrToNumeric } = require('../utils/levelMapper');

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

/**
 * Generate personalized learning path
 */
const generateLearningPath = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get recent test results for this user
    const recentTests = await Test.find({ userId })
      .sort({ dateTaken: -1 })
      .limit(5)
      .select('skillBands totalBand completed answers dateTaken')
      .lean();

    if (!recentTests || recentTests.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No test results found. Please complete at least one test first.'
      });
    }

    // Analyze test results
    const analysis = analyzeTestResults(recentTests);
    
    // Check if OpenAI is available
    if (!openai) {
      // Return basic recommendations without AI
      return res.json({
        success: true,
        learningPath: createBasicLearningPath(userId, analysis, recentTests),
        message: 'Basic recommendations (AI unavailable)'
      });
    }

    // Generate AI-powered learning path
    const aiPath = await generateAILearningPath(userId, analysis, recentTests);
    
    return res.json({
      success: true,
      learningPath: aiPath,
      message: 'Personalized AI learning path generated'
    });

  } catch (error) {
    console.error('❌ Error generating learning path:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate learning path'
    });
  }
};

/**
 * Get user's current learning path
 */
const getLearningPath = async (req, res) => {
  try {
    const userId = req.user._id;

    const learningPath = await LearningPath.findOne({ userId })
      .sort({ generatedAt: -1 });

    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'No learning path found'
      });
    }

    return res.json({
      success: true,
      learningPath
    });

  } catch (error) {
    console.error('❌ Error fetching learning path:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch learning path'
    });
  }
};

/**
 * Analyze test results to identify patterns
 */
function analyzeTestResults(tests) {
  const skillBands = {
    reading: [],
    listening: [],
    writing: [],
    speaking: []
  };
  
  const overallBands = [];
  
  tests.forEach(test => {
    // Collect band scores
    if (test.skillBands) {
      Object.keys(test.skillBands).forEach(skill => {
        const band = test.skillBands[skill];
        // Handle both number and string bands
        const numericBand = typeof band === 'number' ? band : parseFloat(band);
        if (!isNaN(numericBand)) {
          skillBands[skill].push(numericBand);
        }
      });
    }
    
    // Collect overall bands
    const overall = typeof test.totalBand === 'number' 
      ? test.totalBand 
      : parseFloat(test.totalBand);
    if (!isNaN(overall)) {
      overallBands.push(overall);
    }
  });
  
  // Calculate averages
  const averages = {};
  Object.keys(skillBands).forEach(skill => {
    const scores = skillBands[skill];
    if (scores.length > 0) {
      averages[skill] = scores.reduce((a, b) => a + b, 0) / scores.length;
    } else {
      averages[skill] = 0;
    }
  });
  
  const overallAverage = overallBands.length > 0
    ? overallBands.reduce((a, b) => a + b, 0) / overallBands.length
    : 5.5;
  
  // Identify strengths and weaknesses
  const sortedSkills = Object.entries(averages).sort((a, b) => b[1] - a[1]);
  const strengths = sortedSkills.slice(0, 2).map(s => s[0]);
  const weaknesses = sortedSkills.slice(-2).map(s => s[0]);
  
  return {
    averages,
    overallAverage,
    strengths,
    weaknesses,
    currentLevel: bandToCEFR(overallAverage).level
  };
}

/**
 * Generate AI-powered learning path
 */
async function generateAILearningPath(userId, analysis, recentTests) {
  const systemPrompt = `You are an expert IELTS learning coach. Analyze the test results and generate a personalized learning path.

Test Analysis:
- Overall Band: ${analysis.overallAverage.toFixed(1)}
- Current Level: ${analysis.currentLevel}
- Strengths: ${analysis.strengths.join(', ')}
- Weaknesses: ${analysis.weaknesses.join(', ')}

Skill Bands:
${JSON.stringify(analysis.averages, null, 2)}

Recent Tests: ${recentTests.length} completed

Generate a JSON response with:
{
  "strengths": ["skill names"],
  "weaknesses": ["skill names"],
  "recommendations": [
    {
      "skill": "writing|reading|listening|speaking",
      "taskType": "Task 2 Essay / Section 4 / etc.",
      "priority": "high|medium|low",
      "description": "Why this is recommended",
      "estimatedTime": 30,
      "resources": []
    }
  ],
  "targetBand": ${analysis.overallAverage + 0.5},
  "targetLevel": "CEFR level one step higher",
  "studyPlan": {
    "dailyMinutes": 45,
    "weeklySessions": 5,
    "focusAreas": ["weaknesses focus"]
  }
}

Provide practical, actionable recommendations based on Cambridge IELTS standards.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Generate a personalized learning path for this IELTS learner.' }
    ],
    temperature: 0.7,
    max_tokens: 1000
  });

  // Parse AI response
  let aiContent;
  const rawResponse = completion.choices[0].message.content;
  
  try {
    aiContent = JSON.parse(rawResponse);
  } catch (err) {
    // Try extracting JSON from markdown
    try {
      const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/) || rawResponse.match(/\{[\s\S]*\}/);
      aiContent = jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : null;
    } catch (e) {
      console.warn('⚠️ Failed to parse AI response, using fallback');
      aiContent = null;
    }
  }

  // Prepare learning path data
  const learningPathData = {
    userId,
    strengths: aiContent?.strengths || analysis.strengths,
    weaknesses: aiContent?.weaknesses || analysis.weaknesses,
    recommendations: aiContent?.recommendations || createBasicRecommendations(analysis.weaknesses),
    overallBand: analysis.overallAverage,
    targetBand: aiContent?.targetBand || Math.min(9, analysis.overallAverage + 0.5),
    currentLevel: analysis.currentLevel,
    targetLevel: aiContent?.targetLevel || getNextLevel(analysis.currentLevel),
    skillBands: analysis.averages,
    studyPlan: aiContent?.studyPlan || {
      dailyMinutes: 45,
      weeklySessions: 5,
      focusAreas: analysis.weaknesses
    },
    testResultsUsed: recentTests.map(t => ({
      testId: t._id,
      testDate: t.dateTaken
    })),
    aiModel: 'gpt-4o-mini',
    generatedAt: new Date(),
    lastUpdated: new Date()
  };

  // Save to database
  const learningPath = new LearningPath(learningPathData);
  await learningPath.save();

  return learningPath;
}

/**
 * Create basic learning path without AI
 */
function createBasicLearningPath(userId, analysis, recentTests) {
  return {
    userId,
    strengths: analysis.strengths,
    weaknesses: analysis.weaknesses,
    recommendations: createBasicRecommendations(analysis.weaknesses),
    overallBand: analysis.overallAverage,
    targetBand: Math.min(9, analysis.overallAverage + 0.5),
    currentLevel: analysis.currentLevel,
    targetLevel: getNextLevel(analysis.currentLevel),
    skillBands: analysis.averages,
    studyPlan: {
      dailyMinutes: 45,
      weeklySessions: 5,
      focusAreas: analysis.weaknesses
    },
    testResultsUsed: recentTests.map(t => ({
      testId: t._id,
      testDate: t.dateTaken
    }))
  };
}

/**
 * Create basic recommendations without AI
 */
function createBasicRecommendations(weaknesses) {
  const recommendations = [];
  
  weaknesses.forEach(skill => {
    switch(skill) {
      case 'writing':
        recommendations.push({
          skill: 'writing',
          taskType: 'Task 2 Essay',
          priority: 'high',
          description: 'Focus on essay structure and argument development',
          estimatedTime: 60,
          resources: []
        });
        break;
      case 'speaking':
        recommendations.push({
          skill: 'speaking',
          taskType: 'Part 2 Long Turn',
          priority: 'high',
          description: 'Practice extended speaking with cue cards',
          estimatedTime: 30,
          resources: []
        });
        break;
      case 'reading':
        recommendations.push({
          skill: 'reading',
          taskType: 'Academic Passages',
          priority: 'medium',
          description: 'Improve reading speed and comprehension',
          estimatedTime: 60,
          resources: []
        });
        break;
      case 'listening':
        recommendations.push({
          skill: 'listening',
          taskType: 'Section 4 Lectures',
          priority: 'medium',
          description: 'Practice academic listening with note-taking',
          estimatedTime: 30,
          resources: []
        });
        break;
    }
  });
  
  return recommendations;
}

/**
 * Get next CEFR level
 */
function getNextLevel(currentLevel) {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const currentIndex = levels.indexOf(currentLevel);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : 'C2';
}

module.exports = {
  generateLearningPath,
  getLearningPath
};
