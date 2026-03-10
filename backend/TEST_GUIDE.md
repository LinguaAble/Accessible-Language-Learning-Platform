# Backend Testing Guide

This guide covers testing strategies for the Node.js + Express backend.

## 🛠️ Prerequisites
- **Jest 30.x**: Test runner
- **Supertest 7.x**: HTTP assertions
- **MongoDB Memory Server**: Isolated in-memory database for tests
- **Cross-Env**: Cross-platform `NODE_ENV=test` setting

## 🏃 Running Tests

### Run All Tests
```bash
cd backend
npm test
```

### Run Specific Test File
```bash
npm test -- auth.test.js
npm test -- progress.test.js
npm test -- userData.test.js
npm test -- settings.test.js
npm test -- profile.test.js
npm test -- middleware.test.js
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run with Coverage Report
```bash
npm test -- --coverage
```

## 📁 Test File Organization

Tests are organized by module in the `tests/` directory for better maintainability:

### `tests/auth.test.js` - Authentication (29 tests)
- User registration (hashing, JWT issuance, default preferences)
- User login (credential validation, streak reset on gap, login history)
- Password reset (OTP generation via mocked email, OTP validation, password update)
- Login history tracking (capped at 10 entries)
- Password hashing verification (bcryptjs)

### `tests/progress.test.js` - User Progress (22 tests)
- Completed lessons tracking (Set-based deduplication)
- Daily progress (minutes) with daily reset logic
- Daily lesson counts for weekly charts
- Daily score accumulation for leaderboard
- Streak logic (consecutive days extend, gap resets to 1, goal checking)
- Date/timezone handling via `date` parameter

### `tests/userData.test.js` - User Data Retrieval (16 tests)
- `POST /get-user-data` endpoint
- Password exclusion from response
- All user fields validation (including fullName, age, gender, bio, avatarUrl, dailyScores, lessonScores)
- Error handling (missing email, user not found)

### `tests/settings.test.js` - Settings Management (18 tests)
- Update preferences (theme, soundEffects, animationReduced, fontSize, dailyGoalMinutes, dyslexiaFont, colorOverlay)
- Preferences merge behavior (existing values preserved)
- Validation and error handling (missing email, missing preferences)

### `tests/profile.test.js` - Profile Management (29 tests)
- Update username, fullName, age, gender, bio, avatarUrl
- Partial updates (only provided fields are changed)
- Bio length validation (max 500 chars)
- Gender enum validation (male, female, other, prefer-not-to-say)
- Preferences update via profile endpoint

### `tests/middleware.test.js` - Authentication Middleware (27 tests)
- JWT token validation (valid tokens pass through)
- Protected route access (`GET /me`)
- Invalid/expired token handling (401 responses)
- Malformed Authorization header handling
- Missing token handling

## 🧪 Writing Tests

We use `supertest` to test API endpoints without running the actual server. Tests use `mongodb-memory-server` for an isolated in-memory database.

### Example: Progress Update Test

```javascript
const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/authRoutes');
const User = require('../models/User');
require('./setup'); // Import test database setup

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('User Progress API Tests', () => {
  
  beforeEach(async () => {
    // Create test user
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Password123',
        username: 'testuser'
      });
  });

  test('Should update completed lessons', async () => {
    const res = await request(app)
      .put('/api/auth/update-progress')
      .send({
        email: 'test@example.com',
        completedLessons: [1, 2, 3]
      });
    
    expect(res.status).toBe(200);
    expect(res.body.completedLessons).toEqual([1, 2, 3]);
  });

  test('Should accumulate daily scores', async () => {
    const res = await request(app)
      .put('/api/auth/update-progress')
      .send({
        email: 'test@example.com',
        lessonScore: 85,
        date: '2026-03-10'
      });
    
    expect(res.status).toBe(200);
    expect(res.body.dailyScores).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ date: '2026-03-10', score: 85 })
      ])
    );
  });
});
```

## 🔍 Test Coverage

**Current Coverage: ~90%+**

| Module | Test File | Tests | Coverage |
|--------|-----------|-------|----------|
| Authentication | `auth.test.js` | 29 | ✅ 100% |
| User Progress | `progress.test.js` | 22 | ✅ 100% |
| User Data | `userData.test.js` | 16 | ✅ 100% |
| Settings | `settings.test.js` | 18 | ✅ 100% |
| Profile | `profile.test.js` | 29 | ✅ 100% |
| Middleware | `middleware.test.js` | 27 | ✅ 100% |
| **Total** | **6 files** | **141** | **~90%+** |

## 🎯 Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Use `beforeEach` and `afterEach` hooks to set up and clean up test data
3. **Descriptive Names**: Use clear, descriptive test names that explain what is being tested
4. **Edge Cases**: Test both happy paths and error conditions
5. **Async/Await**: Always use async/await for database operations and HTTP requests
6. **Mock External Services**: Mock nodemailer and other external services (GROQ API) to avoid side effects
