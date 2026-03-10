import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import Leaderboard from '../pages/Leaderboard';

// ── Mock CSS ──────────────────────────────────────────────────────────────────
vi.mock('../Dashboard.css', () => ({}));

// ── Mock axios ────────────────────────────────────────────────────────────────
vi.mock('axios');

// ── Mock navigate ─────────────────────────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

// ── Mock UserContext ──────────────────────────────────────────────────────────
vi.mock('../context/UserContext', () => ({
    useUser: () => ({
        user: {
            email: 'me@example.com',
            username: 'myuser',
            avatarUrl: '',
        },
        streak: 5,
    }),
}));

// ── Data helpers ──────────────────────────────────────────────────────────────
const makeEntry = (overrides = {}) => ({
    email: 'player1@example.com',
    username: 'player1',
    avatarUrl: '',
    weeklyScore: 500,
    completedLessons: 10,
    rank: 1,
    ...overrides,
});

const makeLeaderboardResponse = (entries) => ({
    data: {
        success: true,
        leaderboard: entries,
        weekStart: 'Mon Jan 01',
        weekEnd: 'Sun Jan 07',
    },
});

// ── Render helper ─────────────────────────────────────────────────────────────
const renderLeaderboard = () =>
    render(
        <MemoryRouter>
            <Leaderboard />
        </MemoryRouter>
    );

// =============================================================================
describe('Leaderboard – Loading State', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
    });

    test('Should show loading spinner text while fetching', () => {
        axios.get.mockReturnValue(new Promise(() => {}));
        renderLeaderboard();
        expect(screen.getByText(/Loading rankings/i)).toBeInTheDocument();
    });

    test('Should call the leaderboard API on mount', async () => {
        axios.get.mockResolvedValueOnce(makeLeaderboardResponse([]));
        renderLeaderboard();
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('/api/auth/leaderboard')
            );
        });
    });

    test('Should hide loading text after data loads', async () => {
        axios.get.mockResolvedValueOnce(makeLeaderboardResponse([]));
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.queryByText(/Loading rankings/i)).not.toBeInTheDocument();
        });
    });
});

// =============================================================================
describe('Leaderboard – Header', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
        axios.get.mockResolvedValue(makeLeaderboardResponse([]));
    });

    test('Should render "Leaderboard" heading', async () => {
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /Leaderboard/i })).toBeInTheDocument();
        });
    });

    test('Should render the subtitle "Weekly rankings"', async () => {
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByText(/Weekly rankings/i)).toBeInTheDocument();
        });
    });

    test('Should display the streak count from context', async () => {
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByText(/5 Days Streak/i)).toBeInTheDocument();
        });
    });

    test('Should render the refresh button', async () => {
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByTitle(/Refresh leaderboard/i)).toBeInTheDocument();
        });
    });

    test('Should render the notifications icon button', async () => {
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByLabelText(/Notifications/i)).toBeInTheDocument();
        });
    });

    test('Should navigate to /settings when notifications button is clicked', async () => {
        const user = userEvent.setup();
        renderLeaderboard();
        await waitFor(() => expect(screen.getByLabelText(/Notifications/i)).toBeInTheDocument());
        await user.click(screen.getByLabelText(/Notifications/i));
        expect(mockNavigate).toHaveBeenCalledWith('/settings');
    });

    test('Should render the week date range', async () => {
        axios.get.mockResolvedValueOnce(makeLeaderboardResponse([]));
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByText(/Mon Jan 01/i)).toBeInTheDocument();
        });
    });
});

// =============================================================================
describe('Leaderboard – Error State', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
    });

    test('Should show error message when API fails', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network error'));
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByText(/Could not load the leaderboard/i)).toBeInTheDocument();
        });
    });

    test('Should show "Try Again" button on error', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network error'));
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
        });
    });

    test('Should retry the API call when "Try Again" is clicked', async () => {
        axios.get
            .mockRejectedValueOnce(new Error('Network error'))
            .mockResolvedValueOnce(makeLeaderboardResponse([]));

        const user = userEvent.setup();
        renderLeaderboard();

        await waitFor(() => expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument());
        await user.click(screen.getByRole('button', { name: /Try Again/i }));

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledTimes(2);
        });
    });

    test('Should clear error after successful retry', async () => {
        axios.get
            .mockRejectedValueOnce(new Error('Network error'))
            .mockResolvedValueOnce(makeLeaderboardResponse([]));

        const user = userEvent.setup();
        renderLeaderboard();

        await waitFor(() => expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument());
        await user.click(screen.getByRole('button', { name: /Try Again/i }));

        await waitFor(() => {
            expect(screen.queryByText(/Could not load the leaderboard/i)).not.toBeInTheDocument();
        });
    });
});

