import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import React from 'react';
import { NotificationProvider, useNotifications } from '../context/NotificationContext';

// ── Consumer component ────────────────────────────────────────────────────────
const Consumer = ({ onMount } = {}) => {
    const ctx = useNotifications();

    React.useEffect(() => {
        if (onMount) onMount(ctx);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div>
            <span data-testid="unread">{ctx.unreadCount}</span>
            <span data-testid="notif-count">{ctx.notifications.length}</span>
            <span data-testid="toast">{ctx.toast ? ctx.toast.type : 'none'}</span>
            <button data-testid="dismiss"    onClick={() => ctx.dismissToast()}>dismiss</button>
            <button data-testid="mark-read"  onClick={() => ctx.markAllRead()}>mark</button>
            <button data-testid="clear"      onClick={() => ctx.clearAll()}>clear</button>
            <button data-testid="goal-btn"   onClick={() => ctx.triggerGoalReminder(30, 15)}>goal</button>
            <button data-testid="milestone-btn" onClick={() => ctx.triggerMilestone('You finished 10 lessons!')}>milestone</button>
            <button data-testid="encourage-btn" onClick={() => ctx.triggerEncouragement('Amazing effort!')}>encourage</button>
            <button data-testid="pref-btn"   onClick={() => ctx.updateNotifPrefs({ goalReminders: false })}>pref</button>
        </div>
    );
};

const renderWithProvider = (ui = <Consumer />) =>
    render(<NotificationProvider>{ui}</NotificationProvider>);

// Helper: bypass the quiet-hours and MIN_GAP_MS throttle
// by mocking Date to midday and resetting lastNotifAt
const setMidday = () => {
    const now = new Date();
    now.setHours(12, 0, 0, 0);
    vi.setSystemTime(now);
};

// =============================================================================
describe('NotificationContext – Initial State', () => {

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        vi.useFakeTimers({ shouldAdvanceTime: true });
        setMidday();
    });

    afterEach(() => {
        vi.useRealTimers();
        localStorage.clear();
    });

    test('Should start with 0 notifications', () => {
        renderWithProvider();
        expect(screen.getByTestId('notif-count').textContent).toBe('0');
    });

    test('Should start with 0 unread count', () => {
        renderWithProvider();
        expect(screen.getByTestId('unread').textContent).toBe('0');
    });

    test('Should start with no active toast', () => {
        renderWithProvider();
        expect(screen.getByTestId('toast').textContent).toBe('none');
    });

    test('useNotifications should throw when used outside NotificationProvider', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const Bad = () => { useNotifications(); return null; };
        expect(() => render(<Bad />)).toThrow('useNotifications must be inside NotificationProvider');
        spy.mockRestore();
    });
});

// =============================================================================
describe('NotificationContext – triggerGoalReminder()', () => {

    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers({ shouldAdvanceTime: true });
        setMidday();
    });

    afterEach(() => {
        vi.useRealTimers();
        localStorage.clear();
    });

    test('Should add a goal notification when progress < 100%', async () => {
        renderWithProvider();
        act(() => { screen.getByTestId('goal-btn').click(); }); // 15/30 = 50%
        await waitFor(() => {
            expect(screen.getByTestId('notif-count').textContent).toBe('1');
        });
    });

    test('Goal notification should be of type "goal"', async () => {
        renderWithProvider();
        act(() => { screen.getByTestId('goal-btn').click(); });
        await waitFor(() => {
            expect(screen.getByTestId('toast').textContent).toBe('goal');
        });
    });

    test('Should set a toast for the goal notification', async () => {
        renderWithProvider();
        act(() => { screen.getByTestId('goal-btn').click(); });
        await waitFor(() => {
            expect(screen.getByTestId('toast').textContent).not.toBe('none');
        });
    });

    test('Should NOT add goal notification when goalReminders pref is false', async () => {
        renderWithProvider();
        act(() => { screen.getByTestId('pref-btn').click(); }); // disables goalReminders
        // advance MIN_GAP_MS so throttle resets
        act(() => { vi.advanceTimersByTime(6 * 60 * 1000); });
        act(() => { screen.getByTestId('goal-btn').click(); });
        await waitFor(() => {
            expect(screen.getByTestId('notif-count').textContent).toBe('0');
        });
    });

    test('Should increment unreadCount after goal notification', async () => {
        renderWithProvider();
        act(() => { screen.getByTestId('goal-btn').click(); });
        await waitFor(() => {
            expect(screen.getByTestId('unread').textContent).toBe('1');
        });
    });
});

