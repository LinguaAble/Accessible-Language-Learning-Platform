# API Documentation

Base URL: `http://localhost:5000/api`

## 🔐 Authentication

### Register User
Create a new user account.
`POST /auth/register`

**Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

### Login
Authenticate an existing user.
`POST /auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "username": "johndoe" }
}
```

---

## 👤 User Data & Progress

### Get User Data
Retrieve full user profile, settings, and progress.
`POST /auth/get-user-data`

**Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "user": {
    "username": "johndoe",
    "email": "john@example.com",
    "completedLessons": ["lesson1", "lesson2"],
    "todayProgress": 15,
    "dailyLessonCounts": [{ "date": "2023-10-27", "count": 2 }]
  }
}
```

### Update Progress
Update lesson completion status and daily stats.
`PUT /auth/update-progress`

**Body:**
```json
{
  "email": "john@example.com",
  "completedLessons": ["lesson3"],
  "todayProgress": 30,
  "incrementLessonCount": 1
}
```

### Update Profile
Update user profile details.
`PUT /auth/update-profile`

**Body:**
```json
{
  "email": "john@example.com",
  "username": "newname",
  "bio": "I love learning!",
  "avatarUrl": "..."
}
```

---

## ⚙️ Settings

### Update Settings
Update user preferences.
`PUT /auth/update-settings`

**Body:**
```json
{
  "email": "john@example.com",
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}
```

---

## 🔐 Password Management

### Forgot Password
Send a password reset OTP to email.
`POST /auth/forgot-password`

**Body:**
```json
{
  "email": "john@example.com"
}
```

### Reset Password
Reset password using the received OTP.
`PUT /auth/reset-password/:token`

**Body:**
```json
{
  "password": "NewSecurePassword123"
}
```
