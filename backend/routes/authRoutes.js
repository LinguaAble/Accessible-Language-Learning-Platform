const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. REGISTER USER
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists (Helpful Error Message)
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'This email is already registered.' });
    }

    // Encrypt Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User with Default Preferences (Story 8)
    user = new User({
      email,
      password: hashedPassword
    });

    await user.save();

    // Create Token (Story 4: Stay Signed In)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { email: user.email, preferences: user.preferences } });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 2. LOGIN USER
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check User
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Create Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { email: user.email, preferences: user.preferences } });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;