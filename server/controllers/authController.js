const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }
  return process.env.JWT_SECRET;
};

const generateToken = (user) =>
  jwt.sign({ userId: user._id, email: user.email }, getJwtSecret(), { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, goal, targetBand, currentLevel } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    if (await User.findOne({ email: String(email).toLowerCase() })) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const numericGoal = Number(goal) || 0;
    const normalizedTargetBand = Number(targetBand) || 6.5;
    const normalizedLevel = currentLevel || 'A2';

    const user = new User({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      password: hashedPassword,
      goal: numericGoal,
      targetBand: normalizedTargetBand,
      currentLevel: normalizedLevel,
    });
    await user.save();

    const token = generateToken(user);
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        goal: user.goal,
        targetBand: user.targetBand,
        currentLevel: user.currentLevel,
      },
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        goal: user.goal,
        targetBand: user.targetBand,
        currentLevel: user.currentLevel,
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login', error: err.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.userId || decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error('Profile error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
