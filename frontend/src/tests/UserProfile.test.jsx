import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import UserProfile from '../pages/UserProfile';

// ── Mock CSS ──────────────────────────────────────────────────────────────────
vi.mock('../Dashboard.css', () => ({}));

// ── Mock axios ────────────────────────────────────────────────────────────────
vi.mock('axios');

// ── Mock navigate ─────────────────────────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => ({ username: 'alice' }),
    };
});

// ── Mock UserContext ──────────────────────────────────────────────────────────
vi.mock('../context/UserContext', () => ({
    useUser: () => ({
        user: { email: 'me@example.com', username: 'myuser' },
    }),
}));

// ── Profile data helpers ──────────────────────────────────────────────────────
const makeProfile = (overrides = {}) => ({
    _id: 'user123',
    username: 'alice',
    fullName: 'Alice Smith',
    bio: 'I love learning Hindi!',
    avatarUrl: '',
    relationship: 'friends',
    streak: 7,
    completedLessons: [1, 2, 3, 4, 5],
    dailyScores: [
        { date: '2025-01-01', score: 50 },
        { date: '2025-01-02', score: 80 },
    ],
    ...overrides,
});

// ── Render helper ─────────────────────────────────────────────────────────────
const renderProfile = () =>
    render(
        <MemoryRouter>
            <UserProfile />
        </MemoryRouter>
    );

// =============================================================================
describe('UserProfile – Loading & Error States', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
    });

    test('Should show loading text while profile is being fetched', () => {
        // Never resolves — keeps loading = true
        axios.get.mockReturnValue(new Promise(() => {}));
        renderProfile();
        expect(screen.getByText(/Loading alice's profile/i)).toBeInTheDocument();
    });

    test('Should show the error message from the API response', async () => {
        axios.get.mockRejectedValueOnce({
            response: { data: { message: 'User not found.' } }
        });
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText(/User not found\./i)).toBeInTheDocument();
        });
    });

    test('Should show Back to Community button on error state', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network Error'));
        renderProfile();
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Back to Community/i })).toBeInTheDocument();
        });
    });

    test('Should navigate to /community when Back to Community is clicked on error', async () => {
        const user = userEvent.setup();
        axios.get.mockRejectedValueOnce(new Error('Network Error'));
        renderProfile();

        await waitFor(() => expect(screen.getByRole('button', { name: /Back to Community/i })).toBeInTheDocument());
        await user.click(screen.getByRole('button', { name: /Back to Community/i }));

        expect(mockNavigate).toHaveBeenCalledWith('/community');
    });

    test('Should call the profile API with correct username', async () => {
        axios.get.mockResolvedValueOnce({ data: makeProfile() });
        renderProfile();
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('/api/auth/profile/alice')
            );
        });
    });

    test('Should include requesterEmail as query param when user is logged in', async () => {
        axios.get.mockResolvedValueOnce({ data: makeProfile() });
        renderProfile();
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('requesterEmail=me@example.com')
            );
        });
    });
});

// =============================================================================
describe('UserProfile – Header & Navigation', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
        axios.get.mockResolvedValue({ data: makeProfile() });
    });

    test('Should render the page title "Learner Profile"', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /Learner Profile/i })).toBeInTheDocument();
        });
    });

    test('Should render the subtitle "Viewing alice\'s information"', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText(/Viewing alice's information/i)).toBeInTheDocument();
        });
    });

    test('Should render the back chevron button', async () => {
        renderProfile();
        await waitFor(() => {
            // The back button has no label text, find by its container
            expect(document.querySelector('.content-header button')).toBeInTheDocument();
        });
    });

    test('Should navigate to /community when back button is clicked', async () => {
        const user = userEvent.setup();
        renderProfile();

        await waitFor(() => expect(screen.getByText(/Learner Profile/i)).toBeInTheDocument());
        // First button in the content-header is the back button
        const backBtn = document.querySelector('.content-header button');
        await user.click(backBtn);

        expect(mockNavigate).toHaveBeenCalledWith('/community');
    });
});

