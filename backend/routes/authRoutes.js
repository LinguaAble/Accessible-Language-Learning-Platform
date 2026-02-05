const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// 1. REGISTER USER
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'This email is already registered.' });
    }

    // Encrypt Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    user = new User({
      email,
      password: hashedPassword
    });

    await user.save();

    // Create Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

<<<<<<< HEAD
    res.json({ token, user: { email: user.email, preferences: user.preferences, completedLessons: user.completedLessons } });
=======
    res.json({
      token,
      user: {
        email: user.email,
        preferences: user.preferences,
        completedLessons: user.completedLessons
      }
    });
>>>>>>> f4359cf5491da1f1e18eba712734563a924ba34e
  } catch (err) {
    console.error(err);
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

<<<<<<< HEAD
    res.json({ token, user: { email: user.email, preferences: user.preferences, completedLessons: user.completedLessons } });
=======
    res.json({
      token,
      user: {
        email: user.email,
        preferences: user.preferences,
        completedLessons: user.completedLessons
      }
    });
>>>>>>> f4359cf5491da1f1e18eba712734563a924ba34e
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 3. FORGOT PASSWORD (OTP VERSION)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // A. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // B. Hash OTP and save to DB (Security)
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    // Expires in 1 minute
    user.resetPasswordExpire = Date.now() + 1 * 60 * 1000;

    await user.save();

    // C. Send Email using Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your email from .env
        pass: process.env.EMAIL_PASS  // Your App Password from .env
      }
    });

    const message = {
      from: `"LinguaAble Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Code',
      text: `Your password reset otp is: ${otp}\n\nThis code expires in 1 minute.`
    };

    await transporter.sendMail(message);

    res.status(200).json({ success: true, data: "OTP sent to email" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Email could not be sent" });
  }
});

// 4. RESET PASSWORD (USING OTP)
router.put('/reset-password/:token', async (req, res) => {
  try {
    // Hash the OTP user sent to compare with DB
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Encrypt New Password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    // Clear Fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, data: "Password updated success" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

<<<<<<< HEAD
// 5. UPDATE USER PROGRESS
router.put('/update-progress', async (req, res) => {
  try {
    const { email, completedLessons } = req.body;

    if (!email || !completedLessons) {
      return res.status(400).json({ message: "Please provide email and completedLessons" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Merge or overwrite? The user says "login with my credentials... completed lessons upto 3".
    // If I use backend as truth, I should overwrite.
    // However, lets ensuring uniqueness at least.
    // If the logical flow is: Frontend adds lesson -> calls API -> API saves unique union.

    // Update logic: simple overwrite with what frontend sends?
    // Or union? user.completedLessons = [...new Set([...user.completedLessons, ...completedLessons])];
    // The frontend logic (seen earlier) maintains an array in localStorage. If we send that array, we can just save it.
    // But safely, let's just save what is sent, assuming frontend sends the full list.

    // Merge existing and new completed lessons to prevent data loss
    // Ensure both are treated as arrays of numbers
    const existing = user.completedLessons || [];
    const incoming = completedLessons || [];

    // Create a Set from both arrays to ensure uniqueness
    const mergedLessons = [...new Set([...existing, ...incoming])];

    user.completedLessons = mergedLessons;
    await user.save();

    res.json({ success: true, completedLessons: user.completedLessons });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
=======
// 5. UPDATE PROGRESS
router.put('/update-progress', protect, async (req, res) => {
  try {
    const { lessonId } = req.body;

    // Use $addToSet to avoid duplicates
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { completedLessons: lessonId } },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      completedLessons: user.completedLessons
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 6. GET CURRENT USER (For syncing progress)
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      email: user.email,
      preferences: user.preferences,
      completedLessons: user.completedLessons
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
>>>>>>> f4359cf5491da1f1e18eba712734563a924ba34e
  }
});

module.exports = router;