// =============================================================================
describe('NotificationContext – triggerMilestone()', () => {

    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers({ shouldAdvanceTime: true });
        setMidday();
    });

    afterEach(() => {
        vi.useRealTimers();
        localStorage.clear();
    });

    test('Should add a milestone notification', async () => {
        renderWithProvider();
        act(() => { screen.getByTestId('milestone-btn').click(); });
        await waitFor(() => {
            expect(screen.getByTestId('notif-count').textContent).toBe('1');
        });
    });

    test('Milestone notification should be of type "milestone"', async () => {
        renderWithProvider();
        act(() => { screen.getByTestId('milestone-btn').click(); });
        await waitFor(() => {
            expect(screen.getByTestId('toast').textContent).toBe('milestone');
        });
    });

    test('Should NOT add milestone notification when milestoneAlerts pref is false', async () => {
        const DisabledMilestone = () => {
            const ctx = useNotifications();
            return (
                <div>
                    <span data-testid="count">{ctx.notifications.length}</span>
                    <button data-testid="off" onClick={() => ctx.updateNotifPrefs({ milestoneAlerts: false })}>off</button>
                    <button data-testid="ms"  onClick={() => ctx.triggerMilestone('msg')}>ms</button>
                </div>
            );
        };
        renderWithProvider(<DisabledMilestone />);
        act(() => { screen.getByTestId('off').click(); });
        act(() => { vi.advanceTimersByTime(6 * 60 * 1000); });
        act(() => { screen.getByTestId('ms').click(); });
        await waitFor(() => {
            expect(screen.getByTestId('count').textContent).toBe('0');
        });
    });
});

// =============================================================================
describe('NotificationContext – triggerEncouragement()', () => {

    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers({ shouldAdvanceTime: true });
        setMidday();
    });

    afterEach(() => {
        vi.useRealTimers();
        localStorage.clear();
    });

    test('Should add an encouragement notification', async () => {
        renderWithProvider();
        act(() => { screen.getByTestId('encourage-btn').click(); });
        await waitFor(() => {
            expect(screen.getByTestId('notif-count').textContent).toBe('1');
        });
    });

    test('Encouragement notification should be of type "encouragement"', async () => {
        renderWithProvider();
        act(() => { screen.getByTestId('encourage-btn').click(); });
        await waitFor(() => {
            expect(screen.getByTestId('toast').textContent).toBe('encouragement');
        });
    });
});

// =============================================================================
describe('NotificationContext – dismissToast()', () => {

    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers({ shouldAdvanceTime: true });
        setMidday();
    });

    afterEach(() => {
        vi.useRealTimers();
        localStorage.clear();
    });

    test('Should clear the toast when dismissToast is called', async () => {
        renderWithProvider();
        act(() => { screen.getByTestId('goal-btn').click(); });
        await waitFor(() => expect(screen.getByTestId('toast').textContent).not.toBe('none'));
        act(() => { screen.getByTestId('dismiss').click(); });
        await waitFor(() => {
            expect(screen.getByTestId('toast').textContent).toBe('none');
        });
    });

    test('Should keep notifications list intact after dismissing toast', async () => {
        renderWithProvider();
        act(() => { screen.getByTestId('goal-btn').click(); });
        await waitFor(() => expect(screen.getByTestId('notif-count').textContent).toBe('1'));
        act(() => { screen.getByTestId('dismiss').click(); });
        await waitFor(() => {
            expect(screen.getByTestId('notif-count').textContent).toBe('1');
        });
    });
});

// =============================================================================
describe('NotificationContext – markAllRead()', () => {

    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers({ shouldAdvanceTime: true });
        setMidday();
    });

    afterEach(() => {
        vi.useRealTimers();
        localStorage.clear();
    });

    test('Should set unreadCount to 0 after markAllRead', async () => {
        renderWithProvider();
        act(() => { screen.getByTestId('goal-btn').click(); });
        await waitFor(() => expect(screen.getByTestId('unread').textContent).toBe('1'));
        act(() => { screen.getByTestId('mark-read').click(); });
        await waitFor(() => {
            expect(screen.getByTestId('unread').textContent).toBe('0');
        });
    });

    test('Should keep notifications in the list after markAllRead', async () => {
        renderWithProvider();
        act(() => { screen.getByTestId('goal-btn').click(); });
        await waitFor(() => expect(screen.getByTestId('notif-count').textContent).toBe('1'));
        act(() => { screen.getByTestId('mark-read').click(); });
        await waitFor(() => {
            expect(screen.getByTestId('notif-count').textContent).toBe('1');
        });
    });
});

// =============================================================================
describe('NotificationContext – clearAll()', () => {

    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers({ shouldAdvanceTime: true });
        setMidday();
    });

    afterEach(() => {
        vi.useRealTimers();
        localStorage.clear();
    });

    test('Should remove all notifications after clearAll', async () => {
        renderWithProvider();
        act(() => { screen.getByTestId('goal-btn').click(); });
        await waitFor(() => expect(screen.getByTestId('notif-count').textContent).toBe('1'));
        act(() => { screen.getByTestId('clear').click(); });
        await waitFor(() => {
            expect(screen.getByTestId('notif-count').textContent).toBe('0');
        });
    });

    test('Should reset unreadCount to 0 after clearAll', async () => {
        renderWithProvider();
        act(() => { screen.getByTestId('goal-btn').click(); });
        await waitFor(() => expect(screen.getByTestId('unread').textContent).toBe('1'));
        act(() => { screen.getByTestId('clear').click(); });
        await waitFor(() => {
            expect(screen.getByTestId('unread').textContent).toBe('0');
        });
    });
});

