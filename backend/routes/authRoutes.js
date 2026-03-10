const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');

// --- PREMIUM ACCESSIBILITY-FOCUSED HTML TEMPLATE FOR LINGUAABLE ---
const getEmailTemplate = (title, subtitle, code, description) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; background-color: #0c0e14; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #0c0e14; padding-bottom: 40px; }
        .main-container { max-width: 600px; margin: 40px auto; background-color: #171c26; border-radius: 20px; border: 1px solid #2d364a; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); }
        .header { background: linear-gradient(135deg, #1e3a8a 0%, #171c26 100%); padding: 40px 30px; text-align: center; border-bottom: 1px solid #2d364a; }
        .logo-text { color: #fff; font-size: 28px; font-weight: 800; letter-spacing: -1px; margin: 0; }
        .logo-text span { color: #f79c42; }
        .content { padding: 45px 40px; text-align: center; }
        .title { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 12px 0; }
        .subtitle { color: #94a3b8; font-size: 16px; font-weight: 400; line-height: 1.6; margin: 0 0 35px 0; }
        .code-container { background: #0c0e14; border: 2px dashed #f79c42; border-radius: 16px; padding: 25px; margin: 0 auto 35px auto; display: inline-block; min-width: 240px; }
        .otp-code { color: #f79c42; font-size: 42px; font-weight: 800; letter-spacing: 12px; margin: 0; padding-left: 12px; font-family: 'Courier New', Courier, monospace; }
        .info-text { color: #64748b; font-size: 14px; line-height: 1.5; margin: 0 0 10px 0; }
        .footer { background-color: #0c0e14; padding: 25px; text-align: center; border-top: 1px solid #2d364a; }
        .footer-text { color: #475569; font-size: 12px; margin: 0; }
        .accent-bar { height: 4px; background: #f79c42; width: 100%; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="main-container">
            <div class="accent-bar"></div>
            <div class="header">
                <h1 class="logo-text">Lingua<span>Able</span></h1>
            </div>
            <div class="content">
                <h2 class="title">${title}</h2>
                <p class="subtitle">${subtitle}</p>
                
                <div class="code-container">
                    <p class="otp-code">${code}</p>
                </div>
                
                <p class="info-text">${description}</p>
                <p class="info-text">If you didn't request this, you can safely ignore this email.</p>
            </div>
            <div class="footer">
                <p class="footer-text">&copy; 2026 LinguaAble. All rights reserved.</p>
                <p class="footer-text">Making Language Learning Accessible to Everyone.</p>
            </div>
        </div>
    </div>
</body>
</html>
`;

// --- RESEND HTTP API HELPER ---
async function sendEmailViaResend(toEmail, subject, htmlContent) {
  try {
    const response = await axios.post(
      'https://api.resend.com/emails',
      {
        from: 'LinguaAble <onboarding@resend.dev>',
        to: [toEmail],
        subject: subject,
        html: htmlContent
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Email sent successfully via Resend:', response.data.id);
    return response.data;
  } catch (err) {
    if (err.response) {
      console.error('Resend API Error:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Resend Request Error:', err.message);
    }
    throw new Error(err.response?.data?.message || 'Failed to send email via Resend');
  }
}




// Helper: Generate OTP, hash it, save to OTP collection, and send email
async function sendMfaOtp(email, signupData = null) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  await OTP.findOneAndUpdate(
    { email },
    { 
      otp: hashedOtp, 
      createdAt: Date.now(),
      ...(signupData ? { signupData } : { $unset: { signupData: 1 } })
    },
    { upsert: true, returnDocument: 'after' }
  );

  const html = getEmailTemplate(
    'Verification Code',
    'Use the code below to verify your email and secure your account.',
    otp,
    'This code will expire in 5 minutes for your security.'
  );

  await sendEmailViaResend(email, 'Your LinguaAble Verification Code', html);

  return otp;
}


// 1. REGISTER USER
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'This email is already registered.' });
    }

    // Encrypt Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Instead of creating the user NOW, we store pending data in the OTP collection.
    // The user is actually created ONLY upon OTP verification.
    await sendMfaOtp(email, {
      password: hashedPassword,
      username: username || email.split('@')[0]
    });

    res.json({ pendingMFA: true, email });
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

    // Send MFA OTP. We don't send signupData because they already exist.
    await sendMfaOtp(email);

    res.json({ pendingMFA: true, email: user.email });
  } catch (err) {
    console.error('Login error:', err.message, err.stack);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 2b. VERIFY MFA OTP
router.post('/verify-mfa', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });

    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    // Find the OTP record
    const otpRecord = await OTP.findOne({ email, otp: hashedOtp });
    
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    let user;

    // A. Registration Verification (signupData exists)
    if (otpRecord.signupData && otpRecord.signupData.password) {
      // Create User NOW
      user = new User({
        email: otpRecord.email,
        username: otpRecord.signupData.username,
        password: otpRecord.signupData.password,
        loginHistory: [{ timestamp: new Date(), device: req.body.device || 'Web Browser' }]
      });
    } 
    // B. Login Verification
    else {
      user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found.' });

      // Update login history
      const newHistory = [...(user.loginHistory || []), { timestamp: new Date(), device: req.body.device || 'Web Browser' }];
      if (newHistory.length > 10) newHistory.shift();
      user.loginHistory = newHistory;

      // Streak reset check
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
      user.streak = newStreak;
    }

    // Save newly created or updated user
    await user.save();

    // Verification successful—delete the OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

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
    console.error('MFA verify error:', err.message, err.stack);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 2c. RESEND MFA OTP
router.post('/resend-mfa', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    // Check if an OTP record already exists to preserve signupData
    const existingOtp = await OTP.findOne({ email });

    if (existingOtp) {
      // Re-send and update OTP preserving existing signupData
      await sendMfaOtp(email, existingOtp.signupData);
    } else {
      // If no OTP record exists, maybe it's a login attempt.
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'Session expired. Please try again.' });
      }
      await sendMfaOtp(email);
    }

    res.json({ success: true, message: 'Verification code re-sent to your email.' });
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

    const html = getEmailTemplate(
      'Password Reset',
      'You requested to reset your password. Use the code below to proceed.',
      otp,
      'This code is valid for 1 minute. Please use it immediately.'
    );

    await sendEmailViaResend(user.email, 'Password Reset Code', html);


    res.status(200).json({ success: true, data: "OTP sent to email" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Email could not be sent: " + err.message });
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