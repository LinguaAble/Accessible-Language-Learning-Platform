# LinguaAble – Testing Strategy Document

## Testing Overview

Testing is conducted to ensure that the LinguaAble Accessible Language Learning Platform functions correctly, reliably, and securely before deployment. LinguaAble aims to provide an inclusive learning experience, necessitating rigorous testing of accessibility features alongside core functionality. The system includes a frontend (React), backend (Node.js), and mobile (Flutter) application, with testing verifying that each component works individually and together.

Testing helps:
- Detect bugs and accessibility barriers early
- Validate functional requirements (Learning paths, Progress tracking, AI recommendations)
- Ensure robust authentication, data privacy, and friend system integrity
- Maintain data integrity (User progress, Streaks, Scores, Leaderboard rankings)
- Ensure accessibility compliance (Screen reader compatibility, Keyboard navigation, Dyslexia support)
- Verify AI/NLP integrations produce accurate, relevant responses

## Technologies and Languages Used

### Backend
- **Node.js** – JavaScript runtime for server-side logic
- **Express.js 5.x** – Web framework for REST APIs
- **MongoDB & Mongoose 9.x** – NoSQL database and ODM
- **JWT** – Stateless authentication
- **Bcryptjs** – Password hashing
- **Nodemailer** – Email service via Brevo SMTP for password resets
- **natural** – NLP library (Double Metaphone, Levenshtein Distance)
- **string-similarity** – Dice/Bigram string comparison
- **Axios** – HTTP client for GROQ AI API calls

### Frontend
- **React 19.2** – UI development
- **Vite 7.x** – Frontend build tooling
- **Context API** – Global state management (UserContext, NotificationContext)
- **Vanilla CSS** – Styling with CSS variables for theming
- **Lucide React** – Icon library
- **React Router DOM 7.x** – Client-side routing
- **@react-oauth/google** – Google OAuth integration
- **jwt-decode** – JWT token decoding

### Mobile
- **Flutter (Dart)** – Cross-platform mobile application (Android, iOS, Web, Desktop)

## Comprehensive Testing Tools & Frameworks Summary

### Backend Testing Tools

| Tool/Framework | Purpose | Usage |
|----------------|---------|-------|
| **Jest 30.x** | Test Runner & Assertion Library | Primary test execution for backend logic |
| **Supertest 7.x** | HTTP Assertions | Interface testing for Express API endpoints |
| **MongoDB Memory Server** | Database Mocking | Isolated, in-memory database for integration tests |
| **Cross-Env** | Environment Configuration | Setting `NODE_ENV=test` across platforms |
| **Jest Mock Functions** | Service Mocking | Mocking `nodemailer`, `axios` for GROQ, and other external services |

### Frontend Testing Tools

| Tool/Framework | Purpose | Usage |
|----------------|---------|-------|
| **Vitest 4.x** | Test Runner | Fast, Vite-native unit and integration testing |
| **React Testing Library 16.x** | Component Testing | User-centric component behavior testing |
| **@testing-library/user-event 14.x** | User Interaction | Simulate clicks, typing, and keyboard navigation |
| **jsdom 28.x** | Browser Simulation | DOM environment for Node-based tests |
| **Vitest UI** | Test Visualization | Interactive test result exploration (`npm run test:ui`) |

### Code Quality & Analysis

| Tool | Purpose | Usage |
|------|---------|-------|
| **ESLint** | Linting | Static code analysis for JavaScript/React |

## Testing Levels and Scope

### 1. Unit Testing

#### Backend Unit Tests (6 Test Files — 141 Tests)

**Auth Controller (`routes/authRoutes.js`)**
- **Tests:** `tests/auth.test.js` (29 tests)
- **Functions Tested:**
  - `POST /register` – User registration, password hashing, JWT issuance
  - `POST /login` – Credential validation, JWT issuance, streak reset logic, login history tracking
  - `POST /forgot-password` – OTP generation, email sending (Mocked nodemailer)
  - `PUT /reset-password/:token` – OTP validation, password update
  - `PUT /update-progress` – Daily progress syncing, streak calculation, lesson count, daily scores
  - `POST /get-user-data` – Secure data retrieval (password exclusion)
  - `PUT /update-profile` – Profile field updates (username, fullName, age, gender, bio, avatarUrl)
  - `PUT /update-settings` – Preferences merge behavior
  - `GET /leaderboard` – Weekly score rankings
  - `GET /search` – User search by username, fullName, email
  - `GET /profile/:username` – Public profile with relationship-aware visibility
  - `POST /friend-request/send` – Friend request sending with auto-accept
  - `POST /friend-request/accept` – Friend request acceptance
  - `POST /friend-request/reject` – Friend request rejection
  - `GET /community/data` – Community data with populated friends
  - `GET /me` – Protected route (JWT auth middleware)

- **Test Scenarios:**
  - **Success**: Valid credentials, correct token generation, progress sync
  - **Validation**: Duplicate emails, invalid passwords, missing fields
  - **Security**: Password exclusion from responses, JWT verification
  - **Logic**: Daily streak resets, login history caps, preferences merging, score accumulation

**Progress Tracking:** `tests/progress.test.js` (22 tests)
- Completed lessons tracking (Set-based deduplication)
- Daily progress (minutes) with daily reset
- Daily lesson counts for charts
- Daily score accumulation
- Streak logic (consecutive days, gap detection, goal checking)
- Date/timezone handling

**User Data Retrieval:** `tests/userData.test.js` (16 tests)
- Get user data endpoint
- Password exclusion from response
- All user fields validation (including new fields: fullName, age, gender, bio, dailyScores)
- Error handling