// =============================================================================
describe('UserProfile – Profile Card Rendering', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
        axios.get.mockResolvedValue({ data: makeProfile() });
    });

    test('Should render the user\'s full name', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText('Alice Smith')).toBeInTheDocument();
        });
    });

    test('Should render the username with @ prefix', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText('@alice')).toBeInTheDocument();
        });
    });

    test('Should render the bio when it is present', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText(/I love learning Hindi!/i)).toBeInTheDocument();
        });
    });

    test('Should NOT render bio section when bio is absent', async () => {
        axios.get.mockResolvedValue({ data: makeProfile({ bio: null }) });
        renderProfile();
        await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument());
        expect(screen.queryByText(/I love learning Hindi!/i)).not.toBeInTheDocument();
    });

    test('Should render avatar img element', async () => {
        renderProfile();
        await waitFor(() => {
            const avatar = document.querySelector('img[alt="Profile avatar"]');
            expect(avatar).toBeInTheDocument();
        });
    });

    test('Should use dicebear URL when avatarUrl is empty', async () => {
        renderProfile();
        await waitFor(() => {
            const avatar = document.querySelector('img[alt="Profile avatar"]');
            expect(avatar.src).toContain('dicebear.com');
        });
    });

    test('Should use provided avatarUrl when it is set', async () => {
        axios.get.mockResolvedValueOnce({
            data: makeProfile({ avatarUrl: 'https://example.com/avatar.png' })
        });
        renderProfile();
        await waitFor(() => {
            const avatar = document.querySelector('img[alt="Profile avatar"]');
            expect(avatar.src).toBe('https://example.com/avatar.png');
        });
    });

    test('Should fall back to username as display name when fullName is missing', async () => {
        axios.get.mockResolvedValueOnce({
            data: makeProfile({ fullName: '' })
        });
        renderProfile();
        await waitFor(() => {
            // username should appear as the heading
            expect(screen.getAllByText('alice').length).toBeGreaterThan(0);
        });
    });

    test('Should render the dashboard-grid container', async () => {
        renderProfile();
        await waitFor(() => {
            expect(document.querySelector('.dashboard-grid')).toBeInTheDocument();
        });
    });
});

// =============================================================================
describe('UserProfile – Relationship: "friends"', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
        axios.get.mockResolvedValue({ data: makeProfile({ relationship: 'friends' }) });
    });

    test('Should show streak stat card', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText('Streak')).toBeInTheDocument();
        });
    });

    test('Should display correct streak number', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText('7')).toBeInTheDocument();
        });
    });

    test('Should show "Days in a row" description', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText(/Days in a row/i)).toBeInTheDocument();
        });
    });

    test('Should show lessons stat card', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText('Lessons')).toBeInTheDocument();
        });
    });

    test('Should display correct completed lessons count', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText('5')).toBeInTheDocument();
        });
    });

    test('Should show "Lessons finished" description', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText(/Lessons finished/i)).toBeInTheDocument();
        });
    });

    test('Should show Total Experience stat card', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText(/Total Experience/i)).toBeInTheDocument();
        });
    });

    test('Should calculate and display total XP from dailyScores', async () => {
        // dailyScores: [{score:50},{score:80}] = 130 XP
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText('130 XP')).toBeInTheDocument();
        });
    });

    test('Should show "Knowledge gained over time" description', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText(/Knowledge gained over time/i)).toBeInTheDocument();
        });
    });

    test('Should show "Friends" button (disabled state)', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText(/Friends/i)).toBeInTheDocument();
        });
    });

    test('"Friends" button should be disabled', async () => {
        renderProfile();
        await waitFor(() => {
            const btn = screen.getByText(/Friends/i).closest('button');
            expect(btn).toBeDisabled();
        });
    });

    test('Should NOT show Private Progress card', async () => {
        renderProfile();
        await waitFor(() => expect(screen.getByText('Streak')).toBeInTheDocument());
        expect(screen.queryByText(/Private Progress/i)).not.toBeInTheDocument();
    });
});

// =============================================================================
describe('UserProfile – Relationship: "self"', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
        axios.get.mockResolvedValue({ data: makeProfile({ relationship: 'self' }) });
    });

    test('Should show stats (streak, lessons, XP) for own profile', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText('Streak')).toBeInTheDocument();
            expect(screen.getByText('Lessons')).toBeInTheDocument();
            expect(screen.getByText(/Total Experience/i)).toBeInTheDocument();
        });
    });

    test('Should NOT render any friend action button for own profile', async () => {
        renderProfile();
        await waitFor(() => expect(screen.getByText('Streak')).toBeInTheDocument());
        expect(screen.queryByRole('button', { name: /Add Friend|Request Sent|Accept Request|Friends/i })).not.toBeInTheDocument();
    });

    test('Should NOT show Private Progress card for own profile', async () => {
        renderProfile();
        await waitFor(() => expect(screen.getByText('Streak')).toBeInTheDocument());
        expect(screen.queryByText(/Private Progress/i)).not.toBeInTheDocument();
    });
});