// =============================================================================
describe('Leaderboard – Empty State', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
        axios.get.mockResolvedValue(makeLeaderboardResponse([]));
    });

    test('Should show "No players yet!" when leaderboard is empty', async () => {
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByText(/No players yet!/i)).toBeInTheDocument();
        });
    });

    test('Should show prompt to complete a lesson in empty state', async () => {
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByText(/Complete a lesson to appear on the leaderboard/i)).toBeInTheDocument();
        });
    });

    test('Should NOT render the podium in empty state', async () => {
        renderLeaderboard();
        await waitFor(() => expect(screen.getByText(/No players yet!/i)).toBeInTheDocument());
        expect(document.querySelector('.lb-podium-area')).not.toBeInTheDocument();
    });
});

// =============================================================================
describe('Leaderboard – Top 3 Podium', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
    });

    const top3Entries = [
        makeEntry({ rank: 1, username: 'gold', email: 'gold@example.com', weeklyScore: 1000 }),
        makeEntry({ rank: 2, username: 'silver', email: 'silver@example.com', weeklyScore: 800 }),
        makeEntry({ rank: 3, username: 'bronze', email: 'bronze@example.com', weeklyScore: 600 }),
    ];

    test('Should render the podium area when top 3 exist', async () => {
        axios.get.mockResolvedValueOnce(makeLeaderboardResponse(top3Entries));
        renderLeaderboard();
        await waitFor(() => {
            expect(document.querySelector('.lb-podium-area')).toBeInTheDocument();
        });
    });

    test('Should show "Top Performers" label above podium', async () => {
        axios.get.mockResolvedValueOnce(makeLeaderboardResponse(top3Entries));
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByText(/Top Performers/i)).toBeInTheDocument();
        });
    });

    test('Should display rank-1 username in podium', async () => {
        axios.get.mockResolvedValueOnce(makeLeaderboardResponse(top3Entries));
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByText('gold')).toBeInTheDocument();
        });
    });

    test('Should display rank-2 username in podium', async () => {
        axios.get.mockResolvedValueOnce(makeLeaderboardResponse(top3Entries));
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByText('silver')).toBeInTheDocument();
        });
    });

    test('Should display rank-3 username in podium', async () => {
        axios.get.mockResolvedValueOnce(makeLeaderboardResponse(top3Entries));
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByText('bronze')).toBeInTheDocument();
        });
    });

    test('Should display rank-1 score as formatted pts', async () => {
        axios.get.mockResolvedValueOnce(makeLeaderboardResponse(top3Entries));
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByText('1,000 pts')).toBeInTheDocument();
        });
    });

    test('Should show "—" for a podium entry with 0 weekly score', async () => {
        const entries = [
            makeEntry({ rank: 1, username: 'zero', email: 'zero@example.com', weeklyScore: 0 }),
        ];
        axios.get.mockResolvedValueOnce(makeLeaderboardResponse(entries));
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByText('—')).toBeInTheDocument();
        });
    });

    test('Should show "(You)" next to current user in podium', async () => {
        const entries = [
            makeEntry({ rank: 1, username: 'myuser', email: 'me@example.com', weeklyScore: 999 }),
            makeEntry({ rank: 2, username: 'other', email: 'other@example.com', weeklyScore: 500 }),
        ];
        axios.get.mockResolvedValueOnce(makeLeaderboardResponse(entries));
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByText(/myuser \(You\)/i)).toBeInTheDocument();
        });
    });

    test('Should render three podium cards for a full top-3', async () => {
        axios.get.mockResolvedValueOnce(makeLeaderboardResponse(top3Entries));
        renderLeaderboard();
        await waitFor(() => {
            // Each podium card renders a lb-pedestal div
            expect(document.querySelectorAll('.lb-pedestal').length).toBe(3);
        });
    });
});

