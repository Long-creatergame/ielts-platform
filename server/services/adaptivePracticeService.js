/**
 * Adaptive Practice Service
 * Main service handling real-time adaptive practice logic
 */

const PracticeSession = require('../models/PracticeSession');
const { adjustDifficulty, getDifficultyLabel } = require('./difficultyAdjuster');
const { generateAIHint, generateStreakEncouragement } = require('./aiHintGenerator');
const { getAuthenticBlueprint } = require('../services/getCambridgeAuthenticBlueprint');
const User = require('../models/User');

/**
 * Handle adaptive practice submission
 * @param {string} userId - User ID
 * @param {string} skill - Skill name
 * @param {object} performance - Performance data
 * @param {string} mode - Test mode (academic/general)
 * @returns {Promise<object>} Adaptive practice result
 */
async function handleAdaptivePractice(userId, skill, performance, mode = 'academic') {
  try {
    // Find or create practice session
    let session = await PracticeSession.findOne({ userId, skill, mode });

    if (!session) {
      // Get user's current level to initialize difficulty
      const user = await User.findById(userId);
      const initialDifficulty = user?.targetBand || 5.5;

      session = new PracticeSession({
        userId,
        skill,
        mode,
        currentDifficulty: initialDifficulty,
        bandEstimate: initialDifficulty,
        correctAnswers: 0,
        totalQuestions: 0,
        streak: 0,
        aiHints: [],
        performanceHistory: []
      });
    }

    // Update performance metrics
    const { correct = 0, total = 1, commonMistakes = [] } = performance;
    
    session.correctAnswers += correct;
    session.totalQuestions += total;

    // Calculate accuracy
    const accuracy = session.totalQuestions > 0 
      ? session.correctAnswers / session.totalQuestions 
      : correct / total;

    // Update streak
    if (correct >= total * 0.8) {
      // 80%+ correct increases streak
      session.streak += 1;
    } else if (correct < total * 0.5) {
      // <50% correct resets streak
      session.streak = 0;
    }

    // Adjust difficulty based on performance
    const previousDifficulty = session.currentDifficulty;
    session.currentDifficulty = adjustDifficulty(session, performance);
    
    // Update band estimate (weighted average of difficulty and accuracy)
    session.bandEstimate = (session.currentDifficulty * 0.7) + (accuracy * 9 * 0.3);

    // Record performance history
    session.performanceHistory.push({
      timestamp: new Date(),
      accuracy: accuracy,
      difficulty: session.currentDifficulty,
      questionsCount: total
    });

    // Keep only last 20 performance records
    if (session.performanceHistory.length > 20) {
      session.performanceHistory = session.performanceHistory.slice(-20);
    }

    // Generate AI hint
    const context = {
      accuracy: accuracy,
      difficulty: session.currentDifficulty,
      streak: session.streak,
      totalQuestions: session.totalQuestions,
      commonMistakes: commonMistakes,
      skill: skill
    };

    const hint = await generateAIHint(skill, context);
    session.aiHints.push(hint);

    // Keep only last 10 hints
    if (session.aiHints.length > 10) {
      session.aiHints = session.aiHints.slice(-10);
    }

    session.lastUpdated = new Date();
    await session.save();

    // Generate next task suggestion based on current difficulty
    const nextTask = await selectTaskByDifficulty(skill, session.currentDifficulty, mode);

    // Get streak encouragement
    const streakMessage = generateStreakEncouragement(session.streak);

    // Calculate progress indicators
    const difficultyChange = session.currentDifficulty - previousDifficulty;
    const progressDirection = difficultyChange > 0 ? 'up' : difficultyChange < 0 ? 'down' : 'stable';

    return {
      success: true,
      session: {
        currentBand: parseFloat(session.currentDifficulty.toFixed(1)),
        bandEstimate: parseFloat(session.bandEstimate.toFixed(1)),
        accuracy: parseFloat((accuracy * 100).toFixed(1)),
        streak: session.streak,
        totalQuestions: session.totalQuestions,
        correctAnswers: session.correctAnswers,
        difficultyLabel: getDifficultyLabel(session.currentDifficulty)
      },
      hint: hint,
      streakMessage: streakMessage,
      nextTask: nextTask,
      progress: {
        direction: progressDirection,
        change: parseFloat(difficultyChange.toFixed(1)),
        previousDifficulty: parseFloat(previousDifficulty.toFixed(1)),
        newDifficulty: parseFloat(session.currentDifficulty.toFixed(1))
      }
    };
  } catch (error) {
    console.error('[Adaptive Practice Service] Error:', error.message);
    throw error;
  }
}