// =============================================================================
describe('NotificationContext – Throttle (MIN_GAP_MS)', () => {

    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers({ shouldAdvanceTime: true });
        setMidday();
    });

    afterEach(() => {
        vi.useRealTimers();
        localStorage.clear();
    });

    test('Should NOT add a second notification fired within the 5-min throttle window', async () => {
        renderWithProvider();
        act(() => { screen.getByTestId('goal-btn').click(); });
        await waitFor(() => expect(screen.getByTestId('notif-count').textContent).toBe('1'));

        // Fire again immediately — still within 5-min gap
        act(() => { screen.getByTestId('goal-btn').click(); });
        await waitFor(() => {
            expect(screen.getByTestId('notif-count').textContent).toBe('1');
        });
    });

    test('Should allow a notification after the 5-min throttle window passes', async () => {
        renderWithProvider();
        act(() => { screen.getByTestId('goal-btn').click(); });
        await waitFor(() => expect(screen.getByTestId('notif-count').textContent).toBe('1'));

        // Advance past MIN_GAP_MS (5 min)
        act(() => { vi.advanceTimersByTime(6 * 60 * 1000); });
        act(() => { screen.getByTestId('goal-btn').click(); });
        await waitFor(() => {
            expect(screen.getByTestId('notif-count').textContent).toBe('2');
        });
    });
});

// =============================================================================
describe('NotificationContext – Quiet Hours', () => {

    afterEach(() => {
        vi.useRealTimers();
        localStorage.clear();
    });

    test('Should NOT push a notification during quiet hours (e.g. 11pm)', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const lateNight = new Date();
        lateNight.setHours(23, 0, 0, 0);
        vi.setSystemTime(lateNight);

        renderWithProvider();
        act(() => { screen.getByTestId('goal-btn').click(); });
        await waitFor(() => {
            expect(screen.getByTestId('notif-count').textContent).toBe('0');
        });
    });

    test('Should push a notification outside quiet hours (e.g. noon)', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        setMidday();

        renderWithProvider();
        act(() => { screen.getByTestId('goal-btn').click(); });
        await waitFor(() => {
            expect(screen.getByTestId('notif-count').textContent).toBe('1');
        });
    });
});

// =============================================================================
describe('NotificationContext – updateNotifPrefs()', () => {

    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers({ shouldAdvanceTime: true });
        setMidday();
    });

    afterEach(() => {
        vi.useRealTimers();
        localStorage.clear();
    });

    test('Should update a preference value', async () => {
        const PrefsTest = () => {
            const ctx = useNotifications();
            return (
                <div>
                    <span data-testid="goal-pref">{String(ctx.notifPrefs.goalReminders)}</span>
                    <button data-testid="btn" onClick={() => ctx.updateNotifPrefs({ goalReminders: false })}>go</button>
                </div>
            );
        };
        renderWithProvider(<PrefsTest />);
        act(() => { screen.getByTestId('btn').click(); });
        await waitFor(() => {
            expect(screen.getByTestId('goal-pref').textContent).toBe('false');
        });
    });

    test('Should persist updated prefs to localStorage', async () => {
        renderWithProvider();
        act(() => { screen.getByTestId('pref-btn').click(); });
        await waitFor(() => {
            const stored = JSON.parse(localStorage.getItem('linguaable_notif_prefs'));
            expect(stored.goalReminders).toBe(false);
        });
    });

    test('Should merge partial pref updates without losing other prefs', async () => {
        const MergeTest = () => {
            const ctx = useNotifications();
            return (
                <div>
                    <span data-testid="inactivity">{String(ctx.notifPrefs.inactivityReminders)}</span>
                    <span data-testid="goal">{String(ctx.notifPrefs.goalReminders)}</span>
                    <button data-testid="btn" onClick={() => ctx.updateNotifPrefs({ goalReminders: false })}>go</button>
                </div>
            );
        };
        renderWithProvider(<MergeTest />);
        act(() => { screen.getByTestId('btn').click(); });
        await waitFor(() => {
            expect(screen.getByTestId('goal').textContent).toBe('false');
            expect(screen.getByTestId('inactivity').textContent).toBe('true'); // unchanged
        });
    });

    test('Should restore prefs from localStorage on mount', async () => {
        localStorage.setItem('linguaable_notif_prefs', JSON.stringify({ ...{ inactivityReminders: true, breakReminders: true, goalReminders: false, milestoneAlerts: true, inactivityMinutes: 30, breakIntervalMinutes: 20, quietHoursStart: 22, quietHoursEnd: 8 } }));
        const PrefsTest = () => {
            const ctx = useNotifications();
            return <span data-testid="goal-pref">{String(ctx.notifPrefs.goalReminders)}</span>;
        };
        renderWithProvider(<PrefsTest />);
        await waitFor(() => {
            expect(screen.getByTestId('goal-pref').textContent).toBe('false');
        });
    });
});