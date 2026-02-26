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
        streak: user.streak,
        lastStreakDate: user.lastStreakDate,
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

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password.' });

    // Build update object
    const newHistory = [...(user.loginHistory || []), { timestamp: new Date(), device: 'Web Browser' }];
    if (newHistory.length > 10) newHistory.shift();

    // Streak reset check: if last streak date is before yesterday, reset to 0
    let newStreak = user.streak || 0;
    const lastStreakDate = user.lastStreakDate || '';
    if (lastStreakDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      const todayStr = new Date().toISOString().split('T')[0];
      if (lastStreakDate < yesterdayStr && lastStreakDate !== todayStr) {
        newStreak = 0;
      }
    }

    // Use findOneAndUpdate to avoid validation errors on existing documents
    const updated = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          loginHistory: newHistory,
          streak: newStreak
        }
      },
      { new: true }
    );

    const token = jwt.sign({ id: updated._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        email: updated.email,
        username: updated.username,
        fullName: updated.fullName,
        age: updated.age,
        gender: updated.gender,
        bio: updated.bio,
        avatarUrl: updated.avatarUrl,
        preferences: updated.preferences,
        completedLessons: updated.completedLessons,
        loginHistory: updated.loginHistory,
        todayProgress: updated.todayProgress,
        progressDate: updated.progressDate,
        streak: updated.streak,
        lastStreakDate: updated.lastStreakDate,
        dailyLessonCounts: updated.dailyLessonCounts,
        dailyScores: updated.dailyScores
      }
    });
  } catch (err) {
    console.error('Login error:', err.message, err.stack);
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

    // Helper: get today's date as YYYY-MM-DD in LOCAL time via date param or server UTC
    const todayStr = date || new Date().toISOString().split('T')[0];

    // A. Update Completed Lessons (if provided)
    if (completedLessons) {
      const existing = user.completedLessons || [];
      const incoming = completedLessons || [];
      user.completedLessons = [...new Set([...existing, ...incoming])];
    }

    // B. Update Daily Progress + Streak
    if (todayProgress !== undefined) {
      const today = new Date().toDateString();

      // Reset progress if day changed
      if (user.progressDate !== today) {
        user.progressDate = today;
      }
      user.todayProgress = todayProgress;

      // --- Streak Logic ---
      const dailyGoal = user.preferences?.dailyGoalMinutes || 5;
      const goalMet = todayProgress >= dailyGoal;

      if (goalMet) {
        if (user.lastStreakDate === todayStr) {
          // Goal already counted for today — no change
        } else {
          // Check if yesterday was the last streak day
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (user.lastStreakDate === yesterdayStr) {
            // Consecutive day — extend streak
            user.streak = (user.streak || 0) + 1;
          } else {
            // Gap detected or first time — reset to 1
            user.streak = 1;
          }
          user.lastStreakDate = todayStr;
        }
      }
      // If goal not met, streak stays as-is (don't reset until midnight check on login)
    }

    // C. Update Daily Lesson Count (for Chart)
    if (incrementLessonCount) {
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
      streak: user.streak,
      lastStreakDate: user.lastStreakDate,
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

    // Build update object dynamically
    const updateQuery = { $set: {} };
    if (username !== undefined) updateQuery.$set.username = username;
    if (fullName !== undefined) updateQuery.$set.fullName = fullName;
    if (age !== undefined) updateQuery.$set.age = age;
    if (gender !== undefined) updateQuery.$set.gender = gender;
    if (bio !== undefined) updateQuery.$set.bio = bio;
    if (avatarUrl !== undefined) updateQuery.$set.avatarUrl = avatarUrl;

    // Update preferences if provided
    if (preferences !== undefined) {
      updateQuery.$set.preferences = { ...user.preferences, ...preferences };
    }

    // Use findOneAndUpdate to bypass validation on unrelated document fields
    const updated = await User.findOneAndUpdate(
      { email },
      updateQuery,
      { new: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        email: updated.email,
        username: updated.username,
        fullName: updated.fullName,
        age: updated.age,
        gender: updated.gender,
        bio: updated.bio,
        avatarUrl: updated.avatarUrl,
        preferences: updated.preferences,
        completedLessons: updated.completedLessons,
        loginHistory: updated.loginHistory,
        todayProgress: updated.todayProgress,
        progressDate: updated.progressDate,
        streak: updated.streak,
        lastStreakDate: updated.lastStreakDate,
        dailyLessonCounts: updated.dailyLessonCounts,
        dailyScores: updated.dailyScores
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});
// 10. LEADERBOARD — Weekly Score Rankings
router.get('/leaderboard', async (req, res) => {
  try {
    // Build the date strings for this Mon–Sun week
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split('T')[0]; // YYYY-MM-DD
    });

    // Fetch all users (no passwords)
    const users = await User.find({}).select('username fullName email avatarUrl dailyScores completedLessons');

    // Compute weekly score per user
    const ranked = users.map(u => {
      const weeklyScore = (u.dailyScores || [])
        .filter(e => weekDates.includes(e.date))
        .reduce((sum, e) => sum + (e.score || 0), 0);

      return {
        username: u.username || u.email.split('@')[0],
        email: u.email,
        avatarUrl: u.avatarUrl || '',
        weeklyScore,
        completedLessons: (u.completedLessons || []).length
      };
    });

    // Sort descending by weekly score, then by total lessons as tiebreaker
    ranked.sort((a, b) => b.weeklyScore - a.weeklyScore || b.completedLessons - a.completedLessons);

    // Assign ranks and cap at 50
    const leaderboard = ranked.slice(0, 50).map((entry, index) => ({
      rank: index + 1,
      ...entry
    }));

    res.json({ success: true, leaderboard, weekStart: weekDates[0], weekEnd: weekDates[6] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});



module.exports = router;
