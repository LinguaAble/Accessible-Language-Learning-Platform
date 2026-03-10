# API Documentation

Base URL: `http://localhost:5000/api`  
Production: `https://your-backend-host.com/api`

---

## 🔐 Authentication (`/api/auth`)

### Register User
Create a new user account.  
`POST /auth/register`

**Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "device": "Web Browser"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "email": "john@example.com",
    "username": "johndoe",
    "fullName": "",
    "age": null,
    "gender": "",
    "bio": "",
    "avatarUrl": "",
    "preferences": {
      "theme": "dark",
      "soundEffects": false,
      "animationReduced": false,
      "fontSize": "medium",
      "dailyGoalMinutes": 5,
      "dyslexiaFont": false,
      "colorOverlay": "none"
    },
    "completedLessons": [],
    "loginHistory": [{ "timestamp": "...", "device": "Web Browser" }],
    "todayProgress": 0,
    "progressDate": "...",
    "streak": 0,
    "lastStreakDate": "",
    "dailyLessonCounts": [],
    "dailyScores": []
  }
}
```

---

### Login
Authenticate an existing user.  
`POST /auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123",
  "device": "Web Browser"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "email": "john@example.com",
    "username": "johndoe",
    "fullName": "",
    "age": null,
    "gender": "",
    "bio": "",
    "avatarUrl": "",
    "preferences": { "..." },
    "completedLessons": [1, 2, 3],
    "loginHistory": [{ "timestamp": "...", "device": "Web Browser" }],
    "todayProgress": 5,
    "progressDate": "Tue Mar 10 2026",
    "streak": 3,
    "lastStreakDate": "2026-03-10",
    "dailyLessonCounts": [{ "date": "2026-03-10", "count": 2 }],
    "dailyScores": [{ "date": "2026-03-10", "score": 85 }]
  }
}
```

> **Note:** Streak is automatically reset to `0` if the last streak date is older than yesterday (gap detected on login).

---

### Get Current User (Protected)
Retrieve the authenticated user via JWT token.  
`GET /auth/me`  
**Headers:** `Authorization: Bearer <token>`

**Response (200):** Full user object (password excluded).

---

## 🔐 Password Management

### Forgot Password
Send a 6-digit OTP to the user's email via Brevo SMTP.  
`POST /auth/forgot-password`

**Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": "OTP sent to email"
}
```

> OTP expires in **1 minute**. OTP is hashed (SHA-256) before storing in DB.

---

### Reset Password
Reset password using the received OTP.  
`PUT /auth/reset-password/:token`

**Params:** `token` = the 6-digit OTP sent to email.

**Body:**
```json
{
  "password": "NewSecurePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": "Password updated success"
}
```

---

## 👤 User Data & Progress (`/api/auth`)

### Get User Data
Retrieve full user profile, settings, and progress.  
`POST /auth/get-user-data`

**Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "preferences": { "..." },
    "username": "johndoe",
    "fullName": "John Doe",
    "age": 25,
    "gender": "male",
    "bio": "Learning Hindi!",
    "avatarUrl": "...",
    "loginHistory": [],
    "completedLessons": [1, 2, 3],
    "todayProgress": 5,
    "progressDate": "Tue Mar 10 2026",
    "streak": 3,
    "lastStreakDate": "2026-03-10",
    "dailyLessonCounts": [{ "date": "2026-03-10", "count": 2 }],
    "dailyScores": [{ "date": "2026-03-10", "score": 85 }]
  }
}
```

---

### Update Progress
Update lesson completion, daily progress, lesson counts, and scores.  
`PUT /auth/update-progress`

**Body:**
```json
{
  "email": "john@example.com",
  "completedLessons": [4],
  "todayProgress": 10,
  "incrementLessonCount": 1,
  "lessonScore": 85,
  "date": "2026-03-10"
}
```

All fields (except `email`) are optional. Logic:
- **completedLessons**: Merged with existing (de-duplicated via Set).
- **todayProgress**: Updates daily minutes. Triggers streak logic (extend if consecutive day meets goal, reset to 1 if gap).
- **incrementLessonCount**: Adds to `dailyLessonCounts` for the given date.
- **lessonScore**: Adds to `dailyScores` for the given date.

**Response (200):**
```json
{
  "success": true,
  "completedLessons": [1, 2, 3, 4],
  "todayProgress": 10,
  "progressDate": "Tue Mar 10 2026",
  "streak": 4,
  "lastStreakDate": "2026-03-10",
  "dailyLessonCounts": [{ "date": "2026-03-10", "count": 3 }],
  "dailyScores": [{ "date": "2026-03-10", "score": 170 }]
}
```

---

## 👤 Profile Management

### Update Profile
Update user profile details.  
`PUT /auth/update-profile`

**Body:**
```json
{
  "email": "john@example.com",
  "username": "newname",
  "fullName": "John Doe",
  "age": 25,
  "gender": "male",
  "bio": "I love learning Hindi!",
  "avatarUrl": "https://...",
  "preferences": {
    "theme": "light",
    "dailyGoalMinutes": 10
  }
}
```

All fields (except `email`) are optional. Preferences are merged, not replaced.

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": { "..." }
}
```

---

## ⚙️ Settings

### Update Settings
Update user preferences only.  
`PUT /auth/update-settings`

**Body:**
```json
{
  "email": "john@example.com",
  "preferences": {
    "theme": "dark",
    "soundEffects": true,
    "animationReduced": false,
    "fontSize": "large",
    "dailyGoalMinutes": 10,
    "dyslexiaFont": true,
    "colorOverlay": "yellow"
  }
}
```

Preferences are merged with existing values (not replaced).

**Response (200):**
```json
{
  "success": true,
  "preferences": { "..." }
}
```

