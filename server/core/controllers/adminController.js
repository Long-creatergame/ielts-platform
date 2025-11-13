const UserCore = require('../models/UserCore');
const IELTSItem = require('../models/IELTSItem');
const UserResponse = require('../models/UserResponse');
const AssignedItem = require('../models/AssignedItem');
const UserAnalytics = require('../models/UserAnalytics');

/**
 * Admin middleware check
 */
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
}

/**
 * Get all users (admin only)
 */
async function getAllUsers(req, res) {
  try {
    const { page = 1, limit = 20, role, isActive } = req.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await UserCore.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await UserCore.countDocuments(filter);

    return res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('[Core V3 Admin] Get users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
}

/**
 * Get system statistics (admin only)
 */
async function getSystemStats(req, res) {
  try {
    const [
      totalUsers,
      totalItems,
      totalResponses,
      totalAssignments,
      activeUsers
    ] = await Promise.all([
      UserCore.countDocuments(),
      IELTSItem.countDocuments(),
      UserResponse.countDocuments(),
      AssignedItem.countDocuments(),
      UserCore.countDocuments({ isActive: true })
    ]);

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers
      },
      items: {
        total: totalItems
      },
      responses: {
        total: totalResponses
      },
      assignments: {
        total: totalAssignments
      }
    };

    return res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('[Core V3 Admin] Get stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get system stats',
      error: error.message
    });
  }
}

/**
 * Update user status (admin only)
 */
async function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { isActive, role } = req.body;

    const updateData = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (role) updateData.role = role;

    const user = await UserCore.findByIdAndUpdate(id, updateData, { new: true })
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      message: 'User status updated',
      data: { user }
    });
  } catch (error) {
    console.error('[Core V3 Admin] Update user status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
}

module.exports = {
  requireAdmin,
  getAllUsers,
  getSystemStats,
  updateUserStatus
};

