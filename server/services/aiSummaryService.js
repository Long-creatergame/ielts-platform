/**
 * AI Summary Service
 * Analyzes feedback history and generates personalized learning insights
 */

const AIFeedback = require('../models/AIFeedback');

/**
 * Generate AI summary based on user's feedback history
 */
async function generateAISummary(userId, userLevel = 'B1') {
  try {
    // Fetch recent feedback
    const feedbacks = await AIFeedback.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    if (!feedbacks || feedbacks.length === 0) {
      console.log('[AI Summary] No feedback history found for user:', userId);
      return null;
    }

    // Calculate averages across all feedback
    const averages = {};
    const count = {};

    for (const fb of feedbacks) {
      const bb = fb.bandBreakdown || {};
      
      for (const [key, value] of Object.entries(bb)) {
        if (value > 0) {
          averages[key] = (averages[key] || 0) + value;
          count[key] = (count[key] || 0) + 1;
        }
      }
    }

    // Calculate final averages
    const avgBand = {};
    for (const key in averages) {
      if (count[key] > 0) {
        avgBand[key] = parseFloat((averages[key] / count[key]).toFixed(1));
      }
    }

    // Find weakest and strongest skills
    const sortedSkills = Object.entries(avgBand).sort((a, b) => a[1] - b[1]);
    const weakestSkill = sortedSkills[0];
    const strongestSkill = sortedSkills[sortedSkills.length - 1];

    console.log('[AI Summary] Weakest:', weakestSkill[0], 'Strongest:', strongestSkill[0]);

    // Generate AI summary with Cambridge tone based on level
    const aiSummary = generateAISummaryMessage(
      strongestSkill, 
      weakestSkill, 
      avgBand, 
      userLevel
    );

    // Generate recommendation
    const recommendation = generateRecommendation(weakestSkill, userLevel);

    const summaryData = {
      avgBand,
      strongestSkill: strongestSkill[0],
      weakestSkill: weakestSkill[0],
      strongestScore: strongestSkill[1],
      weakestScore: weakestSkill[1],
      aiSummary,
      recommendation,
      feedbackCount: feedbacks.length
    };

    console.log('[AI Summary] ✅ Generated summary for user:', userId);

    return summaryData;
  } catch (error) {
    console.error('[AI Summary] Error:', error.message);
    return null;
  }
}

/**
 * Generate AI summary message with Cambridge tone
 */
function generateAISummaryMessage(strongest, weakest, avgBand, level) {
  const overallAvg = Object.values(avgBand).reduce((sum, val) => sum + val, 0) / Object.values(avgBand).length;

  // Level-based tone
  const tones = {
    'A1': {
      supportive: [
        "You're making great progress!",
        "Keep up the excellent work!",
        "You're building strong foundations!"
      ],
      advice: "Focus on the basics first."
    },
    'A2': {
      supportive: [
        "Good effort! You're improving steadily.",
        "Nice consistency. Keep working step by step.",
        "You're showing strong commitment to learning."
      ],
      advice: "Continue practicing regularly."
    },
    'B1': {
      supportive: [
        "You're progressing well!",
        "Good consistency. Keep improving step by step.",
        "You're showing strong effort and steady growth."
      ],
      advice: "Focus on refining your skills."
    },
    'B2': {
      supportive: [
        "Excellent progress! You're building strong skills.",
        "Good consistency. You're approaching advanced levels.",
        "You're demonstrating strong understanding and application."
      ],
      advice: "Refine your techniques for higher precision."
    },
    'C1': {
      supportive: [
        "Outstanding performance! You're mastering advanced concepts.",
        "Professional-level consistency. Excellent work.",
        "You're showing exceptional competence across skills."
      ],
      advice: "Polish your advanced techniques for excellence."
    },
    'C2': {
      supportive: [
        "Exceptional mastery! You've achieved expert-level skills.",
        "Outstanding precision and consistency.",
        "You're demonstrating professional expertise."
      ],
      advice: "Perfect your nuanced understanding."
    }
  };

  const tone = tones[level] || tones['B1'];
  const supportiveMsg = tone.supportive[Math.floor(Math.random() * tone.supportive.length)];

  return `${supportiveMsg} Your average performance shows strength in ${strongest[0]} (${strongest[1]}), but ${weakest[0]} (${weakest[1]}) needs more attention. ${tone.advice}`;
}

/**
 * Generate personalized recommendation
 */
function generateRecommendation(weakestSkill, level) {
  const recommendations = {
    'Grammar': {
      'A1': "Review basic grammar rules and practice sentence construction.",
      'A2': "Focus on tense accuracy and sentence complexity.",
      'B1': "Practice advanced grammar structures and accuracy.",
      'B2': "Refine complex sentence patterns and grammatical precision.",
      'C1': "Master nuanced grammatical structures for academic writing.",
      'C2': "Perfect subtle grammatical nuances and stylistic variation."
    },
    'Vocabulary': {
      'A1': "Learn essential words and phrases for daily communication.",
      'A2': "Expand your basic vocabulary with common expressions.",
      'B1': "Build vocabulary range with varied and precise words.",
      'B2': "Enhance lexical resource with collocations and idioms.",
      'C1': "Develop sophisticated vocabulary for academic contexts.",
      'C2': "Master precise lexical choices and academic register."
    },
    'Coherence': {
      'A1': "Practice organizing ideas in clear, simple paragraphs.",
      'A2': "Focus on logical paragraph structure and connections.",
      'B1': "Improve paragraph flow using linking words.",
      'B2': "Refine logical progression and cohesive devices.",
      'C1': "Perfect sophisticated transitions and discourse markers.",
      'C2': "Master nuanced organization and rhetorical structure."
    },
    'Task': {
      'A1': "Focus on addressing the question completely.",
      'A2': "Ensure all parts of the task are covered.",
      'B1': "Develop clear, relevant responses to all task points.",
      'B2': "Enhance task completion with thorough coverage.",
      'C1': "Perfect task response with comprehensive analysis.",
      'C2': "Master sophisticated task response with nuanced insights."
    },
    'Fluency': {
      'A1': "Practice speaking smoothly without long pauses.",
      'A2': "Focus on natural speech flow and rhythm.",
      'B1': "Improve speaking pace and natural connections.",
      'B2': "Enhance fluency with smooth transitions.",
      'C1': "Perfect natural, effortless speech delivery.",
      'C2': "Master sophisticated speaking rhythm and pace."
    },
    'Pronunciation': {
      'A1': "Practice clear pronunciation of basic sounds.",
      'A2': "Focus on accurate word stress and intonation.",
      'B1': "Improve pronunciation clarity and naturalness.",
      'B2': "Refine pronunciation for advanced communication.",
      'C1': "Perfect nuanced pronunciation and accent.",
      'C2': "Master sophisticated pronunciation patterns."
    }
  };

  const skillRecs = recommendations[weakestSkill[0]] || recommendations['Grammar'];
  const recommendedPractice = skillRecs[level] || skillRecs['B1'];

  return {
    focusSkill: weakestSkill[0],
    suggestedPractice: recommendedPractice
  };
}

module.exports = {
  generateAISummary
};