---

## 🏆 Leaderboard

### Get Weekly Leaderboard
Returns top 50 users ranked by weekly score (Mon–Sun).  
`GET /auth/leaderboard`

**Response (200):**
```json
{
  "success": true,
  "leaderboard": [
    {
      "rank": 1,
      "username": "toplearner",
      "email": "...",
      "avatarUrl": "...",
      "weeklyScore": 250,
      "completedLessons": 15
    }
  ],
  "weekStart": "2026-03-09",
  "weekEnd": "2026-03-15"
}
```

> Sorted by `weeklyScore` (descending), then by `completedLessons` as tiebreaker.

---

## 🔍 User Search

### Search Users
Find users by username, full name, or email.  
`GET /auth/search?q=<query>`

**Response (200):** Array of matching users (max 20).
```json
[
  {
    "_id": "...",
    "username": "johndoe",
    "fullName": "John Doe",
    "avatarUrl": "...",
    "email": "john@example.com",
    "streak": 5
  }
]
```

---

## 👤 Public Profile

### Get User Profile
Get a user's public profile with relationship-aware visibility.  
`GET /auth/profile/:username?requesterEmail=<email>`

**Response (200):**
```json
{
  "success": true,
  "_id": "...",
  "username": "johndoe",
  "fullName": "John Doe",
  "email": "john@example.com",
  "bio": "...",
  "avatarUrl": "...",
  "relationship": "friends",
  "streak": 5,
  "completedLessons": 12,
  "dailyScores": [],
  "dailyLessonCounts": []
}
```

> Stats (streak, completedLessons, scores) are **only visible** if the relationship is `friends` or `self`. Relationship values: `none`, `pending_sent`, `pending_received`, `friends`, `self`.

---

## 🤝 Friend System

### Send Friend Request
`POST /auth/friend-request/send`

**Body:**
```json
{
  "requesterEmail": "john@example.com",
  "targetUsername": "janedoe"
}
```

> Auto-accepts if both users have pending requests to each other.

---

### Accept Friend Request
`POST /auth/friend-request/accept`

**Body:**
```json
{
  "currentEmail": "jane@example.com",
  "targetId": "ObjectId..."
}
```

---

### Reject Friend Request
`POST /auth/friend-request/reject`

**Body:**
```json
{
  "currentEmail": "jane@example.com",
  "targetId": "ObjectId..."
}
```

---

## 🏘️ Community

### Get Community Data
Get friend requests and friends list (populated).  
`GET /auth/community/data?email=<email>`

**Response (200):**
```json
{
  "friendRequests": [
    { "_id": "...", "username": "newuser", "fullName": "New User", "avatarUrl": "..." }
  ],
  "friends": [
    { "_id": "...", "username": "bestfriend", "fullName": "...", "avatarUrl": "...", "completedLessons": [...], "streak": 10, "dailyScores": [...] }
  ]
}
```

---

## 🤖 AI Endpoints (`/api/ai`)

### Daily Study Plan
AI-generated personalized daily recommendation.  
`POST /ai/daily-plan`

**Body:**
```json
{
  "completedLessons": [1, 2, 3],
  "streak": 5,
  "dailyGoalMinutes": 5,
  "lessonScores": [{ "lessonId": 3, "score": 60 }],
  "todayProgress": 2
}
```

**Response (200):**
```json
{
  "success": true,
  "plan": "📖 Review Lesson 3: \"Recap: Vowels\" (~4 min) — you scored 60% last time. A quick re-run will help you nail those vowel sounds!"
}
```

---

### Chatbot (LinguaBot)
AI-powered Hindi learning assistant.  
`POST /ai/chat`

**Body:**
```json
{
  "message": "How do I say 'thank you' in Hindi?",
  "history": [
    { "role": "user", "content": "Hi!" },
    { "role": "assistant", "content": "Hello! 👋 Ready to learn some Hindi today?" }
  ],
  "userProgress": {
    "completedLessons": [1, 2, 3],
    "streak": 5,
    "todayProgress": 3,
    "dailyGoalMinutes": 5,
    "lessonScores": []
  },
  "userInfo": {
    "fullName": "John",
    "username": "johndoe",
    "age": 25,
    "gender": "male",
    "bio": "Learning Hindi"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "reply": "\"Thank you\" in Hindi is धन्यवाद (dhanyavaad)! It's one of the most useful phrases. 🙏"
}
```

---

## 🗣️ NLP Evaluation (`/api/eval`)

### Evaluate Pronunciation
Evaluate spoken pronunciation against expected answer using multi-layer NLP.  
`POST /eval/pronunciation`

**Body:**
```json
{
  "transcript": "namaste",
  "expectedAnswer": "namaste",
  "expectedHindi": "नमस्ते"
}
```

**Response (200):**
```json
{
  "isCorrect": true,
  "confidence": 0.98,
  "feedback": "✅ Excellent!",
  "matchType": "exact_roman"
}
```

**Match Types (in priority order):**
1. `exact_hindi` — Direct Hindi script match (confidence: 1.0)
2. `exact_roman` — Direct romanization match (confidence: 0.98)
3. `transliteration` — Hindi→Roman transliteration lookup (confidence: 0.95)
4. `phonetic_norm` — Phonetic normalization match (confidence: 0.90)
5. `metaphone` — Double Metaphone + Levenshtein (≥60%) (confidence: 0.85)
6. `fuzzy_levenshtein` — Levenshtein distance ≥75% (confidence: varies)
7. `dice_similarity` — Dice/Bigram ≥70% (confidence: varies)
8. `partial_word` — Per-word match ≥80% (confidence: varies)
9. `no_match` — Incorrect (confidence: best similarity score)