// =============================================================================
describe('UserProfile – Relationship: "none" (stranger)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
        axios.get.mockResolvedValue({
            data: makeProfile({ relationship: 'none', streak: 0, completedLessons: [], dailyScores: [] })
        });
    });

    test('Should show Private Progress card instead of stats', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText(/Private Progress/i)).toBeInTheDocument();
        });
    });

    test('Should show "Add Friend" button', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Add Friend/i })).toBeInTheDocument();
        });
    });

    test('Should NOT show streak stat card', async () => {
        renderProfile();
        await waitFor(() => expect(screen.getByText(/Private Progress/i)).toBeInTheDocument());
        expect(screen.queryByText('Streak')).not.toBeInTheDocument();
    });

    test('Should NOT show lessons stat card', async () => {
        renderProfile();
        await waitFor(() => expect(screen.getByText(/Private Progress/i)).toBeInTheDocument());
        expect(screen.queryByText('Lessons')).not.toBeInTheDocument();
    });

    test('Should show message to add friend to see stats', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText(/@alice as a friend to see their learning statistics/i)).toBeInTheDocument();
        });
    });

    test('Should call the send friend-request API when Add Friend is clicked', async () => {
        axios.post.mockResolvedValueOnce({ data: { success: true } });
        const user = userEvent.setup();
        renderProfile();

        await waitFor(() => expect(screen.getByRole('button', { name: /Add Friend/i })).toBeInTheDocument());
        await user.click(screen.getByRole('button', { name: /Add Friend/i }));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/api/auth/friend-request/send'),
                expect.objectContaining({
                    requesterEmail: 'me@example.com',
                    targetUsername: 'alice',
                })
            );
        });
    });

    test('Should not crash if the send friend-request API fails', async () => {
        axios.post.mockRejectedValueOnce(new Error('Server error'));
        const user = userEvent.setup();
        renderProfile();

        await waitFor(() => expect(screen.getByRole('button', { name: /Add Friend/i })).toBeInTheDocument());
        await user.click(screen.getByRole('button', { name: /Add Friend/i }));

        // Button should still be in the document (no crash)
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Add Friend/i })).toBeInTheDocument();
        });
    });
});

// =============================================================================
describe('UserProfile – Relationship: "pending_sent"', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
        axios.get.mockResolvedValue({
            data: makeProfile({ relationship: 'pending_sent', streak: 0, completedLessons: [], dailyScores: [] })
        });
    });

    test('Should show "Request Sent" button', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText(/Request Sent/i)).toBeInTheDocument();
        });
    });

    test('"Request Sent" button should be disabled', async () => {
        renderProfile();
        await waitFor(() => {
            const btn = screen.getByText(/Request Sent/i).closest('button');
            expect(btn).toBeDisabled();
        });
    });

    test('Should show Private Progress card when request is pending', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText(/Private Progress/i)).toBeInTheDocument();
        });
    });
});

// =============================================================================
describe('UserProfile – Relationship: "pending_received"', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
        axios.get.mockResolvedValue({
            data: makeProfile({ relationship: 'pending_received', streak: 0, completedLessons: [], dailyScores: [] })
        });
    });

    test('Should show "Accept Request" button', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Accept Request/i })).toBeInTheDocument();
        });
    });

    test('Should show Private Progress card while request is pending_received', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText(/Private Progress/i)).toBeInTheDocument();
        });
    });
});

// =============================================================================
describe('UserProfile – XP Calculation Edge Cases', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
    });

    test('Should show 0 XP when dailyScores is an empty array', async () => {
        axios.get.mockResolvedValueOnce({
            data: makeProfile({ relationship: 'friends', dailyScores: [] })
        });
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText('0 XP')).toBeInTheDocument();
        });
    });

    test('Should show 0 XP when dailyScores is undefined', async () => {
        axios.get.mockResolvedValueOnce({
            data: makeProfile({ relationship: 'friends', dailyScores: undefined })
        });
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText('0 XP')).toBeInTheDocument();
        });
    });

    test('Should correctly sum multiple daily scores', async () => {
        axios.get.mockResolvedValueOnce({
            data: makeProfile({
                relationship: 'friends',
                dailyScores: [
                    { date: '2025-01-01', score: 100 },
                    { date: '2025-01-02', score: 200 },
                    { date: '2025-01-03', score: 50 },
                ]
            })
        });
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText('350 XP')).toBeInTheDocument();
        });
    });

    test('Should show 0 lessons when completedLessons is empty', async () => {
        axios.get.mockResolvedValueOnce({
            data: makeProfile({ relationship: 'friends', completedLessons: [] })
        });
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText('0')).toBeInTheDocument();
        });
    });
});