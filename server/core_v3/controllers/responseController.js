const UserResponse = require('../models/UserResponse');
const Assignment = require('../models/Assignment');

exports.submitResponse = async (req, res) => {
  try {
    const { userId, assignmentId, ieltsItemId, answers, timeSpent } = req.body;

    if (!userId || !ieltsItemId || !answers) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, ieltsItemId, answers',
      });
    }

    // Calculate score (simplified - should use proper scoring logic)
    const score = calculateScore(answers);
    const bandScore = Math.round(score * 2) / 2; // Round to nearest 0.5

    const response = new UserResponse({
      userId,
      assignmentId,
      ieltsItemId,
      answers,
      score,
      bandScore,
      timeSpent: timeSpent || 0,
      submittedAt: new Date(),
    });

    await response.save();

    // Update assignment status if assignmentId provided
    if (assignmentId) {
      await Assignment.findByIdAndUpdate(assignmentId, {
        status: 'completed',
        completedAt: new Date(),
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Response submitted successfully',
      data: { response },
    });
  } catch (error) {
    console.error('[Core V3 Response] Submit response error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error submitting response',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.getUserResponses = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const responses = await UserResponse.find({ userId })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await UserResponse.countDocuments({ userId });

    return res.status(200).json({
      success: true,
      message: 'Responses retrieved successfully',
      data: {
        responses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('[Core V3 Response] Get user responses error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving responses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.getResponseById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await UserResponse.findById(id);

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Response retrieved successfully',
      data: { response },
    });
  } catch (error) {
    console.error('[Core V3 Response] Get response by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving response',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Helper function to calculate score (simplified)
function calculateScore(answers) {
  // This is a placeholder - implement proper scoring logic based on item type
  if (!answers || typeof answers !== 'object') return 0;
  const answerCount = Object.keys(answers).length;
  return Math.min(9, answerCount * 0.5); // Simplified scoring
}

