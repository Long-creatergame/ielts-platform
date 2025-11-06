const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ensureJwt = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }
  return secret;
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    let secret;
    try {
      secret = ensureJwt();
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    let { goal, targetBand, currentLevel } = req.body || {};

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Normalize and defaults
    targetBand = Number(targetBand || 6.5);
    currentLevel = currentLevel || 'A2';

    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      password,
      goal: goal ?? null,
      targetBand,
      currentLevel
    });

    let secret;
    try {
      secret = ensureJwt();
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
    const token = jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};
