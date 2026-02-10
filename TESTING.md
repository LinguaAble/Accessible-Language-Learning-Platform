# LinguaAble – Testing Strategy Document

## Testing Overview

Testing is conducted to ensure that the LinguaAble Accessible Language Learning Platform functions correctly, reliably, and securely before deployment. LinguaAble aims to provide an inclusive learning experience, necessitating rigorous testing of accessibility features alongside core functionality. Since the system includes both frontend (React) and backend (Node.js) components, testing verifies that each component works individually and together.

Testing helps:
- Detect bugs and accessibility barriers early
- Validate functional requirements (Learning paths, Progress tracking)
- Ensure robust authentication and data privacy
- Maintain data integrity (User progress, Streaks)
- Ensure accessibility compliance (Screen reader compatibility, Keyboard navigation)

## Technologies and Languages Used

### Backend
- **Node.js** – JavaScript runtime for server-side logic
- **Express.js** – Web framework for REST APIs
- **MongoDB & Mongoose** – NoSQL database and ODM
- **JWT** – Stateless authentication
- **Nodemailer** – Email service for password resets

### Frontend
- **React** – UI development
- **Vite** – Frontend build tooling
- **Context API** – Global state management
- **CSS Modules** – Styling

## Comprehensive Testing Tools & Frameworks Summary

### Backend Testing Tools

| Tool/Framework | Purpose | Usage |
|----------------|---------|-------|
| **Jest** | Test Runner & Assertion Library | Primary test execution for backend logic |
| **Supertest** | HTTP Assertions | Interface testing for Express API endpoints |
| **MongoDB Memory Server** | Database Mocking | Isolated, in-memory database for integration tests |
| **Cross-Env** | Environment Configuration | Setting `NODE_ENV=test` across platforms |
| **Jest Mock Functions** | Service Mocking | Manually mocking `nodemailer` to prevent real email sending |

### Frontend Testing Tools

| Tool/Framework | Purpose | Usage |
|----------------|---------|-------|
| **Vitest** | Test Runner | Fast, Vite-native unit and integration testing |
| **react-testing-library (RTL)** | Component Testing | User-centric component behavior testing |
| **@testing-library/user-event** | User Interaction | Simulate clicks, typing, and keyboard navigation |
| **jsdom** | Browser Simulation | DOM environment for Node-based tests |
| **Vitest UI** | Test Visualization | Interactive test result exploration (`npm run test:ui`) |

### Code Quality & Analysis

| Tool | Purpose | Usage |
|------|---------|-------|
| **ESLint** | Linting | Static code analysis for JavaScript/React |

## Testing Levels and Scope

### 1. Unit Testing

#### Backend Unit Tests
**Auth Controller (`src/routes/authRoutes.js`)**
- **Functions Tested:**
  - `POST /register` – User registration, password hashing
  - `POST /login` – Credential validation, JWT issuance
  - `POST /forgot-password` – OTP generation (Mocked email)
  - `PUT /reset-password/:token` – OTP validation, password update
  - `PUT /update-progress` – Daily progress syncing, streak calculation
  - `POST /get-user-data` – Secure data retrieval
  - `PUT /update-profile` – Profile management

- **Test Scenarios:**
  - **Success**: Valid credentials, correct token generation.
  - **Validation**: Duplicate emails, invalid passwords.
  - **Security**: Password exclusion from responses.
  - **Logic**: Daily streak resets, login history caps.

#### Frontend Unit Tests
**Core Logic & Context (`src/context/UserContext.jsx`)**
- **Methods Tested:**
  - `login` – State update and persistence
  - `logout` – State clearing
  - `updateProgress` – Daily progress calculation
  - `updatePreferences` – Theme application
- **Test Scenarios**:
  - Initial state hydration from localStorage.
  - Automatic daily reset of progress.

**Components (`src/tests/*.test.jsx`)**
- **Tested Components**: `Login`, `Signup`, `Dashboard`, `Settings`, `LearningScreen`.
- **Test Properties**:
  - **Rendering**: Correct display of UI elements.
  - **Interaction**: Typing in forms, clicking buttons (using `user-event`).
  - **Navigation**: Link routing (using mocked `react-router-dom`).
  - **API Calls**: Axios mocking (using `vi.mock`).

### 2. Integration Testing

#### Backend Integration Tests
- **Flow**: API Route -> Controller -> In-Memory Database.
- **Verification**: Ensuring data is correctly saved and retrieved from the mocked MongoDB instance.

#### Frontend Integration Tests
- **Mocking**: Axios calls are mocked to return specific responses, allowing component state to update as if talking to a real backend.
- **Scenarios**: Successful login redirects, failed login shows error messages.

### 4. Compatibility Testing

**Browser Support**:
- **Target**: Chrome, Firefox, Edge, Safari (Latest versions).
- **Responsive**: Verified on Desktop (1920x1080) and Mobile viewpoints.

## Test Properties Matrix

| Component Type | Properties Tested | Test Methods |
|----------------|-------------------|--------------|
| **Backend API** | Status Codes, Auth Logic, DB Interactions | Jest + Supertest |
| **UI Components** | Visual Rendering, Interactions, Accessibility | Vitest + RTL |
| **State** | Persistence, Updates, API Sync | Context Tests |
| **Utilities** | Helper Functions (Speech, Sound) | Unit Tests |
