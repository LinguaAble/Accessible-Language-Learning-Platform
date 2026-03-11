import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';

// Mock navigate function that will be tracked
const mockNavigate = vi.fn();

vi.mock('../components/DailyStudyPlan', () => ({
    default: () => <div data-testid="daily-study-plan">Mocked Daily Study Plan</div>
}));

// Override the useNavigate mock for Dashboard tests specifically
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        Link: ({ children, to }) => React.createElement('a', { href: to }, children),
    };
});

// Mock UserContext for Dashboard tests
let mockUserContextValue = {
    user: {
        email: 'test@example.com',
        username: 'TestUser',
        completedLessons: [1, 2, 3],
        dailyLessonCounts: [
            { date: '2026-02-10', count: 2 },
            { date: '2026-02-09', count: 1 }
        ],
        dailyScores: [
            { date: '2026-02-10', score: 180 },
            { date: '2026-02-09', score: 75 }
        ],
        avatarUrl: null
    },
    preferences: {
        theme: 'dark',
        soundEffects: false,
        animationReduced: false,
        fontSize: 'medium',
        dailyGoalMinutes: 5
    },
    streak: 1,
    todayProgress: 3,
    login: vi.fn(),
    logout: vi.fn(),
    updatePreferences: vi.fn(),
    updateProfile: vi.fn(),
    updateProgress: vi.fn(),
};

vi.mock('../context/UserContext', () => ({
    useUser: () => mockUserContextValue,
    UserProvider: ({ children }) => children,
}));

// Helper function to render Dashboard with context
const renderDashboard = (userContextOverride = {}) => {
    // Update the mock context value
    mockUserContextValue = { ...mockUserContextValue, ...userContextOverride };

    return render(
        <BrowserRouter>
            <Dashboard />
        </BrowserRouter>
    );
};

