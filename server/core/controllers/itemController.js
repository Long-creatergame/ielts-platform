const IELTSItem = require('../models/IELTSItem');

/**
 * Get all items with filters
 */
async function getItems(req, res) {
  try {
    const { type, skill, level, topic, isActive, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (skill) filter.skill = skill;
    if (level) filter.level = level;
    if (topic) filter.topic = new RegExp(topic, 'i');
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const items = await IELTSItem.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-answers'); // Don't expose answers

    const total = await IELTSItem.countDocuments(filter);

    return res.json({
      success: true,
      data: {
        items,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('[Core V3 Item] Get items error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get items',
      error: error.message
    });
  }
}

/**
 * Get single item by ID
 */
async function getItemById(req, res) {
  try {
    const { id } = req.params;
    
    const item = await IELTSItem.findById(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Don't expose answers unless user has completed it
    const itemData = item.toObject();
    if (!req.user) {
      delete itemData.answers;
    }

    return res.json({
      success: true,
      data: { item: itemData }
    });
  } catch (error) {
    console.error('[Core V3 Item] Get item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get item',
      error: error.message
    });
  }
}

/**
 * Create new item (admin only)
 */
async function createItem(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const itemData = req.body;
    const item = new IELTSItem(itemData);
    await item.save();

    return res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: { item }
    });
  } catch (error) {
    console.error('[Core V3 Item] Create item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create item',
      error: error.message
    });
  }
}

/**
 * Update item (admin only)
 */
async function updateItem(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const item = await IELTSItem.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    return res.json({
      success: true,
      message: 'Item updated successfully',
      data: { item }
    });
  } catch (error) {
    console.error('[Core V3 Item] Update item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update item',
      error: error.message
    });
  }
}

/**
 * Delete item (admin only)
 */
async function deleteItem(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { id } = req.params;
    
    const item = await IELTSItem.findByIdAndDelete(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    return res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('[Core V3 Item] Delete item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete item',
      error: error.message
    });
  }
}

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};

