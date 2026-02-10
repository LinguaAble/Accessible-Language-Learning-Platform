# Frontend Testing Guide

This guide covers testing strategies for the React + Vite frontend application.

## 🛠️ Prerequisites
- **Vitest**: Test runner (compatible with Jest API)
- **React Testing Library**: Component rendering and interaction
- **JSDOM**: Browser environment simulation
- **User Event**: User interaction simulation

## 🏃 Running Tests

### Run All Tests
```bash
cd frontend
npm test
```

### Run Specific Test File
```bash
npm test src/tests/Settings.test.jsx
npm test src/tests/ResetPassword.test.jsx
npm test src/tests/Login.test.jsx
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

Tests are located in `src/tests/` and mirror the component structure:

### `src/tests/auth/`
- **`Login.test.jsx`**: Authentication form, input validation, API integration.
- **`Signup.test.jsx`**: Registration form, password matching, API integration.
- **`ResetPassword.test.jsx`**: Password reset flow, token handling, redirects.
- **`ForgotPassword.test.jsx`**: Email submission for password reset.

### `src/tests/pages/`
- **`Settings.test.jsx`**: Profile editing, preference toggles, avatar upload.
- **`LandingPage.test.jsx`**: Hero section, features display, navigation.
- **`Dashboard.test.jsx`**: User stats display, progress tracking, layout.
- **`LearningScreen.test.jsx`**: Lesson flow, speech interaction, audio playback.

### `src/tests/components/`
- **`Sidebar.test.jsx`**: Navigation links, active state, logout.
- **`Layout.test.jsx`**: Common page layout, sidebar integration.

## 🧪 Writing Tests

We use `@testing-library/react` to render components and `vi` from Vitest for mocking.

### Example: Component Test

```javascript
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '../components/MyComponent';

// Mock external dependencies
vi.mock('../utils/api');

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
|--------|-----------|-------|----------|
| **Settings** | `Settings.test.jsx` | 28 | ✅ Passing |
| **Reset Password** | `ResetPassword.test.jsx` | 36 | ✅ Passing |
| **Landing Page** | `LandingPage.test.jsx` | 29 | ✅ Passing |
| **Login** | `Login.test.jsx` | 19 | ✅ Passing |
| **Learning Screen** | `LearningScreen.test.jsx` | 25+ | ✅ Passing |
| **Dashboard** | `Dashboard.test.jsx` | 15+ | ✅ Passing |
| **Signup** | `Signup.test.jsx` | 15+ | ✅ Passing |
| **Combined** | **TOTAL** | **~200+** | **High** |

## 🎯 Best Practices

1.  **Mocking**: Mock external dependencies like API calls (`axios`), React Router hooks (`useNavigate`), and complex libraries (`SpeechSynthesis`).
2.  **User Event**: Use `userEvent` over `fireEvent` where possible for more realistic interactions.
3.  **Accessibility**: Query by role (`getByRole`) and accessible names to ensure accessibility.
4.  **Async Handling**: Use `waitFor` and `async/await` for state updates and API responses.
5.  **Isolation**: Clear mocks (`vi.clearAllMocks()`) in `beforeEach` to prevent test pollution.
