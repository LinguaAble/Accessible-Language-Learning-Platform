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
    const { email, password, username } = req.body;

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
      username: username || email.split('@')[0],
      password: hashedPassword,
      loginHistory: [{ timestamp: new Date(), device: 'Web Browser' }]
    });

    await user.save();

    // Create Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        age: user.age,
        gender: user.gender,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        preferences: user.preferences,
        completedLessons: user.completedLessons,
        loginHistory: user.loginHistory,
        todayProgress: user.todayProgress,
        progressDate: user.progressDate,
        dailyLessonCounts: user.dailyLessonCounts,
        dailyScores: user.dailyScores
      }
    });
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

    // Update Login History
    user.loginHistory.push({ timestamp: new Date(), device: 'Web Browser' });
    // Keep only last 10 entries
    if (user.loginHistory.length > 10) {
      user.loginHistory.shift();
    }
    await user.save();

    // Create Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        age: user.age,
        gender: user.gender,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        preferences: user.preferences,
        completedLessons: user.completedLessons,
        loginHistory: user.loginHistory,
        todayProgress: user.todayProgress,
        progressDate: user.progressDate,
        dailyLessonCounts: user.dailyLessonCounts,
        dailyScores: user.dailyScores
      }
    });
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

// 5. UPDATE USER PROGRESS (Unified)
router.put('/update-progress', async (req, res) => {
  try {
    const { email, completedLessons, todayProgress, incrementLessonCount, date, lessonScore } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // A. Update Completed Lessons (if provided)
    if (completedLessons) {
      const existing = user.completedLessons || [];
      const incoming = completedLessons || [];
      // Merge and unique
      user.completedLessons = [...new Set([...existing, ...incoming])];
    }

    // B. Update Daily Progress (Minutes) (if provided)
    if (todayProgress !== undefined) {
      const today = new Date().toDateString();

      // Check if day changed
      if (user.progressDate !== today) {
        // New day, update date and set progress
        user.progressDate = today;
        user.todayProgress = todayProgress;
      } else {
        // Same day, update progress
        user.todayProgress = todayProgress;
      }
    }

    // C. Update Daily Lesson Count (for Chart)
    if (incrementLessonCount) {
      // detailed fix: Use date from frontend if available (to match user's timezone), else fallback to server UTC
      const today = date || new Date().toISOString().split('T')[0];
      const existingEntry = user.dailyLessonCounts.find(e => e.date === today);

      if (existingEntry) {
        existingEntry.count += incrementLessonCount;
      } else {
        user.dailyLessonCounts.push({ date: today, count: incrementLessonCount });
      }
    }

    // D. Accumulate Daily Score (for score-based graph)
    if (lessonScore !== undefined && lessonScore !== null) {
      const today = date || new Date().toISOString().split('T')[0];
      if (!user.dailyScores) user.dailyScores = [];
      const existingScoreEntry = user.dailyScores.find(e => e.date === today);

      if (existingScoreEntry) {
        existingScoreEntry.score += lessonScore;
      } else {
        user.dailyScores.push({ date: today, score: lessonScore });
      }
    }

    await user.save();

    res.json({
      success: true,
      completedLessons: user.completedLessons,
      todayProgress: user.todayProgress,
      progressDate: user.progressDate,
      dailyLessonCounts: user.dailyLessonCounts,
      dailyScores: user.dailyScores
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// 6. GET USER DATA (Settings & History)
router.post('/get-user-data', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email }).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      user: {
        preferences: user.preferences,
        username: user.username,
        fullName: user.fullName,
        age: user.age,
        gender: user.gender,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        loginHistory: user.loginHistory,
        completedLessons: user.completedLessons,
        todayProgress: user.todayProgress,
        progressDate: user.progressDate,
        dailyLessonCounts: user.dailyLessonCounts,
        dailyScores: user.dailyScores
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 7. UPDATE SETTINGS
router.put('/update-settings', async (req, res) => {
  try {
    const { email, preferences } = req.body;
    if (!email || !preferences) return res.status(400).json({ message: "Data missing" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Merge preferences instead of replacing
    user.preferences = { ...user.preferences, ...preferences };
    await user.save();

    res.json({ success: true, preferences: user.preferences });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 9. UPDATE PROFILE
router.put('/update-profile', async (req, res) => {
  try {
    const { email, username, fullName, age, gender, bio, avatarUrl, preferences } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update fields if provided
    if (username !== undefined) user.username = username;
    if (fullName !== undefined) user.fullName = fullName;
    if (age !== undefined) user.age = age;
    if (gender !== undefined) user.gender = gender;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    // Update preferences if provided
    if (preferences !== undefined) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        age: user.age,
        gender: user.gender,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        preferences: user.preferences,
        completedLessons: user.completedLessons,
        loginHistory: user.loginHistory
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});



module.exports = router;