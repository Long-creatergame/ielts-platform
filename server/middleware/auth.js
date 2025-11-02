const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('[Auth:NoToken] Request rejected');
      return res.status(401).json({ 
        success: false,
        error: 'No token, authorization denied' 
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      console.log('[Auth:UserNotFound] Invalid userId:', decoded.userId);
      return res.status(401).json({ 
        success: false,
        error: 'Token is not valid' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth:Error]', error.message);
    return res.status(401).json({ 
      success: false,
      error: 'Token is not valid' 
    });
  }
};

module.exports = auth;

