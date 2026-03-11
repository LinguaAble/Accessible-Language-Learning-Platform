import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import React from 'react';

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// Mock scrollIntoView – not supported by jsdom
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock axios
vi.mock('axios');

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),
        Link: ({ children, to }) => React.createElement('a', { href: to }, children),
    };
});

// Mock UserContext
vi.mock('../context/UserContext', () => ({
    useUser: () => ({
        user: {},
        login: vi.fn(),
        logout: vi.fn(),
        streak: 0,
        preferences: {
            theme: 'dark',
            soundEffects: false,
            animationReduced: false,
            fontSize: 'medium',
            dailyGoalMinutes: 5
        },
        todayProgress: 0,
        updatePreferences: vi.fn(),
        updateProfile: vi.fn(),
        updateProgress: vi.fn(),
    }),
    UserProvider: ({ children }) => children,
}));

// Mock NotificationContext
vi.mock('../context/NotificationContext', () => ({
    useNotifications: () => ({
        notifications: [],
        toast: null,
        unreadCount: 0,
        notifPrefs: {
            inactivityReminders: true,
            breakReminders: true,
            goalReminders: true,
            milestoneAlerts: true,
            inactivityMinutes: 30,
            breakIntervalMinutes: 20,
            quietHoursStart: 22,
            quietHoursEnd: 8,
        },
        dismissToast: vi.fn(),
        markAllRead: vi.fn(),
        clearAll: vi.fn(),
        updateNotifPrefs: vi.fn(),
        startStudySession: vi.fn(),
        endStudySession: vi.fn(),
        triggerGoalReminder: vi.fn(),
        triggerMilestone: vi.fn(),
        triggerEncouragement: vi.fn(),
    }),
    NotificationProvider: ({ children }) => children,
}));

// Mock Google OAuth
vi.mock('@react-oauth/google', () => ({
    GoogleLogin: ({ onSuccess }) =>
        React.createElement('button', {
            onClick: () => onSuccess({ credential: 'mock-google-token' })
        }, 'Sign in with Google'),
}));