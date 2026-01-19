const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function authMiddleware(req, res, next) {
  const unauthorized = () => res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized();
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: 'Server misconfigured' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId || decoded.id).select('-password');
    if (!user) {
      return unauthorized();
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return unauthorized();
  }
};


