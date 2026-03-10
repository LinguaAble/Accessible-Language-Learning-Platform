# Frontend Testing Guide

This guide covers testing strategies for the React + Vite frontend application.

## 🛠️ Prerequisites
- **Vitest 4.x**: Test runner (compatible with Jest API)
- **React Testing Library 16.x**: Component rendering and interaction
- **jsdom 28.x**: Browser environment simulation
- **@testing-library/user-event 14.x**: User interaction simulation

## 🏃 Running Tests

### Run All Tests
```bash
cd frontend
npm test
```

### Run Specific Test File
```bash
npm test src/tests/Dashboard.test.jsx
npm test src/tests/Settings.test.jsx
npm test src/tests/Login.test.jsx
npm test src/tests/ResetPassword.test.jsx
npm test src/tests/LearningScreen.test.jsx
npm test src/tests/Lessons.test.jsx
npm test src/tests/Sidebar.test.jsx
```

### Run Tests in Watch Mode (Default)
Vitest runs in watch mode by default. To run once:
```bash
npm test -- run
```

### Run with UI Interface
```bash
npm run test:ui
```

### Run with Coverage Report
```bash
npm run test:coverage
```

## 📁 Test File Organization

Tests are located in `src/tests/` and cover all major components and utilities:

### Authentication Pages
- **`Login.test.jsx`**: Authentication form, input validation, Google OAuth, API integration, error handling.
- **`Signup.test.jsx`**: Registration form, password matching, validation, API integration.
- **`ResetPassword.test.jsx`**: Password reset flow, OTP token handling, redirects, validation.
- **`ForgotPassword.test.jsx`**: Email submission for password reset OTP.

### Core Pages
- **`Dashboard.test.jsx`**: User stats display, weekly chart, daily goal progress, streak display, quick actions navigation, data sync, avatar rendering. (41 tests)
- **`LearningScreen.test.jsx`**: Lesson flow, speech interaction, audio playback, NLP evaluation, scoring.
- **`Lessons.test.jsx`**: Lesson listing, completion status, navigation to learning screen.
- **`LandingPage.test.jsx`**: Hero section, features display, navigation links.
- **`Settings.test.jsx`**: Profile editing, preference toggles, avatar upload, accessibility settings.

### Layout & Navigation
- **`Sidebar.test.jsx`**: Navigation links, active state, logout, responsive behavior.
- **`Layout.test.jsx`**: Common page layout, sidebar integration, content area.

### Utilities
- **`googleSpeechService.test.js`**: Google Cloud Speech-to-Text API integration, audio handling.
- **`soundUtils.test.js`**: Sound effects utilities, click sounds, navigation sounds.

## 🧪 Writing Tests

We use `@testing-library/react` to render components and `vi` from Vitest for mocking.

### Example: Component Test

```javascript
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '../pages/MyComponent';

// Mock external dependencies
vi.mock('axios');
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => vi.fn() };
});

// Mock UserContext
vi.mock('../context/UserContext', () => ({
    useUser: () => ({
        user: { email: 'test@example.com', username: 'TestUser' },
        preferences: { theme: 'dark', dailyGoalMinutes: 5 },
        todayProgress: 3,
        streak: 5,
        updatePreferences: vi.fn(),
        login: vi.fn(),
        logout: vi.fn()
    }),
    UserProvider: ({ children }) => children
}));

describe('MyComponent Tests', () => {
    test('Should handle user interaction', async () => {
        const user = userEvent.setup();
        render(<MyComponent />);

        // Find element
        const button = screen.getByRole('button', { name: /Submit/i });
        
        // Interact
        await user.click(button);

        // Assert
        await waitFor(() => {
            expect(screen.getByText(/Success/i)).toBeInTheDocument();
        });
    });
});
```

## 🔍 Test Coverage

**Current Coverage Status:**

| Module | Test File | Tests (Approx) | Status |
|--------|-----------|-------|--------|
| **Dashboard** | `Dashboard.test.jsx` | 41 | ✅ Passing |
| **Settings** | `Settings.test.jsx` | 28 | ✅ Passing |
| **Reset Password** | `ResetPassword.test.jsx` | 36 | ✅ Passing |
| **Landing Page** | `LandingPage.test.jsx` | 29 | ✅ Passing |
| **Login** | `Login.test.jsx` | 19 | ✅ Passing |
| **Signup** | `Signup.test.jsx` | 15+ | ✅ Passing |
| **Learning Screen** | `LearningScreen.test.jsx` | 25+ | ✅ Passing |
| **Forgot Password** | `ForgotPassword.test.jsx` | 10+ | ✅ Passing |
| **Lessons** | `Lessons.test.jsx` | 10+ | ✅ Passing |
| **Sidebar** | `Sidebar.test.jsx` | 15+ | ✅ Passing |
| **Layout** | `Layout.test.jsx` | 10+ | ✅ Passing |
| **Google Speech** | `googleSpeechService.test.js` | 10+ | ✅ Passing |
| **Sound Utils** | `soundUtils.test.js` | 10+ | ✅ Passing |
| **Combined** | **13 files** | **~200+** | **High** |

## 🎯 Best Practices

1.  **Mocking**: Mock external dependencies like API calls (`axios`), React Router hooks (`useNavigate`), User Context (`useUser`), Notification Context, and complex browser APIs (`SpeechSynthesis`, `MediaRecorder`).
2.  **User Event**: Use `userEvent` over `fireEvent` where possible for more realistic interactions.
3.  **Accessibility**: Query by role (`getByRole`) and accessible names to ensure accessibility.
4.  **Async Handling**: Use `waitFor` and `async/await` for state updates and API responses.
5.  **Isolation**: Clear mocks (`vi.clearAllMocks()`) in `beforeEach` to prevent test pollution.
6.  **Context Mocking**: Always mock both `UserContext` and `NotificationContext` to isolate components.
