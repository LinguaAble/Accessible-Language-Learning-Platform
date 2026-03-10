import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import NotificationToast from '../components/NotificationToast';

// ── Mock NotificationContext ──────────────────────────────────────────────────
const mockDismissToast = vi.fn();
let mockToast = null;

vi.mock('../context/NotificationContext', () => ({
    useNotifications: () => ({
        toast: mockToast,
        dismissToast: mockDismissToast,
    }),
}));

// ── Helper ────────────────────────────────────────────────────────────────────
const renderToast = () =>
    render(
        <BrowserRouter>
            <NotificationToast />
        </BrowserRouter>
    );

const makeToast = (overrides = {}) => ({
    type: 'goal',
    title: 'Keep Going!',
    message: 'You are close to your daily goal.',
    actionPath: '/lessons',
    actionLabel: 'Start Lesson',
    ...overrides,
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('NotificationToast Component Tests', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        mockToast = null;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // ==================== NULL STATE TESTS ====================
    describe('Null / Hidden State', () => {

        test('Should render nothing when toast is null', () => {
            mockToast = null;
            renderToast();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        test('Should render nothing when toast is undefined', () => {
            mockToast = undefined;
            renderToast();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });

    // ==================== RENDERING TESTS ====================
    describe('Rendering Tests', () => {

        test('Should render toast when toast object exists', () => {
            mockToast = makeToast();
            renderToast();
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });

        test('Should display toast title', () => {
            mockToast = makeToast({ title: 'Great Progress!' });
            renderToast();
            expect(screen.getByText('Great Progress!')).toBeInTheDocument();
        });

        test('Should display toast message', () => {
            mockToast = makeToast({ message: 'You completed 3 lessons today.' });
            renderToast();
            expect(screen.getByText('You completed 3 lessons today.')).toBeInTheDocument();
        });

        test('Should render dismiss (X) button', () => {
            mockToast = makeToast();
            renderToast();
            expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
        });

        test('Should render action button when actionLabel exists', () => {
            mockToast = makeToast({ actionLabel: 'Start Lesson' });
            renderToast();
            expect(screen.getByRole('button', { name: /start lesson/i })).toBeInTheDocument();
        });

        test('Should NOT render action button when actionLabel is missing', () => {
            mockToast = makeToast({ actionLabel: undefined });
            renderToast();
            expect(screen.queryByRole('button', { name: /start lesson/i })).not.toBeInTheDocument();
        });

        test('Should have aria role="alert" for accessibility', () => {
            mockToast = makeToast();
            renderToast();
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });

        test('Should have aria-live="polite" attribute', () => {
            mockToast = makeToast();
            renderToast();
            expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
        });
    });

    // ==================== EMOJI / TYPE TESTS ====================
    describe('Emoji and Type Tests', () => {

        const typeEmojiMap = [
            { type: 'inactivity', emoji: '👋' },
            { type: 'break', emoji: '☕' },
            { type: 'goal', emoji: '🎯' },
            { type: 'milestone', emoji: '🏆' },
            { type: 'encouragement', emoji: '⭐' },
        ];

        typeEmojiMap.forEach(({ type, emoji }) => {
            test(`Should show ${emoji} emoji for type "${type}"`, () => {
                mockToast = makeToast({ type });
                renderToast();
                expect(screen.getByText(emoji)).toBeInTheDocument();
            });
        });

        test('Should show 🔔 fallback emoji for unknown type', () => {
            mockToast = makeToast({ type: 'unknown_type' });
            renderToast();
            expect(screen.getByText('🔔')).toBeInTheDocument();
        });
    });

    // ==================== DISMISS TESTS ====================
    describe('Dismiss Tests', () => {

        test('Should call dismissToast when X button is clicked', () => {
            mockToast = makeToast();
            renderToast();

            fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));

            expect(mockDismissToast).toHaveBeenCalledTimes(1);
        });

        test('Should auto-dismiss after 6 seconds', () => {
            mockToast = makeToast();
            renderToast();

            act(() => {
                vi.advanceTimersByTime(6000);
            });

            expect(mockDismissToast).toHaveBeenCalledTimes(1);
        });

        test('Should NOT auto-dismiss before 6 seconds', () => {
            mockToast = makeToast();
            renderToast();

            act(() => {
                vi.advanceTimersByTime(5000);
            });

            expect(mockDismissToast).not.toHaveBeenCalled();
        });

        test('Should reset timer when a new toast appears', () => {
            mockToast = makeToast({ title: 'First Toast' });
            const { rerender } = render(
                <BrowserRouter><NotificationToast /></BrowserRouter>
            );

            act(() => { vi.advanceTimersByTime(3000); });
            expect(mockDismissToast).not.toHaveBeenCalled();

            // New toast arrives
            mockToast = makeToast({ title: 'Second Toast' });
            rerender(<BrowserRouter><NotificationToast /></BrowserRouter>);

            // Advance another 6s from the new toast
            act(() => { vi.advanceTimersByTime(6000); });
            expect(mockDismissToast).toHaveBeenCalledTimes(1);
        });
    });

    // ==================== ACTION BUTTON TESTS ====================
    describe('Action Button Tests', () => {

        test('Should call dismissToast when action button is clicked', () => {
            mockToast = makeToast({ actionLabel: 'Go Now', actionPath: '/lessons' });
            renderToast();

            fireEvent.click(screen.getByRole('button', { name: /go now/i }));

            expect(mockDismissToast).toHaveBeenCalledTimes(1);
        });

        test('Should render progress bar element', () => {
            mockToast = makeToast();
            renderToast();
            const bar = document.querySelector('._toast-bar');
            expect(bar).toBeInTheDocument();
        });

        test('Should render toast wrapper with correct class', () => {
            mockToast = makeToast();
            renderToast();
            const wrap = document.querySelector('._toast-wrap');
            expect(wrap).toBeInTheDocument();
        });
    });

    // ==================== CONTENT VERIFICATION TESTS ====================
    describe('Content Verification Tests', () => {

        test('Should display title inside _toast-title element', () => {
            mockToast = makeToast({ title: 'Milestone Reached!' });
            renderToast();
            const titleEl = document.querySelector('._toast-title');
            expect(titleEl).toBeInTheDocument();
            expect(titleEl).toHaveTextContent('Milestone Reached!');
        });

        test('Should display message inside _toast-msg element', () => {
            mockToast = makeToast({ message: 'You finished 10 lessons!' });
            renderToast();
            const msgEl = document.querySelector('._toast-msg');
            expect(msgEl).toBeInTheDocument();
            expect(msgEl).toHaveTextContent('You finished 10 lessons!');
        });

        test('Should render toast row wrapper', () => {
            mockToast = makeToast();
            renderToast();
            expect(document.querySelector('._toast-row')).toBeInTheDocument();
        });

        test('Should render emoji inside _toast-emoji span', () => {
            mockToast = makeToast({ type: 'break' });
            renderToast();
            const emojiEl = document.querySelector('._toast-emoji');
            expect(emojiEl).toBeInTheDocument();
            expect(emojiEl).toHaveTextContent('☕');
        });
    });
});