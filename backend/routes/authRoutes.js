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
      loginHistory: [{ timestamp: new Date(), device: req.body.device || 'Web Browser' }]
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
    const newHistory = [...(user.loginHistory || []), { timestamp: new Date(), device: req.body.device || 'Web Browser' }];
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
      { returnDocument: 'after' }
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
      host: 'smtp-relay.brevo.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_PASS
      }
  });

const message = {
  from: `"LinguaAble Support" <${process.env.BREVO_USER}>`,
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
          // Calculate yesterday based on todayStr
          const [yyyy, mm, dd] = todayStr.split('-').map(Number);
          const refDate = new Date(yyyy, mm - 1, dd);
          refDate.setDate(refDate.getDate() - 1);
          const yyyyLast = refDate.getFullYear();
          const mmLast = String(refDate.getMonth() + 1).padStart(2, '0');
          const ddLast = String(refDate.getDate()).padStart(2, '0');
          const yesterdayStr = `${yyyyLast}-${mmLast}-${ddLast}`;

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
      success: true,
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
      { returnDocument: 'after' }
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
    // Build the date strings for this Mon–Sun week using UTC to avoid timezone shifts
    const now = new Date();
    // Use UTC methods for consistent results across servers
    const dayOfWeek = now.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const diff = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);

    const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff));
    monday.setUTCHours(0, 0, 0, 0);

    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setUTCDate(monday.getUTCDate() + i);
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

// 11. SEARCH USERS
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q?.toString().trim() || req.query.q;
    if (!query) return res.json([]);

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
      .select('username fullName avatarUrl email streak _id')
      .limit(20);

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 12. GET PUBLIC PROFILE
router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { requesterEmail } = req.query;

    const profileUser = await User.findOne({ username });
    if (!profileUser) return res.status(404).json({ message: 'User not found' });

    let relationship = 'none'; // none | pending_sent | pending_received | friends | self
    let isFriend = false;
    let isSelf = false;

    // Check relationship if a logged-in user requested this profile
    if (requesterEmail) {
      const requester = await User.findOne({ email: requesterEmail });
      if (requester) {
        if (requester._id.toString() === profileUser._id.toString() || requester.email === profileUser.email) {
          relationship = 'self';
          isSelf = true;
          isFriend = true; // you can see your own stats
        } else {
          // Check if friends
          if (profileUser.friends && profileUser.friends.includes(requester._id)) {
            relationship = 'friends';
            isFriend = true;
          } else if (profileUser.friendRequestsReceived && profileUser.friendRequestsReceived.includes(requester._id)) {
            relationship = 'pending_sent'; // Current user requested this profile user
          } else if (requester.friendRequestsReceived && requester.friendRequestsReceived.includes(profileUser._id)) {
            relationship = 'pending_received'; // Profile user requested current user
          }
        }
      }
    }

    // Prepare response. Hide stats if not friend/self.
    const publicProfile = {
      _id: profileUser._id,
      username: profileUser.username,
      fullName: profileUser.fullName || '',
      email: profileUser.email || '',
      bio: profileUser.bio || '',
      avatarUrl: profileUser.avatarUrl || '',
      relationship: relationship
    };

    if (isFriend || relationship === 'friends' || relationship === 'self') {
      publicProfile.streak = profileUser.streak || 0;
      publicProfile.completedLessons = profileUser.completedLessons ? profileUser.completedLessons.length : 0;
      publicProfile.dailyScores = profileUser.dailyScores || [];
      publicProfile.dailyLessonCounts = profileUser.dailyLessonCounts || [];
    }

    res.json({
      success: true,
      ...publicProfile,
      relationship // also passed as top level just in case
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 13. FRIEND ACTIONS
router.post('/friend-request/send', async (req, res) => {
  try {
    const { requesterEmail, targetUsername } = req.body;
    const requester = await User.findOne({ email: requesterEmail });
    const target = await User.findOne({ username: targetUsername });

    if (!requester || !target) return res.status(404).json({ message: 'User missing' });
    if (requester._id.toString() === target._id.toString()) return res.status(400).json({ message: 'Cannot friend yourself' });
    if (requester.friends && requester.friends.includes(target._id)) return res.status(400).json({ message: 'Already friends' });
    if (requester.friendRequestsSent && requester.friendRequestsSent.includes(target._id)) return res.status(400).json({ message: 'Request already sent' });

    // Initialize arrays if they don't exist
    if (!requester.friendRequestsSent) requester.friendRequestsSent = [];
    if (!requester.friendRequestsReceived) requester.friendRequestsReceived = [];
    if (!target.friendRequestsSent) target.friendRequestsSent = [];
    if (!target.friendRequestsReceived) target.friendRequestsReceived = [];
    if (!requester.friends) requester.friends = [];
    if (!target.friends) target.friends = [];

    // Add to arrays
    requester.friendRequestsSent.push(target._id);
    target.friendRequestsReceived.push(requester._id);

    // If target also already sent request, auto accept them
    if (requester.friendRequestsReceived.includes(target._id)) {
      requester.friendRequestsReceived.pull(target._id);
      requester.friendRequestsSent.pull(target._id);
      requester.friends.push(target._id);

      target.friendRequestsReceived.pull(requester._id);
      target.friendRequestsSent.pull(requester._id);
      target.friends.push(requester._id);
    }

    await requester.save();
    await target.save();

    res.json({ success: true, message: 'Friend request sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/friend-request/accept', async (req, res) => {
  try {
    const { currentEmail, targetId } = req.body; // targetId is ID of the user who requested
    const current = await User.findOne({ email: currentEmail });
    const target = await User.findById(targetId);

    if (!current || !target) return res.status(404).json({ message: 'User missing' });

    // Initialize arrays if they don't exist
    if (!current.friendRequestsReceived) current.friendRequestsReceived = [];
    if (!current.friends) current.friends = [];
    if (!target.friendRequestsSent) target.friendRequestsSent = [];
    if (!target.friends) target.friends = [];

    // Accept logic
    current.friendRequestsReceived.pull(target._id);
    current.friends.push(target._id);

    target.friendRequestsSent.pull(current._id);
    target.friends.push(current._id);

    await current.save();
    await target.save();

    res.json({ success: true, message: 'Friend request accepted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/friend-request/reject', async (req, res) => {
  try {
    const { currentEmail, targetId } = req.body;
    const current = await User.findOne({ email: currentEmail });
    const target = await User.findById(targetId);

    if (!current || !target) return res.status(404).json({ message: 'User missing' });

    // Initialize arrays if they don't exist
    if (!current.friendRequestsReceived) current.friendRequestsReceived = [];
    if (!target.friendRequestsSent) target.friendRequestsSent = [];

    // Reject logic
    current.friendRequestsReceived.pull(target._id);
    target.friendRequestsSent.pull(current._id);

    await current.save();
    await target.save();

    res.json({ success: true, message: 'Friend request rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 14. GET COMMUNITY DATA
router.get('/community/data', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email required' });

    // Find the user and populate the received friend requests and their current friends
    const user = await User.findOne({ email })
      .populate('friendRequestsReceived', 'username fullName avatarUrl')
      .populate('friends', 'username fullName avatarUrl completedLessons streak dailyScores');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      friendRequests: user.friendRequestsReceived || [],
      friends: user.friends || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;