const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'axia_finance_secret_key_2026';

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ msg: 'Please enter all fields' });

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ name, email, password });
    const savedUser = await user.save();

    const token = jwt.sign({ id: savedUser._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      token,
      user: { 
        id: savedUser._id, 
        name: savedUser.name, 
        email: savedUser.email, 
        income: savedUser.income, 
        hasSetIncome: savedUser.hasSetIncome 
      }
    });
  } catch (err) {
    console.error('SERVER ERROR DURING REGISTRATION:', err.message);
    res.status(500).json({ msg: 'Server error. Please try again.' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'Enter email and password' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        income: user.income, 
        hasSetIncome: user.hasSetIncome 
      }
    });
  } catch (err) {
    console.error('SERVER ERROR DURING LOGIN:', err.message);
    res.status(500).json({ msg: 'Server error. Please try again.' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { userId, name, email } = req.body;
    console.log('Profile update request - userId:', userId, 'name:', name, 'email:', email);

    if (!userId) return res.status(400).json({ msg: 'userId is required' });

    // Use findByIdAndUpdate to bypass the bcrypt pre-save hook
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { name: name, email: email.toLowerCase().trim() } },
      { returnDocument: 'after', runValidators: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ msg: 'User not found' });

    console.log('Profile updated successfully for:', updatedUser.name);
    
    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      income: updatedUser.income,
      hasSetIncome: updatedUser.hasSetIncome
    });
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ msg: err.message });
  }
});

// @route   PUT /api/auth/income
// @desc    Update user income
router.put('/income', async (req, res) => {
  try {
    const { userId, income } = req.body;
    console.log(`[INCOME UPDATE] Received: userId=${userId}, income=${income}`);
    
    if (!userId) {
      console.error('[INCOME UPDATE] Error: userId is missing');
      return res.status(400).json({ msg: 'userId is required' });
    }

    const user = await User.findByIdAndUpdate(
      userId, 
      { income, hasSetIncome: true }, 
      { returnDocument: 'after' }
    ).select('-password');
    
    if (!user) {
      console.error(`[INCOME UPDATE] Error: User with ID ${userId} not found`);
      return res.status(404).json({ msg: 'User not found' });
    }
    
    console.log(`[INCOME UPDATE] Success for user: ${user.name}`);
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

