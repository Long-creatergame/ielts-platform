/**
 * AI Master Controller
 * Orchestrates all Cambridge AI services in unified flow
 * Handles complete test → assessment → feedback → learning path pipeline
 */

const { evaluateTest } = require('../services/aiAssessmentService');
const { generateLearningPath } = require('../services/learningPathService');
const { generateAISummary } = require('../services/aiSummaryService');
const { runAISupervision } = require('../services/aiSupervisorService');
const { handleAIEmotionFeedback } = require('../services/aiEngagementService');
const { handleAdaptivePractice } = require('../services/adaptivePracticeService');

/**
 * Complete test evaluation pipeline
 * Flow: Test → Assessment → Feedback → Summary → Supervisor → Emotion → Learning Path
 * @param {string} userId - User ID
 * @param {object} testResult - Test result data
 * @returns {Promise<object>} Complete evaluation pipeline result
 */
async function processTestSubmission(userId, testResult) {
  try {
    const pipeline = {
      assessment: null,
      feedback: null,
      summary: null,
      supervisor: null,
      emotion: null,
      learningPath: null,
      errors: []
    };

    // Step 1: Assess test and calculate bands
    try {
      pipeline.assessment = await evaluateTest(testResult);
      console.log(`[AI Master] Assessment complete: Band ${pipeline.assessment.overall}, CEFR ${pipeline.assessment.cefr}`);
    } catch (error) {
      console.error('[AI Master] Assessment error:', error.message);
      pipeline.errors.push({ step: 'assessment', error: error.message });
    }

    // Step 2: Generate AI Summary (strengths/weaknesses)
    try {
      if (pipeline.assessment) {
        const user = await require('../models/User').findById(userId);
        const userLevel = user?.currentLevel || 'B1';
        pipeline.summary = await generateAISummary(userId, userLevel);
        console.log(`[AI Master] Summary generated`);
      }
    } catch (error) {
      console.error('[AI Master] Summary error:', error.message);
      pipeline.errors.push({ step: 'summary', error: error.message });
    }

    // Step 3: Run AI Supervisor (progress monitoring)
    try {
      pipeline.supervisor = await runAISupervision(userId);
      console.log(`[AI Master] Supervisor complete`);
    } catch (error) {
      console.error('[AI Master] Supervisor error:', error.message);
      pipeline.errors.push({ step: 'supervisor', error: error.message });
    }

    // Step 4: Handle Emotion Feedback
    try {
      const user = await require('../models/User').findById(userId);
      const userName = user?.name || user?.email?.split('@')[0] || 'Student';
      
      const performance = {
        accuracy: pipeline.assessment?.bands ? 
          (Object.values(pipeline.assessment.bands).reduce((a, b) => a + b, 0) / 4) / 9 : 0.5,
        streak: 0, // Will be updated from practice session
        lastBandChange: pipeline.assessment?.overall || 0,
        skill: testResult.skill || 'mixed',
        performanceHistory: testResult.performanceHistory || []
      };

      pipeline.emotion = await handleAIEmotionFeedback(userId, userName, performance);
      console.log(`[AI Master] Emotion detected: ${pipeline.emotion.emotion}`);
    } catch (error) {
      console.error('[AI Master] Emotion error:', error.message);
      pipeline.errors.push({ step: 'emotion', error: error.message });
    }

    // Step 5: Generate Learning Path
    try {
      if (pipeline.assessment) {
        pipeline.learningPath = await generateLearningPath(userId, pipeline.assessment);
        console.log(`[AI Master] Learning path generated`);
      }
    } catch (error) {
      console.error('[AI Master] Learning path error:', error.message);
      pipeline.errors.push({ step: 'learningPath', error: error.message });
    }

    return {
      success: pipeline.errors.length === 0,
      data: pipeline,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('[AI Master] Pipeline error:', error.message);
    throw error;
  }
}

/**
 * Process adaptive practice submission
 * Flow: Practice → Adaptive Difficulty → Emotion → Feedback
 * @param {string} userId - User ID
 * @param {string} skill - Skill name
 * @param {object} performance - Performance data
 * @param {string} mode - Test mode
 * @returns {Promise<object>} Adaptive practice result
 */
async function processAdaptivePractice(userId, skill, performance, mode = 'academic') {
  try {
    const pipeline = {
      adaptive: null,
      emotion: null,
      errors: []
    };

    // Step 1: Handle adaptive practice (difficulty adjustment)
    try {
      pipeline.adaptive = await handleAdaptivePractice(userId, skill, performance, mode);
      console.log(`[AI Master] Adaptive practice: Band ${pipeline.adaptive.session.currentBand}`);
    } catch (error) {
      console.error('[AI Master] Adaptive practice error:', error.message);
      pipeline.errors.push({ step: 'adaptive', error: error.message });
    }

    // Step 2: Handle emotion feedback
    try {
      const user = await require('../models/User').findById(userId);
      const userName = user?.name || user?.email?.split('@')[0] || 'Student';
      
      const emotionPerformance = {
        accuracy: performance.correct / performance.total || 0,
        streak: pipeline.adaptive?.session.streak || 0,
        lastBandChange: pipeline.adaptive?.progress.change || 0,
        skill: skill,
        recentAccuracy: performance.correct / performance.total || 0
      };

      pipeline.emotion = await handleAIEmotionFeedback(userId, userName, emotionPerformance);
      console.log(`[AI Master] Emotion: ${pipeline.emotion.emotion}`);
    } catch (error) {
      console.error('[AI Master] Emotion error:', error.message);
      pipeline.errors.push({ step: 'emotion', error: error.message });
    }

    return {
      success: pipeline.errors.length === 0,
      data: pipeline,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('[AI Master] Adaptive practice pipeline error:', error.message);
    throw error;
  }
}

/**
 * Get unified AI insights for user
 * Combines summary, supervisor, emotion, and learning path
 * @param {string} userId - User ID
 * @returns {Promise<object>} Unified AI insights
 */
async function getUnifiedAIInsights(userId) {
  try {
    const insights = {
      summary: null,
      supervisor: null,
      emotion: null,
      learningPath: null,
      errors: []
    };

    // Get all insights in parallel
    const user = await require('../models/User').findById(userId);
    const userLevel = user?.currentLevel || 'B1';
    const userName = user?.name || user?.email?.split('@')[0] || 'Student';

    // Parallel execution for efficiency
    const [summary, supervisor, emotionSummary, learningPath] = await Promise.allSettled([
      generateAISummary(userId, userLevel),
      runAISupervision(userId),
      require('../services/aiEngagementService').getEngagementSummary(userId),
      require('../services/learningPathService').getLearningPath(userId)
    ]);

    if (summary.status === 'fulfilled') insights.summary = summary.value;
    else insights.errors.push({ step: 'summary', error: summary.reason?.message });

    if (supervisor.status === 'fulfilled') insights.supervisor = supervisor.value;
    else insights.errors.push({ step: 'supervisor', error: supervisor.reason?.message });

    if (emotionSummary.status === 'fulfilled') insights.emotion = emotionSummary.value;
    else insights.errors.push({ step: 'emotion', error: emotionSummary.reason?.message });

    if (learningPath.status === 'fulfilled') insights.learningPath = learningPath.value;
    else insights.errors.push({ step: 'learningPath', error: learningPath.reason?.message });

    return {
      success: insights.errors.length === 0,
      data: insights,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('[AI Master] Unified insights error:', error.message);
    throw error;
  }
}

module.exports = {
  processTestSubmission,
  processAdaptivePractice,
  getUnifiedAIInsights
};
