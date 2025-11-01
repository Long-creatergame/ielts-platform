const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ Auth: No token provided');
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    console.log('🔑 Auth: Token received, verifying...');
    const decoded = jwt.verify(token, config.JWT_SECRET);
    console.log('✅ Auth: Token decoded, userId:', decoded.userId);
    
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      console.log('❌ Auth: User not found in database for userId:', decoded.userId);
      return res.status(401).json({ error: 'Token is not valid' });
    }

    console.log('✅ Auth: User authenticated successfully:', user._id, user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = auth;