**Settings Management:** `tests/settings.test.js` (18 tests)
- Update preferences (theme, soundEffects, animationReduced, fontSize, dailyGoalMinutes, dyslexiaFont, colorOverlay)
- Preferences merge behavior (not replace)
- Validation and error handling

**Profile Management:** `tests/profile.test.js` (29 tests)
- Update username, fullName, age, gender, bio, avatarUrl
- Partial updates (optional fields only)
- Bio length validation (max 500 chars)
- Gender enum validation

**Auth Middleware:** `tests/middleware.test.js` (27 tests)
- JWT token validation
- Protected route access
- Invalid/expired token handling
- Malformed header handling
- Missing token handling

#### Frontend Unit Tests (13 Test Files — ~200+ Tests)

**Core Logic & Context**
- `UserContext.jsx` methods: `login`, `logout`, `updateProgress`, `updatePreferences`, `updateProfile`
- Initial state hydration from localStorage
- Background sync with backend on mount
- Automatic daily reset of progress
- Streak sync from backend responses

**Components** (`src/tests/*.test.jsx`)
- **Tested Components**: `Login`, `Signup`, `Dashboard`, `Settings`, `LearningScreen`, `Lessons`, `LandingPage`, `ForgotPassword`, `ResetPassword`, `Sidebar`, `Layout`
- **Tested Utilities**: `googleSpeechService`, `soundUtils`
- **Test Properties**:
  - **Rendering**: Correct display of UI elements, accessibility labels
  - **Interaction**: Typing in forms, clicking buttons, hover states (using `user-event`)
  - **Navigation**: Link routing (using mocked `react-router-dom`)
  - **API Calls**: Axios mocking (using `vi.mock`)
  - **State Management**: Context value changes, localStorage sync
  - **Accessibility**: ARIA labels, keyboard navigation, role-based queries

### 2. Integration Testing

#### Backend Integration Tests
- **Flow**: API Route → Controller → In-Memory MongoDB
- **Verification**: Data correctly saved and retrieved from mocked database
- **Streak Logic**: End-to-end streak calculation with consecutive day simulation
- **Friend System**: Send → Accept → Verify mutual friendship in DB

#### Frontend Integration Tests
- **Mocking**: Axios calls mocked to return specific responses, component state updates as if talking to real backend
- **Scenarios**: Successful login redirects, failed login shows errors, progress sync on dashboard mount, leaderboard data rendering

### 3. Compatibility Testing

**Browser Support:**
- **Target**: Chrome, Firefox, Edge, Safari (Latest versions)
- **Responsive**: Verified on Desktop (1920x1080) and Mobile viewpoints

## Test Execution Commands

### Backend
```bash
cd backend
npm test                        # Run all 141 tests
npm test -- auth.test.js        # Run specific file
npm run test:watch              # Watch mode
npm test -- --coverage          # Coverage report
```

### Frontend
```bash
cd frontend
npm test                        # Run all ~200+ tests (watch mode)
npm test -- run                 # Run once
npm run test:ui                 # Interactive UI
npm run test:coverage           # Coverage report
```

## Test Properties Matrix

| Component Type | Properties Tested | Test Methods |
|----------------|-------------------|--------------|
| **Backend API (Auth)** | Status Codes, Auth Logic, JWT, Hashing | Jest + Supertest |
| **Backend API (Progress)** | Streak, Scores, Lesson Counts, Daily Reset | Jest + Supertest |
| **Backend API (Profile)** | Field Updates, Validation, Partial Updates | Jest + Supertest |
| **Backend API (Settings)** | Preferences Merge, Enum Validation | Jest + Supertest |
| **Backend Middleware** | JWT Validation, Protected Routes | Jest + Supertest |
| **UI Components** | Visual Rendering, Interactions, Accessibility | Vitest + RTL |
| **State (Context)** | Persistence, Updates, API Sync, Daily Reset | Context Tests |
| **Utilities** | Speech Service, Sound Effects | Unit Tests |

## Test Coverage Summary

### Backend (141 tests across 6 files)

| Module | Test File | Tests | Coverage |
|--------|-----------|-------|----------|
| Authentication | `auth.test.js` | 29 | ✅ 100% |
| User Progress | `progress.test.js` | 22 | ✅ 100% |
| User Data | `userData.test.js` | 16 | ✅ 100% |
| Settings | `settings.test.js` | 18 | ✅ 100% |
| Profile | `profile.test.js` | 29 | ✅ 100% |
| Middleware | `middleware.test.js` | 27 | ✅ 100% |
| **Total** | **6 files** | **141** | **~90%+** |

### Frontend (~200+ tests across 13 files)

| Module | Test File | Tests (Approx) | Status |
|--------|-----------|-------|--------|
| Dashboard | `Dashboard.test.jsx` | 41 | ✅ Passing |
| Settings | `Settings.test.jsx` | 28 | ✅ Passing |
| Reset Password | `ResetPassword.test.jsx` | 36 | ✅ Passing |
| Landing Page | `LandingPage.test.jsx` | 29 | ✅ Passing |
| Login | `Login.test.jsx` | 19 | ✅ Passing |
| Signup | `Signup.test.jsx` | 15+ | ✅ Passing |
| Learning Screen | `LearningScreen.test.jsx` | 25+ | ✅ Passing |
| Forgot Password | `ForgotPassword.test.jsx` | 10+ | ✅ Passing |
| Lessons | `Lessons.test.jsx` | 10+ | ✅ Passing |
| Sidebar | `Sidebar.test.jsx` | 15+ | ✅ Passing |
| Layout | `Layout.test.jsx` | 10+ | ✅ Passing |
| Google Speech | `googleSpeechService.test.js` | 10+ | ✅ Passing |
| Sound Utils | `soundUtils.test.js` | 10+ | ✅ Passing |
| **Total** | **13 files** | **~200+** | **High** |
