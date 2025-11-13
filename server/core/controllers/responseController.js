const UserResponse = require('../models/UserResponse');
const IELTSItem = require('../models/IELTSItem');
const AssignedItem = require('../models/AssignedItem');
const UserAnalytics = require('../models/UserAnalytics');

/**
 * Submit user response
 */
async function submitResponse(req, res) {
  try {
    const { itemId, answers, timeSpent, assignedItemId } = req.body;
    const userId = req.user.userId;

    if (!itemId || !answers) {
      return res.status(400).json({
        success: false,
        message: 'Item ID and answers are required'
      });
    }

    // Get item with answers
    const item = await IELTSItem.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Calculate score
    const { score, bandScore, corrections } = calculateScore(item, answers);

    // Create response
    const response = new UserResponse({
      userId,
      itemId,
      assignedItemId,
      answers,
      score,
      bandScore,
      timeSpent: timeSpent || 0,
      isCompleted: true,
      corrections
    });

    await response.save();

    // Update assignment if exists
    if (assignedItemId) {
      await AssignedItem.findByIdAndUpdate(assignedItemId, {
        status: 'completed',
        completedAt: new Date()
      });
    }

    // Update analytics
    await updateUserAnalytics(userId, item, score, bandScore);

    // Increment item usage
    await IELTSItem.findByIdAndUpdate(itemId, {
      $inc: { usageCount: 1 }
    });

    return res.status(201).json({
      success: true,
      message: 'Response submitted successfully',
      data: {
        response: {
          id: response._id,
          score,
          bandScore,
          corrections
        }
      }
    });
  } catch (error) {
    console.error('[Core V3 Response] Submit error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit response',
      error: error.message
    });
  }
}

/**
 * Get user responses
 */
async function getUserResponses(req, res) {
  try {
    const userId = req.user.userId;
    const { itemId, page = 1, limit = 20 } = req.query;

    const filter = { userId };
    if (itemId) filter.itemId = itemId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const responses = await UserResponse.find(filter)
      .populate('itemId', 'title type skill level')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await UserResponse.countDocuments(filter);

    return res.json({
      success: true,
      data: {
        responses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('[Core V3 Response] Get responses error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get responses',
      error: error.message
    });
  }
}

/**
 * Get single response
 */
async function getResponseById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const response = await UserResponse.findOne({ _id: id, userId })
      .populate('itemId');

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    return res.json({
      success: true,
      data: { response }
    });
  } catch (error) {
    console.error('[Core V3 Response] Get response error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get response',
      error: error.message
    });
  }
}

/**
 * Calculate score from answers
 */
function calculateScore(item, userAnswers) {
  const correctAnswers = item.answers;
  let correctCount = 0;
  let totalQuestions = 0;
  const corrections = [];

  // Simple scoring logic (can be enhanced)
  if (Array.isArray(correctAnswers)) {
    totalQuestions = correctAnswers.length;
    correctAnswers.forEach((correct, index) => {
      const userAnswer = userAnswers[index];
      if (userAnswer === correct) {
        correctCount++;
      } else {
        corrections.push({
          questionIndex: index,
          correctAnswer: correct,
          userAnswer: userAnswer
        });
      }
    });
  } else if (typeof correctAnswers === 'object') {
    totalQuestions = Object.keys(correctAnswers).length;
    Object.keys(correctAnswers).forEach((key) => {
      if (userAnswers[key] === correctAnswers[key]) {
        correctCount++;
      } else {
        corrections.push({
          questionKey: key,
          correctAnswer: correctAnswers[key],
          userAnswer: userAnswers[key]
        });
      }
    });
  }

  const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
  const bandScore = scoreToBandScore(score);

  return { score, bandScore, corrections };
}

/**
 * Convert score to IELTS band score
 */
function scoreToBandScore(score) {
  if (score >= 95) return 9.0;
  if (score >= 90) return 8.5;
  if (score >= 85) return 8.0;
  if (score >= 80) return 7.5;
  if (score >= 75) return 7.0;
  if (score >= 70) return 6.5;
  if (score >= 65) return 6.0;
  if (score >= 60) return 5.5;
  if (score >= 55) return 5.0;
  if (score >= 50) return 4.5;
  if (score >= 45) return 4.0;
  if (score >= 40) return 3.5;
  if (score >= 35) return 3.0;
  if (score >= 30) return 2.5;
  if (score >= 25) return 2.0;
  return 1.0;
}

/**
 * Update user analytics
 */
async function updateUserAnalytics(userId, item, score, bandScore) {
  try {
    let analytics = await UserAnalytics.findOne({ userId });
    
    if (!analytics) {
      analytics = new UserAnalytics({ userId });
    }

    analytics.totalItemsCompleted += 1;
    analytics.averageScore = 
      (analytics.averageScore * (analytics.totalItemsCompleted - 1) + score) / 
      analytics.totalItemsCompleted;
    analytics.averageBandScore = 
      (analytics.averageBandScore * (analytics.totalItemsCompleted - 1) + bandScore) / 
      analytics.totalItemsCompleted;

    // Update skill scores
    if (analytics.skillScores[item.skill]) {
      const skillData = analytics.skillScores[item.skill];
      skillData.average = 
        (skillData.average * skillData.count + score) / (skillData.count + 1);
      skillData.count += 1;
      if (score > skillData.best) {
        skillData.best = score;
      }
    }

    analytics.lastUpdated = new Date();
    await analytics.save();
  } catch (error) {
    console.error('[Core V3 Response] Update analytics error:', error);
  }
}

module.exports = {
  submitResponse,
  getUserResponses,
  getResponseById
};

