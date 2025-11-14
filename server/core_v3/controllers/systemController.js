const SystemConfig = require('../models/SystemConfig');

exports.getAllConfigs = async (req, res) => {
  try {
    const { category, isActive } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const configs = await SystemConfig.find(filter).sort({ key: 1 });

    return res.status(200).json({
      success: true,
      message: 'Configs retrieved successfully',
      data: { configs },
    });
  } catch (error) {
    console.error('[Core V3 System] Get all configs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving configs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.getConfigByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const config = await SystemConfig.findOne({ key, isActive: true });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Config not found or inactive',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Config retrieved successfully',
      data: { config },
    });
  } catch (error) {
    console.error('[Core V3 System] Get config by key error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving config',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.createConfig = async (req, res) => {
  try {
    const { key, value, category, description } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: key, value',
      });
    }

    const existingConfig = await SystemConfig.findOne({ key });
    if (existingConfig) {
      return res.status(400).json({
        success: false,
        message: 'Config with this key already exists',
      });
    }

    const config = new SystemConfig({
      key,
      value,
      category: category || 'system',
      description: description || '',
    });

    await config.save();

    return res.status(201).json({
      success: true,
      message: 'Config created successfully',
      data: { config },
    });
  } catch (error) {
    console.error('[Core V3 System] Create config error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating config',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.updateConfig = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description, isActive } = req.body;

    const updates = {};
    if (value !== undefined) updates.value = value;
    if (description !== undefined) updates.description = description;
    if (isActive !== undefined) updates.isActive = isActive;

    const config = await SystemConfig.findOneAndUpdate(
      { key },
      updates,
      { new: true, runValidators: true }
    );

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Config not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Config updated successfully',
      data: { config },
    });
  } catch (error) {
    console.error('[Core V3 System] Update config error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating config',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.deleteConfig = async (req, res) => {
  try {
    const { key } = req.params;
    const config = await SystemConfig.findOneAndDelete({ key });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Config not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Config deleted successfully',
    });
  } catch (error) {
    console.error('[Core V3 System] Delete config error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting config',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

