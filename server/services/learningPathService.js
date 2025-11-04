/**
 * Learning Path Service
 * Adaptive Learning Path Generator
 * Creates personalized study plans based on assessment results
 */

const User = require('../models/User');
const { detectWeakSkills, getSkillFocus } = require('./aiAssessmentService');
const { getNextCEFRLevel, getCEFRLabel } = require('../utils/cefrMapper');

/**
 * Get suggested activities for a skill based on current band
 * @param {string} skill - Skill name
 * @param {number} currentBand - Current band score
 * @returns {Array} Array of activity descriptions
 */
function getActivities(skill, currentBand) {
  const activities = {
    'reading': [
      'Practice skimming and scanning techniques',
      'Read academic articles and summarize key points',
      'Complete matching headings exercises',
      'Work on True/False/Not Given questions',
      'Build vocabulary with academic word lists'
    ],
    'listening': [
      'Listen to IELTS practice recordings daily',
      'Practice note-taking during listening',
      'Complete gap-fill exercises',
      'Watch TED talks and summarize main ideas',
      'Practice identifying speaker attitudes'
    ],
    'writing': [
      'Study essay structure (introduction, body, conclusion)',
      'Practice using linking devices and connectors',
      'Write Task 1 descriptions (graphs/charts/letters)',
      'Practice Task 2 argument essays',
      'Review and rewrite with feedback'
    ],
    'speaking': [
      'Record yourself answering Part 2 cue cards',
      'Practice Part 1 introduction questions',
      'Work on fluency with daily conversation practice',
      'Focus on pronunciation of difficult sounds',
      'Practice Part 3 discussion questions'
    ]
  };

  // Filter activities based on band level
  const bandLevel = currentBand < 5.0 ? 'beginner' : currentBand < 7.0 ? 'intermediate' : 'advanced';
  
  // Return first 3-4 activities (adjust based on level)
  const skillActivities = activities[skill] || activities['reading'];
  return skillActivities.slice(0, bandLevel === 'beginner' ? 3 : 4);
}

/**
 * Generate adaptive learning path based on assessment results
 * @param {string} userId - User ID
 * @param {object} assessment - Assessment result from evaluateTest
 * @returns {object} Learning plan
 */
async function generateLearningPath(userId, assessment) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { bands, overall, cefr } = assessment;
    const weakSkills = detectWeakSkills(assessment);
    
    // Calculate target band (current + 0.5, but not exceeding 9.0)
    const targetBand = Math.min(overall + 0.5, 9.0);
    const nextCEFR = getNextCEFRLevel(cefr);
    
    // Generate study plan for weak skills
    const suggestedPlan = weakSkills.map((skill) => {
      const skillBand = bands[skill] || 0;
      return {
        skill,
        focus: getSkillFocus(skill),
        suggestedActivities: getActivities(skill, skillBand),
        goalBand: Math.min(skillBand + 0.5, 9.0),
        duration: skillBand < 5.0 ? '2 weeks' : '1 week',
        priority: skillBand < overall - 1.0 ? 'high' : 'medium'
      };
    });

    // If no weak skills, focus on overall improvement
    if (suggestedPlan.length === 0) {
      // Find skill with lowest band
      const allSkills = Object.entries(bands).filter(([_, band]) => band > 0);
      if (allSkills.length > 0) {
        const [lowestSkill, lowestBand] = allSkills.reduce((min, [skill, band]) => 
          band < min[1] ? [skill, band] : min
        );
        
        suggestedPlan.push({
          skill: lowestSkill,
          focus: getSkillFocus(lowestSkill),
          suggestedActivities: getActivities(lowestSkill, lowestBand),
          goalBand: Math.min(lowestBand + 0.5, 9.0),
          duration: '1 week',
          priority: 'medium'
        });
      }
    }

    // Save learning path to user
    const learningPath = {
      overallBand: overall,
      targetBand,
      currentCEFR: cefr,
      nextCEFR,
      weakSkills,
      suggestedPlan,
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 2 weeks
    };

    // Update user learning path
    user.learningPath = {
      targetSkill: weakSkills[0] || 'general',
      nextFocus: suggestedPlan[0]?.focus || 'General Improvement',
      aiReason: `Based on your ${cefr} level (Band ${overall}), focus on ${suggestedPlan[0]?.skill || 'all skills'} to reach Band ${targetBand.toFixed(1)}.`,
      lastUpdated: new Date()
    };

    // Update user's current level if CEFR changed
    if (user.currentLevel !== cefr) {
      user.currentLevel = cefr;
    }

    await user.save();

    console.log(`[Learning Path] Generated for user ${userId}: ${suggestedPlan.length} focus areas`);

    return learningPath;
  } catch (error) {
    console.error('[Learning Path] Error generating path:', error.message);
    throw error;
  }
}

/**
 * Save learning plan to user (optional separate storage)
 * @param {string} userId - User ID
 * @param {object} plan - Learning plan object
 * @returns {boolean} Success status
 */
async function saveLearningPlan(userId, plan) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return false;
    }

    // Store in user's learningPath field
    user.learningPath = {
      targetSkill: plan.weakSkills?.[0] || 'general',
      nextFocus: plan.suggestedPlan?.[0]?.focus || 'General Improvement',
      aiReason: `Target Band: ${plan.targetBand}. Focus on ${plan.suggestedPlan?.length || 0} key areas.`,
      lastUpdated: new Date()
    };

    await user.save();
    return true;
  } catch (error) {
    console.error('[Learning Path] Error saving plan:', error.message);
    return false;
  }
}

/**
 * Get user's current learning path
 * @param {string} userId - User ID
 * @returns {object} Current learning path or null
 */
async function getLearningPath(userId) {
  try {
    const user = await User.findById(userId);
    if (!user || !user.learningPath) {
      return null;
    }

    return {
      targetSkill: user.learningPath.targetSkill,
      nextFocus: user.learningPath.nextFocus,
      aiReason: user.learningPath.aiReason,
      lastUpdated: user.learningPath.lastUpdated
    };
  } catch (error) {
    console.error('[Learning Path] Error getting path:', error.message);
    return null;
  }
}

module.exports = {
  generateLearningPath,
  saveLearningPlan,
  getLearningPath,
  getActivities
};
