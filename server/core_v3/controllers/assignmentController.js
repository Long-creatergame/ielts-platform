const Assignment = require('../models/Assignment');
const IELTSItem = require('../models/IELTSItem');

exports.createAssignment = async (req, res) => {
  try {
    const { userId, ieltsItemId, dueDate } = req.body;

    if (!userId || !ieltsItemId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, ieltsItemId',
      });
    }

    const item = await IELTSItem.findById(ieltsItemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'IELTS item not found',
      });
    }

    const assignment = new Assignment({
      userId,
      ieltsItemId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      status: 'pending',
    });

    await assignment.save();

    return res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: { assignment },
    });
  } catch (error) {
    console.error('[Core V3 Assignment] Create assignment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating assignment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.getUserAssignments = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const filter = { userId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const assignments = await Assignment.find(filter)
      .sort({ assignedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('ieltsItemId');

    const total = await Assignment.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: 'Assignments retrieved successfully',
      data: {
        assignments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('[Core V3 Assignment] Get user assignments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving assignments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.updateAssignmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'in-progress', 'completed', 'expired'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, in-progress, completed, or expired',
      });
    }

    const updateData = { status };
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    const assignment = await Assignment.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Assignment status updated successfully',
      data: { assignment },
    });
  } catch (error) {
    console.error('[Core V3 Assignment] Update assignment status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating assignment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