/**
 * Select appropriate task based on difficulty level
 * @param {string} skill - Skill name
 * @param {number} difficulty - Current difficulty (band score)
 * @param {string} mode - Test mode
 * @returns {Promise<object>} Next task suggestion
 */
async function selectTaskByDifficulty(skill, difficulty, mode = 'academic') {
  try {
    const blueprint = getAuthenticBlueprint(skill, mode);

    // Map difficulty to task type
    let taskSuggestion = {
      skill: skill,
      mode: mode,
      difficulty: parseFloat(difficulty.toFixed(1)),
      recommendedTypes: []
    };

    if (skill === 'reading') {
      if (difficulty >= 7.0) {
        taskSuggestion.recommendedTypes = ['Matching Information', 'Multiple Choice', 'Summary Completion'];
        taskSuggestion.description = 'Advanced reading comprehension with complex inference';
      } else if (difficulty >= 6.0) {
        taskSuggestion.recommendedTypes = ['True/False/Not Given', 'Sentence Completion', 'Matching Headings'];
        taskSuggestion.description = 'Intermediate reading with detailed understanding';
      } else {
        taskSuggestion.recommendedTypes = ['Matching Headings', 'Short Answer', 'Note/Table Completion'];
        taskSuggestion.description = 'Foundation reading skills with basic comprehension';
      }
    } else if (skill === 'listening') {
      if (difficulty >= 7.0) {
        taskSuggestion.recommendedTypes = ['Note Completion', 'Multiple Choice', 'Matching'];
        taskSuggestion.description = 'Advanced listening with complex academic content';
      } else if (difficulty >= 6.0) {
        taskSuggestion.recommendedTypes = ['Form Completion', 'Map/Diagram Labelling', 'Sentence Completion'];
        taskSuggestion.description = 'Intermediate listening with everyday and academic contexts';
      } else {
        taskSuggestion.recommendedTypes = ['Form Completion', 'Short Answer', 'Multiple Choice'];
        taskSuggestion.description = 'Foundation listening skills with clear speech';
      }
    } else if (skill === 'writing') {
      taskSuggestion.recommendedTypes = difficulty >= 6.5 
        ? ['Essay – Discussion', 'Graph/Chart Analysis']
        : ['Letter Writing', 'Basic Essay Structure'];
      taskSuggestion.description = difficulty >= 6.5
        ? 'Advanced writing with complex arguments and data analysis'
        : 'Foundation writing with clear structure and basic vocabulary';
    } else if (skill === 'speaking') {
      taskSuggestion.recommendedTypes = difficulty >= 6.5
        ? ['Discussion', 'Complex Cue Cards']
        : ['Introduction', 'Simple Cue Cards'];
      taskSuggestion.description = difficulty >= 6.5
        ? 'Advanced speaking with fluency and natural expression'
        : 'Foundation speaking with clear pronunciation and basic vocabulary';
    }

    return taskSuggestion;
  } catch (error) {
    console.error('[Select Task By Difficulty] Error:', error.message);
    return {
      skill: skill,
      mode: mode,
      difficulty: parseFloat(difficulty.toFixed(1)),
      recommendedTypes: [],
      description: 'Continue practicing'
    };
  }
}

/**
 * Get user's practice session summary
 * @param {string} userId - User ID
 * @param {string} skill - Skill name (optional)
 * @returns {Promise<object>} Practice session summary
 */
async function getPracticeSummary(userId, skill = null) {
  try {
    const query = { userId };
    if (skill) {
      query.skill = skill;
    }

    const sessions = await PracticeSession.find(query).sort({ lastUpdated: -1 });

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        skills: [],
        overallBand: 5.5
      };
    }

    const skills = sessions.map(session => ({
      skill: session.skill,
      mode: session.mode,
      currentBand: session.currentDifficulty,
      accuracy: session.totalQuestions > 0 
        ? (session.correctAnswers / session.totalQuestions * 100).toFixed(1)
        : 0,
      streak: session.streak,
      totalQuestions: session.totalQuestions,
      lastUpdated: session.lastUpdated
    }));

    const overallBand = sessions.reduce((sum, s) => sum + s.currentDifficulty, 0) / sessions.length;

    return {
      totalSessions: sessions.length,
      skills: skills,
      overallBand: parseFloat(overallBand.toFixed(1)),
      lastUpdated: sessions[0].lastUpdated
    };
  } catch (error) {
    console.error('[Get Practice Summary] Error:', error.message);
    throw error;
  }
}

module.exports = {
  handleAdaptivePractice,
  selectTaskByDifficulty,
  getPracticeSummary
};