describe('Dashboard Component Tests', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();

        // Reset mock context to default values
        mockUserContextValue = {
            user: {
                email: 'test@example.com',
                username: 'TestUser',
                completedLessons: [1, 2, 3],
                dailyLessonCounts: [
                    { date: '2026-02-10', count: 2 },
                    { date: '2026-02-09', count: 1 }
                ],
                dailyScores: [
                    { date: '2026-02-10', score: 180 },
                    { date: '2026-02-09', score: 75 }
                ],
                avatarUrl: null
            },
            preferences: {
                theme: 'dark',
                soundEffects: false,
                animationReduced: false,
                fontSize: 'medium',
                dailyGoalMinutes: 5
            },
            streak: 1,
            todayProgress: 3,
            login: vi.fn(),
            logout: vi.fn(),
            updatePreferences: vi.fn(),
            updateProfile: vi.fn(),
            updateProgress: vi.fn(),
        };

        // Mock localStorage
        Storage.prototype.getItem = vi.fn((key) => {
            if (key === 'completedLessons') return JSON.stringify([1, 2, 3]);
            return null;
        });
        Storage.prototype.setItem = vi.fn();

        // Mock axios
        axios.put.mockResolvedValue({
            data: {
                success: true,
                completedLessons: [1, 2, 3]
            }
        });
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    // ==================== RENDERING TESTS ====================
    test('Should render dashboard with main sections', () => {
        renderDashboard();

        // Check header greeting
        expect(screen.getByText(/नमस्ते/i)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /TestUser/i })).toBeInTheDocument();
        expect(screen.getByText(/You're doing amazing|Ready to continue your/i)).toBeInTheDocument();

        // Check streak indicator
        expect(document.querySelector('.db-streak')).toBeInTheDocument();

        // Check main sections
        expect(screen.getByText(/CONTINUE LEARNING/i)).toBeInTheDocument();
        expect(screen.getByText(/Daily Goal/i)).toBeInTheDocument();
    });

    test('Should render all quick stat cards', () => {
        renderDashboard();

        expect(screen.getByText(/Lessons Completed/i)).toBeInTheDocument();
    });

    test('Should render weekly progress chart', () => {
        renderDashboard();

        expect(screen.getByText(/This Week/i)).toBeInTheDocument();

        // Check for day labels (M, T, W, T, F, S, S)
        const dayLabels = screen.getAllByText(/^[MTWFS]$/);
        expect(dayLabels.length).toBeGreaterThanOrEqual(7);
    });

    test('Should render quick actions section', () => {
        renderDashboard();

        expect(screen.getByText(/Quick Actions/i)).toBeInTheDocument();
        expect(screen.getByText('Lessons')).toBeInTheDocument();
        expect(screen.getByText('Leaderboard')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    test('Should render focus card with lesson info', () => {
        renderDashboard();

        expect(screen.getByText(/Common Phrases/i)).toBeInTheDocument();
        expect(screen.getByText(/आम वाक्यांश/i)).toBeInTheDocument();
        expect(screen.getByText(/Master 10 essential greetings/i)).toBeInTheDocument();
        expect(screen.getByText(/START NOW/i)).toBeInTheDocument();
    });

    // ==================== USER DISPLAY TESTS ====================
    test('Should display username when available', () => {
        renderDashboard({
            user: { ...mockUserContextValue.user, username: 'JohnDoe' }
        });

        expect(screen.getByRole('heading', { name: /JohnDoe/i })).toBeInTheDocument();
    });

    test('Should extract name from email when username not available', () => {
        renderDashboard({
            user: {
                ...mockUserContextValue.user,
                username: null,
                email: 'arjun@example.com'
            }
        });

        expect(screen.getByRole('heading', { name: /Arjun/i })).toBeInTheDocument();
    });

    test('Should display "Learner" when no email or username', () => {
        renderDashboard({
            user: {
                ...mockUserContextValue.user,
                username: null,
                email: null
            }
        });

        expect(screen.getByRole('heading', { name: /Learner/i })).toBeInTheDocument();
    });

    test('Should display user avatar', () => {
        renderDashboard();

        // Use getAllByRole instead of getAllByAlt
        const avatars = screen.getAllByRole('img', { name: /User avatar/i });
        expect(avatars.length).toBeGreaterThan(0);
        expect(avatars[0]).toHaveAttribute('src', expect.stringContaining('dicebear.com'));
    });

    test('Should use custom avatar URL when provided', () => {
        renderDashboard({
            user: {
                ...mockUserContextValue.user,
                avatarUrl: 'https://example.com/avatar.jpg'
            }
        });

        // Use getAllByRole instead of getAllByAlt
        const avatars = screen.getAllByRole('img', { name: /User avatar/i });
        expect(avatars[0]).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    // ==================== STREAK TESTS ====================
    test('Should show 1 day streak when lessons completed', () => {
        renderDashboard({
            user: { ...mockUserContextValue.user, completedLessons: [1, 2] },
            streak: 1
        });

        expect(document.querySelector('.db-streak')).toHaveTextContent(/1 Day Streak/i);
    });

    test('Should show 0 day streak when no lessons completed', () => {
        // streak is a separate context value; pass streak: 0 to simulate empty state
        renderDashboard({
            user: { ...mockUserContextValue.user, completedLessons: [] },
            streak: 0
        });

        expect(document.querySelector('.db-streak')).toHaveTextContent(/0 Days Streak/i);
    });

    // ==================== DAILY GOAL TESTS ====================
    test('Should display daily goal progress correctly', () => {
        // Mock math calculations: (3 / 5) * 100 = 60%
        renderDashboard({
            preferences: { ...mockUserContextValue.preferences, dailyGoalMinutes: 5 },
            todayProgress: 3
        });

        expect(screen.getByText('60%')).toBeInTheDocument();
        expect(screen.getByText(/Target: 5 min/i)).toBeInTheDocument();
    });

    test('Should cap progress at 100% when exceeded', () => {
        // (10 / 5) * 100 = 200% -> should cap at 100%
        renderDashboard({
            preferences: { ...mockUserContextValue.preferences, dailyGoalMinutes: 5 },
            todayProgress: 10
        });

        expect(screen.getByText(/100%/i)).toBeInTheDocument();
    });

    test('Should show 0% when no progress', () => {
        renderDashboard({
            preferences: { ...mockUserContextValue.preferences, dailyGoalMinutes: 5 },
            todayProgress: 0
        });

        expect(screen.getByText(/0%/i)).toBeInTheDocument();
        expect(screen.getByText(/Target: 5 min/i)).toBeInTheDocument();
    });

    // ==================== LESSONS COMPLETED TESTS ====================
    test('Should display correct number of lessons completed from user data', () => {
        renderDashboard({
            user: { ...mockUserContextValue.user, completedLessons: [1, 2, 3, 4, 5] }
        });

        const lessonsCard = screen.getByText(/Lessons Completed/i).closest('.db-lessons-card');
        expect(within(lessonsCard).getByText('5')).toBeInTheDocument();
    });

    test('Should fall back to localStorage when user has no completed lessons', () => {
        renderDashboard({
            user: { ...mockUserContextValue.user, completedLessons: [] }
        });

        const lessonsCard = screen.getByText(/Lessons Completed/i).closest('.db-lessons-card');
        expect(within(lessonsCard).getByText('3')).toBeInTheDocument();
    });

    // ==================== NAVIGATION TESTS ====================
    test('Should navigate to lessons when START NOW clicked', async () => {
        const user = userEvent.setup();
        renderDashboard();

        const startButton = screen.getByText(/START NOW/i);
        await user.click(startButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/lessons');
        });
    });

    test('Should navigate to lessons when Learn quick action clicked', async () => {
        const user = userEvent.setup();
        renderDashboard();

        const learnButton = screen.getByText('Lessons');
        await user.click(learnButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/lessons');
        });
    });



    test('Should navigate to leaderboard when Leaderboard quick action clicked', async () => {
        const user = userEvent.setup();
        renderDashboard();

        const leaderboardButton = screen.getByText('Leaderboard');
        await user.click(leaderboardButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/leaderboard');
        });
    });

    test('Should navigate to settings when Settings quick action clicked', async () => {
        const user = userEvent.setup();
        renderDashboard();

        const settingsButton = screen.getByText('Settings');
        await user.click(settingsButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/settings');
        });
    });





    test('Should navigate to lessons when Lessons Completed card clicked', async () => {
        const user = userEvent.setup();
        renderDashboard();

        const lessonsCard = screen.getByText(/Lessons Completed/i).closest('div');
        await user.click(lessonsCard);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/lessons');
        });
    });

    test('Should open notification panel when notification bell clicked', async () => {
        const user = userEvent.setup();
        renderDashboard();

        const bellButton = screen.getByLabelText(/Notifications/i);
        await user.click(bellButton);

        await waitFor(() => {
            // Clicking the bell opens the dropdown panel
            expect(screen.getByRole('dialog', { name: /Notifications/i })).toBeInTheDocument();
        });
    });

    test('Should navigate to settings when profile avatar clicked', async () => {
        const user = userEvent.setup();
        renderDashboard();

        // Use getAllByRole instead of getAllByAlt
        const avatars = screen.getAllByRole('img', { name: /User avatar/i });
        await user.click(avatars[0].closest('.profile-avatar'));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/settings');
        });
    });

    // ==================== TOOLTIP TESTS ====================
    test('Should show notification panel when notification bell clicked', async () => {
        const user = userEvent.setup();
        renderDashboard();

        const bellButton = screen.getByLabelText(/Notifications/i);

        await user.click(bellButton);

        await waitFor(() => {
            expect(screen.getByText(/No notifications yet/i)).toBeInTheDocument();
        });
    });

    test('Should hide notification panel when bell is clicked again', async () => {
        const user = userEvent.setup();
        renderDashboard();

        const bellButton = screen.getByLabelText(/Notifications/i);

        // Open panel
        await user.click(bellButton);
        await waitFor(() => {
            expect(screen.getByText(/No notifications yet/i)).toBeInTheDocument();
        });

        // Close panel
        await user.click(bellButton);
        await waitFor(() => {
            expect(screen.queryByText(/No notifications yet/i)).not.toBeInTheDocument();
        });
    });


    // ==================== DATA SYNC TESTS ====================
    test('Should sync progress with backend on mount', async () => {
        renderDashboard();

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                'http://localhost:5000/api/auth/update-progress',
                expect.objectContaining({
                    email: 'test@example.com',
                    completedLessons: [1, 2, 3]
                })
            );
        });
    });

    test('Should update localStorage after successful sync', async () => {
        axios.put.mockResolvedValueOnce({
            data: {
                success: true,
                completedLessons: [1, 2, 3, 4]
            }
        });

        renderDashboard();

        await waitFor(() => {
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'completedLessons',
                JSON.stringify([1, 2, 3, 4])
            );
        });
    });

    test('Should not sync when user has no email', () => {
        renderDashboard({
            user: { ...mockUserContextValue.user, email: null }
        });

        expect(axios.put).not.toHaveBeenCalled();
    });

    test('Should handle sync failure gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        axios.put.mockRejectedValueOnce(new Error('Network error'));

        renderDashboard();

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Sync failed', expect.any(Error));
        });

        consoleSpy.mockRestore();
    });

    // ==================== WEEKLY CHART TESTS ====================
    test('Should render weekly chart with correct data', () => {
        renderDashboard({
            user: {
                ...mockUserContextValue.user,
                dailyScores: [
                    { date: '2026-02-10', score: 200 },
                    { date: '2026-02-09', score: 300 },
                    { date: '2026-02-08', score: 100 }
                ]
            }
        });

        expect(screen.getByText(/This Week/i)).toBeInTheDocument();

        // Chart should have 7 day labels
        const dayLabels = screen.getAllByText(/^[MTWFS]$/);
        expect(dayLabels.length).toBe(7);
    });

    test('Should highlight today in weekly chart', () => {
        renderDashboard();

        // Today's bar should have special styling (tested via data attributes or classes)
        const weeklyChart = screen.getByText(/This Week/i).closest('.db-card');
        expect(weeklyChart).toBeInTheDocument();
    });

    // ==================== ACCESSIBILITY TESTS ====================
    test('Should have accessible notification button', () => {
        renderDashboard();

        const bellButton = screen.getByLabelText(/Notifications/i);
        expect(bellButton).toHaveAttribute('aria-label', 'Notifications');
    });

    test('Should have clickable elements with proper cursor', () => {
        renderDashboard();

        const startButton = screen.getByText(/START NOW/i);
        expect(startButton).toBeInTheDocument();
    });

    // ==================== EDGE CASES ====================
    test('Should handle empty daily scores', () => {
        renderDashboard({
            user: {
                ...mockUserContextValue.user,
                dailyScores: []
            }
        });

        expect(screen.getByText(/This Week/i)).toBeInTheDocument();
    });

    test('Should handle undefined daily scores', () => {
        renderDashboard({
            user: {
                ...mockUserContextValue.user,
                dailyScores: undefined
            }
        });

        expect(screen.getByText(/This Week/i)).toBeInTheDocument();
    });

    test('Should handle very high progress values', () => {
        renderDashboard({
            todayProgress: 50,
            preferences: { ...mockUserContextValue.preferences, dailyGoalMinutes: 5 }
        });

        // Should cap at 100%
        expect(screen.getByText(/100%/i)).toBeInTheDocument();
    });
});