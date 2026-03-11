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
    completedLessons: 5,
    friendCount: 2,
    dailyScores: [
        { date: new Date().toISOString().split('T')[0], score: 130 }
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

    test('Should show loading state while profile is being fetched', () => {
        axios.get.mockReturnValue(new Promise(() => {}));
        renderProfile();
        expect(screen.getByText(/Loading alice's profile/i)).toBeInTheDocument();
    });

    test('Should show the error message when user not found', async () => {
        axios.get.mockRejectedValueOnce({
            response: { data: { message: 'User not found.' } }
        });
        renderProfile();
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /User Not Found/i })).toBeInTheDocument();
            expect(screen.getByText(/User not found\./i)).toBeInTheDocument();
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
});

// =============================================================================
describe('UserProfile – Header & Profile Card Rendering', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
        axios.get.mockResolvedValue({ data: makeProfile() });
    });

    test('Should render Back to Community button', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText(/Back to Community/i)).toBeInTheDocument();
        });
    });

    test('Should navigate to /community when back button is clicked', async () => {
        const user = userEvent.setup();
        renderProfile();

        await waitFor(() => expect(screen.getByText(/Alice Smith/i)).toBeInTheDocument());
        await user.click(screen.getAllByText(/Back to Community/i)[0]);

        expect(mockNavigate).toHaveBeenCalledWith('/community');
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

    test('Should use dicebear URL when avatarUrl is empty', async () => {
        renderProfile();
        await waitFor(() => {
            const avatar = screen.getByRole('img', { name: 'alice' });
            expect(avatar.src).toContain('dicebear.com');
        });
    });

    test('Should use provided avatarUrl when it is set', async () => {
        axios.get.mockResolvedValueOnce({
            data: makeProfile({ avatarUrl: 'https://example.com/avatar.png' })
        });
        renderProfile();
        await waitFor(() => {
            const avatar = screen.getByRole('img', { name: 'alice' });
            expect(avatar.src).toBe('https://example.com/avatar.png');
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

    test('Should show Day Streak stat card', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText('Day Streak')).toBeInTheDocument();
            expect(screen.getByText('7')).toBeInTheDocument();
        });
    });

    test('Should show Lessons Done stat card', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText('Lessons Done')).toBeInTheDocument();
            expect(screen.getByText('5')).toBeInTheDocument();
        });
    });

    test('Should show Points This Week stat card', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText('Points This Week')).toBeInTheDocument();
            expect(screen.getByText('130')).toBeInTheDocument();
        });
    });

    test('Should show "Friends" button (disabled state)', async () => {
        renderProfile();
        await waitFor(() => {
            const allBtns = screen.getAllByRole('button').filter(btn => {
                const txt = btn.textContent.trim();
                return txt.includes('Friends') && !txt.includes('View');
            });
            expect(allBtns.length).toBeGreaterThan(0);
            expect(allBtns[0]).toBeDisabled();
        });
    });

    test('Should NOT show Private Progress card', async () => {
        renderProfile();
        await waitFor(() => expect(screen.getByText('Day Streak')).toBeInTheDocument());
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

    test('Should show stats for own profile', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText('Day Streak')).toBeInTheDocument();
            expect(screen.getByText('Lessons Done')).toBeInTheDocument();
            expect(screen.getByText('Points This Week')).toBeInTheDocument();
        });
    });

    test('Should NOT render any friend action button for own profile', async () => {
        renderProfile();
        await waitFor(() => expect(screen.getByText('Day Streak')).toBeInTheDocument());
        // "View Friends" button always renders for all profiles, so exclude it
        expect(screen.queryByRole('button', { name: /Add Friend/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Request Sent/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Accept Request/i })).not.toBeInTheDocument();
        // The disabled "Friends" status button should not appear for self
        const friendsBtns = screen.getAllByRole('button').filter(btn => {
            const txt = btn.textContent.trim();
            return txt === 'Friends' || (txt.includes('Friends') && !txt.includes('View'));
        });
        expect(friendsBtns.length).toBe(0);
    });
});

// =============================================================================
describe('UserProfile – Relationship: "none" (stranger)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
        axios.get.mockResolvedValue({
            data: makeProfile({ relationship: 'none', streak: 0, completedLessons: 0, dailyScores: [] })
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

    test('Should NOT show stat cards', async () => {
        renderProfile();
        await waitFor(() => expect(screen.getByText(/Private Progress/i)).toBeInTheDocument());
        expect(screen.queryByText('Day Streak')).not.toBeInTheDocument();
        expect(screen.queryByText('Lessons Done')).not.toBeInTheDocument();
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
});

// =============================================================================
describe('UserProfile – Relationship: "pending_sent" and "pending_received"', () => {

    test('Should show "Request Sent" button when pending_sent', async () => {
        axios.get.mockResolvedValue({ data: makeProfile({ relationship: 'pending_sent' }) });
        renderProfile();
        await waitFor(() => {
            const btn = screen.getByRole('button', { name: /Request Sent/i });
            expect(btn).toBeInTheDocument();
            expect(btn).toBeDisabled();
        });
    });

    test('Should show "Accept Request" button when pending_received', async () => {
        axios.get.mockResolvedValue({ data: makeProfile({ relationship: 'pending_received' }) });
        renderProfile();
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Accept Request/i })).toBeInTheDocument();
        });
    });
});