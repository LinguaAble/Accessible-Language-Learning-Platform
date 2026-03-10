import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';

// ── Mock NotificationContext ──────────────────────────────────────────────────
const mockMarkAllRead = vi.fn();
const mockClearAll = vi.fn();
let mockNotifications = [];
let mockUnreadCount = 0;

vi.mock('../context/NotificationContext', () => ({
    useNotifications: () => ({
        notifications: mockNotifications,
        unreadCount: mockUnreadCount,
        markAllRead: mockMarkAllRead,
        clearAll: mockClearAll,
    }),
}));

// ── Helper ────────────────────────────────────────────────────────────────────
const renderBell = (props = {}) =>
    render(
        <BrowserRouter>
            <NotificationBell {...props} />
        </BrowserRouter>
    );

// ── Sample notification objects ───────────────────────────────────────────────
const makeNotification = (overrides = {}) => ({
    id: 'n1',
    type: 'goal',
    title: 'Daily Goal',
    message: 'You are halfway there!',
    timestamp: Date.now(),
    actionPath: '/lessons',
    actionLabel: 'Go to Lessons',
    ...overrides,
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('NotificationBell Component Tests', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockNotifications = [];
        mockUnreadCount = 0;
    });

    // ==================== RENDERING TESTS ====================
    describe('Rendering Tests', () => {

        test('Should render the bell button', () => {
            renderBell();
            const btn = screen.getByRole('button', { name: /notifications/i });
            expect(btn).toBeInTheDocument();
        });

        test('Should apply default btnClassName db-icon-btn', () => {
            renderBell();
            const btn = screen.getByRole('button', { name: /notifications/i });
            expect(btn).toHaveClass('db-icon-btn');
        });

        test('Should apply custom btnClassName when passed', () => {
            renderBell({ btnClassName: 'my-custom-btn' });
            const btn = screen.getByRole('button', { name: /notifications/i });
            expect(btn).toHaveClass('my-custom-btn');
        });

        test('Should NOT show badge when unreadCount is 0', () => {
            mockUnreadCount = 0;
            renderBell();
            expect(document.querySelector('._nb-badge')).not.toBeInTheDocument();
        });

        test('Should show badge with correct count when unreadCount > 0', () => {
            mockUnreadCount = 3;
            renderBell();
            const badge = document.querySelector('._nb-badge');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveTextContent('3');
        });

        test('Should show 9+ in badge when unreadCount exceeds 9', () => {
            mockUnreadCount = 15;
            renderBell();
            const badge = document.querySelector('._nb-badge');
            expect(badge).toHaveTextContent('9+');
        });

        test('Should include unread count in aria-label', () => {
            mockUnreadCount = 5;
            renderBell();
            const btn = screen.getByRole('button', { name: /5 unread/i });
            expect(btn).toBeInTheDocument();
        });

        test('Should NOT show panel on initial render', () => {
            renderBell();
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    // ==================== OPEN / CLOSE TESTS ====================
    describe('Open / Close Tests', () => {

        test('Should open notification panel when bell is clicked', async () => {
            const user = userEvent.setup();
            renderBell();

            await user.click(screen.getByRole('button', { name: /notifications/i }));

            expect(screen.getByRole('dialog', { name: /notifications/i })).toBeInTheDocument();
        });

        test('Should close notification panel when bell is clicked again', async () => {
            const user = userEvent.setup();
            renderBell();

            const btn = screen.getByRole('button', { name: /notifications/i });
            await user.click(btn); // open
            await user.click(btn); // close

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        test('Should close panel when clicking outside', async () => {
            const user = userEvent.setup();
            renderBell();

            await user.click(screen.getByRole('button', { name: /notifications/i }));
            expect(screen.getByRole('dialog')).toBeInTheDocument();

            await user.click(document.body);

            await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            });
        });

        test('Should call markAllRead when panel is opened', async () => {
            const user = userEvent.setup();
            renderBell();

            await user.click(screen.getByRole('button', { name: /notifications/i }));

            expect(mockMarkAllRead).toHaveBeenCalledTimes(1);
        });

        test('Should NOT call markAllRead when panel is closed', async () => {
            const user = userEvent.setup();
            renderBell();

            // open then close
            const btn = screen.getByRole('button', { name: /notifications/i });
            await user.click(btn);
            await user.click(btn);

            // markAllRead only on open, not on close
            expect(mockMarkAllRead).toHaveBeenCalledTimes(1);
        });
    });

    // ==================== EMPTY STATE TESTS ====================
    describe('Empty State Tests', () => {

        test('Should show empty message when no notifications', async () => {
            const user = userEvent.setup();
            mockNotifications = [];
            renderBell();

            await user.click(screen.getByRole('button', { name: /notifications/i }));

            expect(screen.getByText(/No notifications yet/i)).toBeInTheDocument();
        });

        test('Should NOT show Clear all button when notifications list is empty', async () => {
            const user = userEvent.setup();
            mockNotifications = [];
            renderBell();

            await user.click(screen.getByRole('button', { name: /notifications/i }));

            expect(screen.queryByRole('button', { name: /clear all/i })).not.toBeInTheDocument();
        });

        test('Should show panel header title when opened', async () => {
            const user = userEvent.setup();
            renderBell();

            await user.click(screen.getByRole('button', { name: /notifications/i }));

            expect(screen.getByText(/🔔 Notifications/i)).toBeInTheDocument();
        });
    });

    // ==================== NOTIFICATION ITEM TESTS ====================
    describe('Notification Item Tests', () => {

        test('Should render notification title and message', async () => {
            const user = userEvent.setup();
            mockNotifications = [makeNotification()];
            renderBell();

            await user.click(screen.getByRole('button', { name: /notifications/i }));

            expect(screen.getByText('Daily Goal')).toBeInTheDocument();
            expect(screen.getByText('You are halfway there!')).toBeInTheDocument();
        });

        test('Should render multiple notifications', async () => {
            const user = userEvent.setup();
            mockNotifications = [
                makeNotification({ id: 'n1', title: 'First Notification' }),
                makeNotification({ id: 'n2', title: 'Second Notification', type: 'milestone' }),
            ];
            renderBell();

            await user.click(screen.getByRole('button', { name: /notifications/i }));

            expect(screen.getByText('First Notification')).toBeInTheDocument();
            expect(screen.getByText('Second Notification')).toBeInTheDocument();
        });

        test('Should render action label button when actionPath and actionLabel exist', async () => {
            const user = userEvent.setup();
            mockNotifications = [makeNotification()];
            renderBell();

            await user.click(screen.getByRole('button', { name: /notifications/i }));

            expect(screen.getByText('Go to Lessons')).toBeInTheDocument();
        });

        test('Should NOT render action button when actionPath is missing', async () => {
            const user = userEvent.setup();
            mockNotifications = [makeNotification({ actionPath: undefined, actionLabel: undefined })];
            renderBell();

            await user.click(screen.getByRole('button', { name: /notifications/i }));

            expect(screen.queryByText('Go to Lessons')).not.toBeInTheDocument();
        });

        test('Should show timestamp as "just now" for recent notifications', async () => {
            const user = userEvent.setup();
            mockNotifications = [makeNotification({ timestamp: Date.now() })];
            renderBell();

            await user.click(screen.getByRole('button', { name: /notifications/i }));

            expect(screen.getByText('just now')).toBeInTheDocument();
        });

        test('Should show minutes ago for notifications older than 60 seconds', async () => {
            const user = userEvent.setup();
            mockNotifications = [makeNotification({ timestamp: Date.now() - 5 * 60 * 1000 })];
            renderBell();

            await user.click(screen.getByRole('button', { name: /notifications/i }));

            expect(screen.getByText('5m ago')).toBeInTheDocument();
        });

        test('Should close panel and navigate when action button is clicked', async () => {
            const user = userEvent.setup();
            mockNotifications = [makeNotification()];
            renderBell();

            await user.click(screen.getByRole('button', { name: /notifications/i }));
            await user.click(screen.getByText('Go to Lessons'));

            await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            });
        });
    });

    // ==================== NOTIFICATION TYPES TESTS ====================
    describe('Notification Type Tests', () => {

        const types = ['inactivity', 'break', 'goal', 'milestone', 'encouragement'];

        types.forEach(type => {
            test(`Should render ${type} notification without errors`, async () => {
                const user = userEvent.setup();
                mockNotifications = [makeNotification({ id: type, type, title: `${type} title` })];
                renderBell();

                await user.click(screen.getByRole('button', { name: /notifications/i }));

                expect(screen.getByText(`${type} title`)).toBeInTheDocument();
            });
        });

        test('Should render unknown type notification with fallback Bell icon', async () => {
            const user = userEvent.setup();
            mockNotifications = [makeNotification({ type: 'unknown_type', title: 'Unknown' })];
            renderBell();

            await user.click(screen.getByRole('button', { name: /notifications/i }));

            expect(screen.getByText('Unknown')).toBeInTheDocument();
        });
    });

    // ==================== CLEAR ALL TESTS ====================
    describe('Clear All Tests', () => {

        test('Should show Clear all button when notifications exist', async () => {
            const user = userEvent.setup();
            mockNotifications = [makeNotification()];
            renderBell();

            await user.click(screen.getByRole('button', { name: /notifications/i }));

            expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();
        });

        test('Should call clearAll when Clear all is clicked', async () => {
            const user = userEvent.setup();
            mockNotifications = [makeNotification()];
            renderBell();

            await user.click(screen.getByRole('button', { name: /notifications/i }));
            await user.click(screen.getByRole('button', { name: /clear all/i }));

            expect(mockClearAll).toHaveBeenCalledTimes(1);
        });
    });
});