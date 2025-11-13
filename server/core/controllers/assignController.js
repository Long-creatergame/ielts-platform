const AssignedItem = require('../models/AssignedItem');
const IELTSItem = require('../models/IELTSItem');
const UserAnalytics = require('../models/UserAnalytics');

/**
 * Assign item to user
 */
async function assignItem(req, res) {
  try {
    const { itemId, dueDate, priority } = req.body;
    const userId = req.user.userId;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }

    // Check if item exists
    const item = await IELTSItem.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if already assigned
    const existing = await AssignedItem.findOne({ userId, itemId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Item already assigned to user'
      });
    }

    // Create assignment
    const assignedItem = new AssignedItem({
      userId,
      itemId,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || 5
    });

    await assignedItem.save();
    await assignedItem.populate('itemId', 'title type skill level');

    return res.status(201).json({
      success: true,
      message: 'Item assigned successfully',
      data: { assignedItem }
    });
  } catch (error) {
    console.error('[Core V3 Assign] Assign item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to assign item',
      error: error.message
    });
  }
}

/**
 * Get user's assigned items
 */
async function getAssignedItems(req, res) {
  try {
    const userId = req.user.userId;
    const { status, page = 1, limit = 20 } = req.query;

    const filter = { userId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const assignedItems = await AssignedItem.find(filter)
      .populate('itemId', 'title type skill level topic timeLimit')
      .sort({ assignedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AssignedItem.countDocuments(filter);

    return res.json({
      success: true,
      data: {
        assignedItems,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('[Core V3 Assign] Get assigned items error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get assigned items',
      error: error.message
    });
  }
}

/**
 * Update assignment status
 */
async function updateAssignmentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    if (!['assigned', 'in_progress', 'completed', 'skipped'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const assignedItem = await AssignedItem.findOne({ _id: id, userId });
    
    if (!assignedItem) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    assignedItem.status = status;
    
    if (status === 'in_progress' && !assignedItem.startedAt) {
      assignedItem.startedAt = new Date();
    }
    
    if (status === 'completed') {
      assignedItem.completedAt = new Date();
    }

    await assignedItem.save();
    await assignedItem.populate('itemId', 'title type skill level');

    return res.json({
      success: true,
      message: 'Assignment status updated',
      data: { assignedItem }
    });
  } catch (error) {
    console.error('[Core V3 Assign] Update status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update assignment',
      error: error.message
    });
  }
}

module.exports = {
  assignItem,
  getAssignedItems,
  updateAssignmentStatus
};