// =============================================================================
describe('Leaderboard – Ranked List (4th+)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
    });

    const entries7 = [
        makeEntry({ rank: 1, username: 'p1', email: 'p1@x.com', weeklyScore: 900 }),
        makeEntry({ rank: 2, username: 'p2', email: 'p2@x.com', weeklyScore: 800 }),
        makeEntry({ rank: 3, username: 'p3', email: 'p3@x.com', weeklyScore: 700 }),
        makeEntry({ rank: 4, username: 'p4', email: 'p4@x.com', weeklyScore: 600, completedLessons: 8 }),
        makeEntry({ rank: 5, username: 'p5', email: 'p5@x.com', weeklyScore: 500, completedLessons: 6 }),
        makeEntry({ rank: 6, username: 'p6', email: 'p6@x.com', weeklyScore: 400, completedLessons: 4 }),
        makeEntry({ rank: 7, username: 'myuser', email: 'me@example.com', weeklyScore: 300, completedLessons: 2 }),
    ];

    test('Should render lb-row elements for 4th place and beyond', async () => {
        axios.get.mockResolvedValueOnce(makeLeaderboardResponse(entries7));
        renderLeaderboard();
        await waitFor(() => {
            expect(document.querySelectorAll('.lb-row').length).toBe(4); // ranks 4-7
        });
    });

    test('Should display the PLAYER column header', async () => {
        axios.get.mockResolvedValueOnce(makeLeaderboardResponse(entries7));
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByText('PLAYER')).toBeInTheDocument();
        });
    });

    test('Should display the LESSONS column header', async () => {
        axios.get.mockResolvedValueOnce(makeLeaderboardResponse(entries7));
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByText('LESSONS')).toBeInTheDocument();
        });
    });

    test('Should display the SCORE column header', async () => {
        axios.get.mockResolvedValueOnce(makeLeaderboardResponse(entries7));
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByText('SCORE')).toBeInTheDocument();
        });
    });

    test('Should display the username of a 4th-place entry in the list', async () => {
        axios.get.mockResolvedValueOnce(makeLeaderboardResponse(entries7));
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByText('p4')).toBeInTheDocument();
        });
    });

    test('Should show lessons count for a ranked-list entry', async () => {
        axios.get.mockResolvedValueOnce(makeLeaderboardResponse(entries7));
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByText('8 lessons')).toBeInTheDocument();
        });
    });

    test('Should show "(You)" next to current user in ranked list', async () => {
        axios.get.mockResolvedValueOnce(makeLeaderboardResponse(entries7));
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByText(/myuser \(You\)/i)).toBeInTheDocument();
        });
    });

    test('Should show "—" for a ranked-list entry with 0 weekly score', async () => {
        const entries = [
            makeEntry({ rank: 1, username: 'p1', email: 'p1@x.com', weeklyScore: 500 }),
            makeEntry({ rank: 2, username: 'p2', email: 'p2@x.com', weeklyScore: 400 }),
            makeEntry({ rank: 3, username: 'p3', email: 'p3@x.com', weeklyScore: 300 }),
            makeEntry({ rank: 4, username: 'p4', email: 'p4@x.com', weeklyScore: 0 }),
        ];
        axios.get.mockResolvedValueOnce(makeLeaderboardResponse(entries));
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByText('—')).toBeInTheDocument();
        });
    });
});

// =============================================================================
describe('Leaderboard – "Your Rank" Banner', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
    });

    test('Should show "Your rank" banner when current user is outside top 3', async () => {
        const entries = [
            makeEntry({ rank: 1, username: 'p1', email: 'p1@x.com' }),
            makeEntry({ rank: 2, username: 'p2', email: 'p2@x.com' }),
            makeEntry({ rank: 3, username: 'p3', email: 'p3@x.com' }),
            makeEntry({ rank: 4, username: 'myuser', email: 'me@example.com', weeklyScore: 100 }),
        ];
        axios.get.mockResolvedValueOnce(makeLeaderboardResponse(entries));
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByText(/Your rank:/i)).toBeInTheDocument();
        });
    });

    test('Should show the correct rank number in the banner', async () => {
        const entries = [
            makeEntry({ rank: 1, username: 'p1', email: 'p1@x.com' }),
            makeEntry({ rank: 2, username: 'p2', email: 'p2@x.com' }),
            makeEntry({ rank: 3, username: 'p3', email: 'p3@x.com' }),
            makeEntry({ rank: 4, username: 'myuser', email: 'me@example.com', weeklyScore: 100 }),
        ];
        axios.get.mockResolvedValueOnce(makeLeaderboardResponse(entries));
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByText(/#4/)).toBeInTheDocument();
        });
    });

    test('Should show weekly score in the banner when score > 0', async () => {
        const entries = [
            makeEntry({ rank: 1, username: 'p1', email: 'p1@x.com' }),
            makeEntry({ rank: 2, username: 'p2', email: 'p2@x.com' }),
            makeEntry({ rank: 3, username: 'p3', email: 'p3@x.com' }),
            makeEntry({ rank: 4, username: 'myuser', email: 'me@example.com', weeklyScore: 250 }),
        ];
        axios.get.mockResolvedValueOnce(makeLeaderboardResponse(entries));
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByText(/250 pts this week/i)).toBeInTheDocument();
        });
    });

    test('Should show "No score yet" in banner when weekly score is 0', async () => {
        const entries = [
            makeEntry({ rank: 1, username: 'p1', email: 'p1@x.com' }),
            makeEntry({ rank: 2, username: 'p2', email: 'p2@x.com' }),
            makeEntry({ rank: 3, username: 'p3', email: 'p3@x.com' }),
            makeEntry({ rank: 4, username: 'myuser', email: 'me@example.com', weeklyScore: 0 }),
        ];
        axios.get.mockResolvedValueOnce(makeLeaderboardResponse(entries));
        renderLeaderboard();
        await waitFor(() => {
            expect(screen.getByText(/No score yet/i)).toBeInTheDocument();
        });
    });

    test('Should NOT show "Your rank" banner when current user is in top 3', async () => {
        const entries = [
            makeEntry({ rank: 1, username: 'myuser', email: 'me@example.com' }),
            makeEntry({ rank: 2, username: 'p2', email: 'p2@x.com' }),
            makeEntry({ rank: 3, username: 'p3', email: 'p3@x.com' }),
        ];
        axios.get.mockResolvedValueOnce(makeLeaderboardResponse(entries));
        renderLeaderboard();
        await waitFor(() => expect(document.querySelector('.lb-podium-area')).toBeInTheDocument());
        expect(screen.queryByText(/Your rank:/i)).not.toBeInTheDocument();
    });

    test('Should render lb-my-rank div for the banner', async () => {
        const entries = [
            makeEntry({ rank: 1, username: 'p1', email: 'p1@x.com' }),
            makeEntry({ rank: 2, username: 'p2', email: 'p2@x.com' }),
            makeEntry({ rank: 3, username: 'p3', email: 'p3@x.com' }),
            makeEntry({ rank: 4, username: 'myuser', email: 'me@example.com', weeklyScore: 100 }),
        ];
        axios.get.mockResolvedValueOnce(makeLeaderboardResponse(entries));
        renderLeaderboard();
        await waitFor(() => {
            expect(document.querySelector('.lb-my-rank')).toBeInTheDocument();
        });
    });
});

// =============================================================================
describe('Leaderboard – Refresh', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
    });

    test('Should call the API again when refresh button is clicked', async () => {
        axios.get.mockResolvedValue(makeLeaderboardResponse([]));
        const user = userEvent.setup();
        renderLeaderboard();

        await waitFor(() => expect(screen.queryByText(/Loading rankings/i)).not.toBeInTheDocument());
        await user.click(screen.getByTitle(/Refresh leaderboard/i));

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledTimes(2);
        });
    });

    test('Should show loading state again while refreshing', async () => {
        axios.get
            .mockResolvedValueOnce(makeLeaderboardResponse([]))
            .mockReturnValueOnce(new Promise(() => {}));

        const user = userEvent.setup();
        renderLeaderboard();

        await waitFor(() => expect(screen.queryByText(/Loading rankings/i)).not.toBeInTheDocument());
        await user.click(screen.getByTitle(/Refresh leaderboard/i));

        expect(screen.getByText(/Loading rankings/i)).toBeInTheDocument();
    });
});