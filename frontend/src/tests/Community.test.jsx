import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Community from '../pages/Community';

vi.mock('./Community.css', () => ({}));
vi.mock('../Dashboard.css', () => ({}));
vi.mock('axios');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../context/UserContext', () => ({
    useUser: () => ({ user: { email: 'me@example.com', username: 'myuser' } }),
}));

// ── Data helpers ──────────────────────────────────────────────────────────────
const makeFriend = (o = {}) => ({
    _id: 'f1', username: 'alice', fullName: 'Alice Smith',
    avatarUrl: '', streak: 3, completedLessons: [1, 2], ...o,
});
const makeRequest = (o = {}) => ({
    _id: 'r1', username: 'bob', fullName: 'Bob Jones', avatarUrl: '', ...o,
});
const makeSearchResult = (o = {}) => ({
    _id: 's1', username: 'carol', fullName: 'Carol White', avatarUrl: '', ...o,
});

// ── Render helper ─────────────────────────────────────────────────────────────
const renderCommunity = () =>
    render(<MemoryRouter><Community /></MemoryRouter>);

// ── Text matcher for split-node headings like "Your Friends ( 2 )" ────────────
const friendsHeading = (n) =>
    (_, el) => el?.tagName === 'H3' &&
        el?.textContent?.replace(/\s+/g, ' ').trim() === `Your Friends (${n})`;

const friendsHeadingStarts = () =>
    (_, el) => el?.tagName === 'H3' &&
        el?.textContent?.replace(/\s+/g, ' ').trim().startsWith('Your Friends');

// ── Search helpers (fake timers scoped per-test) ──────────────────────────────
const mockSearch = (results) => {
    axios.get.mockImplementation((url) => {
        if (url.includes('/api/auth/search'))
            return Promise.resolve({ data: results });
        return Promise.resolve({ data: { friendRequests: [], friends: [] } });
    });
};

const withFakeTimers = (fn) => async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try { await fn(); } finally { vi.useRealTimers(); }
};

const typeAndSearch = async (user, query) => {
    await user.type(screen.getByPlaceholderText(/find learners/i), query);
    vi.advanceTimersByTime(500);
    await waitFor(() => expect(screen.getByText(/Search Results/i)).toBeInTheDocument());
};

// =============================================================================
describe('Community Page – Rendering Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
        axios.get.mockResolvedValue({ data: { friendRequests: [], friends: [] } });
    });

    test('Should render the Community page heading', () => {
        renderCommunity();
        expect(screen.getByRole('heading', { name: /community/i })).toBeInTheDocument();
    });

    test('Should render the subtitle text', () => {
        renderCommunity();
        expect(screen.getByText(/Connect with other learners and grow together/i)).toBeInTheDocument();
    });

    test('Should render the search input field', () => {
        renderCommunity();
        expect(screen.getByPlaceholderText(/Find learners by name or username/i)).toBeInTheDocument();
    });

    test('Should render the community-container div', () => {
        renderCommunity();
        expect(document.querySelector('.community-container')).toBeInTheDocument();
    });

    test('Should render the search-bar-wrapper div', () => {
        renderCommunity();
        expect(document.querySelector('.search-bar-wrapper')).toBeInTheDocument();
    });

    test('Should render search input with correct CSS class', () => {
        renderCommunity();
        expect(document.querySelector('.community-search-input')).toBeInTheDocument();
    });

    test('Should render content-header element', () => {
        renderCommunity();
        expect(document.querySelector('.content-header')).toBeInTheDocument();
    });

    test('Should render greeting div inside the header', () => {
        renderCommunity();
        expect(document.querySelector('.greeting')).toBeInTheDocument();
    });

    test('Should render the Your Friends section after data loads', async () => {
        renderCommunity();
        await waitFor(() => {
            expect(screen.getByText(friendsHeadingStarts())).toBeInTheDocument();
        });
    });

    test('Should render the friends-list-section div', async () => {
        renderCommunity();
        await waitFor(() => {
            expect(document.querySelector('.friends-list-section')).toBeInTheDocument();
        });
    });
});

// =============================================================================
describe('Community Page – Data Fetching Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
        axios.get.mockResolvedValue({ data: { friendRequests: [], friends: [] } });
    });

    test('Should call the community/data API on mount', async () => {
        renderCommunity();
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('/api/auth/community/data')
            );
        });
    });

    test('Should include logged-in user email as a query param', async () => {
        renderCommunity();
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('email=me@example.com')
            );
        });
    });

    test('Should show Your Friends (0) when no friends returned', async () => {
        renderCommunity();
        await waitFor(() => {
            expect(screen.getByText(friendsHeading(0))).toBeInTheDocument();
        });
    });

    test('Should show empty-state message when friends list is empty', async () => {
        renderCommunity();
        await waitFor(() => {
            expect(screen.getByText(/You don't have any friends yet/i)).toBeInTheDocument();
        });
    });

    test('Should not crash when the community data API fails', async () => {
        axios.get.mockRejectedValue(new Error('Network Error'));
        renderCommunity();
        await waitFor(() => {
            expect(screen.getByText(friendsHeading(0))).toBeInTheDocument();
        });
    });

    test('Should populate friends list when API returns friends', async () => {
        axios.get.mockResolvedValue({
            data: { friendRequests: [], friends: [makeFriend()] }
        });
        renderCommunity();
        await waitFor(() => {
            expect(screen.getByText('Alice Smith')).toBeInTheDocument();
        });
    });

    test('Should show correct friends count when multiple friends returned', async () => {
        axios.get.mockResolvedValue({
            data: {
                friendRequests: [],
                friends: [
                    makeFriend({ _id: 'f1', username: 'alice' }),
                    makeFriend({ _id: 'f2', username: 'diana', fullName: 'Diana Prince' }),
                ],
            },
        });
        renderCommunity();
        await waitFor(() => {
            expect(screen.getByText(friendsHeading(2))).toBeInTheDocument();
        });
    });
});

// =============================================================================
describe('Community Page – Friends List Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
        axios.get.mockResolvedValue({ data: { friendRequests: [], friends: [] } });
    });

    test('Should display the full name of a friend', async () => {
        axios.get.mockResolvedValue({ data: { friendRequests: [], friends: [makeFriend()] } });
        renderCommunity();
        await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument());
    });

    test('Should display the username with @ prefix', async () => {
        axios.get.mockResolvedValue({ data: { friendRequests: [], friends: [makeFriend()] } });
        renderCommunity();
        await waitFor(() => expect(screen.getByText('@alice')).toBeInTheDocument());
    });

    test('Should display streak count when streak is greater than 0', async () => {
        axios.get.mockResolvedValue({ data: { friendRequests: [], friends: [makeFriend({ streak: 7 })] } });
        renderCommunity();
        await waitFor(() => expect(screen.getByText(/🔥 7 Streak/i)).toBeInTheDocument());
    });

    test('Should NOT display streak row when streak is 0', async () => {
        axios.get.mockResolvedValue({ data: { friendRequests: [], friends: [makeFriend({ streak: 0 })] } });
        renderCommunity();
        await waitFor(() => expect(screen.queryByText(/Streak/i)).not.toBeInTheDocument());
    });

    test('Should display the completed lessons count', async () => {
        axios.get.mockResolvedValue({ data: { friendRequests: [], friends: [makeFriend({ completedLessons: [1, 2, 3, 4] })] } });
        renderCommunity();
        await waitFor(() => expect(screen.getByText(/📚 4 Lessons/i)).toBeInTheDocument());
    });

    test('Should show 0 lessons when completedLessons is empty array', async () => {
        axios.get.mockResolvedValue({ data: { friendRequests: [], friends: [makeFriend({ completedLessons: [] })] } });
        renderCommunity();
        await waitFor(() => expect(screen.getByText(/📚 0 Lessons/i)).toBeInTheDocument());
    });

    test('Should show 0 lessons when completedLessons is undefined', async () => {
        axios.get.mockResolvedValue({ data: { friendRequests: [], friends: [makeFriend({ completedLessons: undefined })] } });
        renderCommunity();
        await waitFor(() => expect(screen.getByText(/📚 0 Lessons/i)).toBeInTheDocument());
    });

    test('Should use username as fallback display name when fullName is missing', async () => {
        axios.get.mockResolvedValue({ data: { friendRequests: [], friends: [makeFriend({ fullName: undefined })] } });
        renderCommunity();
        await waitFor(() => expect(screen.getByText('alice')).toBeInTheDocument());
    });

    test('Should render a user-avatar img for each friend', async () => {
        axios.get.mockResolvedValue({ data: { friendRequests: [], friends: [makeFriend()] } });
        renderCommunity();
        await waitFor(() => expect(document.querySelector('.user-avatar')).toBeInTheDocument());
    });

    test('Should use dicebear URL when avatarUrl is empty', async () => {
        axios.get.mockResolvedValue({ data: { friendRequests: [], friends: [makeFriend({ avatarUrl: '' })] } });
        renderCommunity();
        await waitFor(() => {
            expect(document.querySelector('.user-avatar').src).toContain('dicebear.com');
        });
    });

    test('Should use provided avatarUrl when it is set', async () => {
        axios.get.mockResolvedValue({
            data: { friendRequests: [], friends: [makeFriend({ avatarUrl: 'https://example.com/pic.png' })] }
        });
        renderCommunity();
        await waitFor(() => {
            expect(document.querySelector('.user-avatar').src).toBe('https://example.com/pic.png');
        });
    });

    test('Should navigate to friend profile when friend card is clicked', async () => {
        axios.get.mockResolvedValue({ data: { friendRequests: [], friends: [makeFriend()] } });
        const user = userEvent.setup();
        renderCommunity();
        await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument());
        await user.click(screen.getByText('Alice Smith').closest('.user-result-card'));
        expect(mockNavigate).toHaveBeenCalledWith('/profile/alice');
    });

    test('Should render multiple friend cards when multiple friends exist', async () => {
        axios.get.mockResolvedValue({
            data: {
                friendRequests: [],
                friends: [
                    makeFriend({ _id: 'f1', username: 'alice', fullName: 'Alice Smith' }),
                    makeFriend({ _id: 'f2', username: 'diana', fullName: 'Diana Prince' }),
                    makeFriend({ _id: 'f3', username: 'evan', fullName: 'Evan Lee' }),
                ],
            },
        });
        renderCommunity();
        await waitFor(() => {
            expect(screen.getByText('Alice Smith')).toBeInTheDocument();
            expect(screen.getByText('Diana Prince')).toBeInTheDocument();
            expect(screen.getByText('Evan Lee')).toBeInTheDocument();
        });
    });

    test('Should render the friends-grid div when friends exist', async () => {
        axios.get.mockResolvedValue({ data: { friendRequests: [], friends: [makeFriend()] } });
        renderCommunity();
        await waitFor(() => expect(document.querySelector('.friends-grid')).toBeInTheDocument());
    });

    test('Should NOT render friends-grid when friends list is empty', async () => {
        renderCommunity();
        await waitFor(() => expect(document.querySelector('.friends-grid')).not.toBeInTheDocument());
    });
});

// =============================================================================
describe('Community Page – Friend Requests Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
        axios.get.mockResolvedValue({ data: { friendRequests: [], friends: [] } });
    });

    test('Should NOT show Friend Requests section when there are no pending requests', async () => {
        renderCommunity();
        await waitFor(() => {
            expect(screen.queryByText(/Friend Requests/i)).not.toBeInTheDocument();
        });
    });

    test('Should show the Friend Requests section when requests exist', async () => {
        axios.get.mockResolvedValue({ data: { friendRequests: [makeRequest()], friends: [] } });
        renderCommunity();
        await waitFor(() => expect(screen.getByText(/Friend Requests/i)).toBeInTheDocument());
    });

    test('Should display the badge with the correct pending count', async () => {
        axios.get.mockResolvedValue({
            data: {
                friendRequests: [makeRequest({ _id: 'r1' }), makeRequest({ _id: 'r2', username: 'dave', fullName: 'Dave Ray' })],
                friends: []
            }
        });
        renderCommunity();
        await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());
    });

    test('Should display the requester full name', async () => {
        axios.get.mockResolvedValue({ data: { friendRequests: [makeRequest()], friends: [] } });
        renderCommunity();
        await waitFor(() => expect(screen.getByText('Bob Jones')).toBeInTheDocument());
    });

    test('Should display the requester username with @ prefix', async () => {
        axios.get.mockResolvedValue({ data: { friendRequests: [makeRequest()], friends: [] } });
        renderCommunity();
        await waitFor(() => expect(screen.getByText('@bob')).toBeInTheDocument());
    });

    test('Should render an Accept button for each request', async () => {
        axios.get.mockResolvedValue({ data: { friendRequests: [makeRequest()], friends: [] } });
        renderCommunity();
        await waitFor(() => expect(document.querySelector('.icon-btn.accept')).toBeInTheDocument());
    });

    test('Should render a Decline button for each request', async () => {
        axios.get.mockResolvedValue({ data: { friendRequests: [makeRequest()], friends: [] } });
        renderCommunity();
        await waitFor(() => expect(document.querySelector('.icon-btn.decline')).toBeInTheDocument());
    });

    test('Should call the accept API with correct targetId', async () => {
        axios.get.mockResolvedValue({ data: { friendRequests: [makeRequest()], friends: [] } });
        axios.post.mockResolvedValue({ data: { success: true } });
        const user = userEvent.setup();
        renderCommunity();
        await waitFor(() => expect(screen.getByText('Bob Jones')).toBeInTheDocument());
        await user.click(document.querySelector('.icon-btn.accept'));
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/api/auth/friend-request/accept'),
                expect.objectContaining({ targetId: 'r1' })
            );
        });
    });

    test('Should include currentEmail in the accept request body', async () => {
        axios.get.mockResolvedValue({ data: { friendRequests: [makeRequest()], friends: [] } });
        axios.post.mockResolvedValue({ data: { success: true } });
        const user = userEvent.setup();
        renderCommunity();
        await waitFor(() => expect(screen.getByText('Bob Jones')).toBeInTheDocument());
        await user.click(document.querySelector('.icon-btn.accept'));
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({ currentEmail: 'me@example.com' })
            );
        });
    });

    test('Should call the reject API with correct targetId', async () => {
        axios.get.mockResolvedValue({ data: { friendRequests: [makeRequest()], friends: [] } });
        axios.post.mockResolvedValue({ data: { success: true } });
        const user = userEvent.setup();
        renderCommunity();
        await waitFor(() => expect(screen.getByText('Bob Jones')).toBeInTheDocument());
        await user.click(document.querySelector('.icon-btn.decline'));
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/api/auth/friend-request/reject'),
                expect.objectContaining({ targetId: 'r1' })
            );
        });
    });

    test('Should navigate to requester profile when their name is clicked', async () => {
        axios.get.mockResolvedValue({ data: { friendRequests: [makeRequest()], friends: [] } });
        const user = userEvent.setup();
        renderCommunity();
        await waitFor(() => expect(screen.getByText('Bob Jones')).toBeInTheDocument());
        await user.click(screen.getByText('Bob Jones'));
        expect(mockNavigate).toHaveBeenCalledWith('/profile/bob');
    });

    test('Should render the friend-requests-section div', async () => {
        axios.get.mockResolvedValue({ data: { friendRequests: [makeRequest()], friends: [] } });
        renderCommunity();
        await waitFor(() => expect(document.querySelector('.friend-requests-section')).toBeInTheDocument());
    });

    test('Should render the requests-grid div', async () => {
        axios.get.mockResolvedValue({ data: { friendRequests: [makeRequest()], friends: [] } });
        renderCommunity();
        await waitFor(() => expect(document.querySelector('.requests-grid')).toBeInTheDocument());
    });

    test('Should render request-card div for each request', async () => {
        axios.get.mockResolvedValue({ data: { friendRequests: [makeRequest()], friends: [] } });
        renderCommunity();
        await waitFor(() => expect(document.querySelector('.request-card')).toBeInTheDocument());
    });

    test('Should render user avatar in request card', async () => {
        axios.get.mockResolvedValue({ data: { friendRequests: [makeRequest()], friends: [] } });
        renderCommunity();
        await waitFor(() => expect(document.querySelector('.user-avatar')).toBeInTheDocument());
    });
});

// =============================================================================
describe('Community Page – Search Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
        axios.get.mockResolvedValue({ data: { friendRequests: [], friends: [] } });
    });

    test('Should show Search Results heading when user starts typing', withFakeTimers(async () => {
        mockSearch([]);
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        renderCommunity();
        await user.type(screen.getByPlaceholderText(/find learners/i), 'a');
        vi.advanceTimersByTime(500);
        await waitFor(() => expect(screen.getByText(/Search Results/i)).toBeInTheDocument());
    }));

    test('Should show "Searching for learners..." while debounce is pending', withFakeTimers(async () => {
        axios.get.mockImplementation((url) => {
            if (url.includes('/api/auth/search')) return new Promise(() => {});
            return Promise.resolve({ data: { friendRequests: [], friends: [] } });
        });
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        renderCommunity();
        await user.type(screen.getByPlaceholderText(/find learners/i), 'bob');
        vi.advanceTimersByTime(500);
        await waitFor(() => expect(screen.getByText(/Searching for learners/i)).toBeInTheDocument());
    }));

    test('Should display full name of a search result', withFakeTimers(async () => {
        mockSearch([makeSearchResult()]);
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        renderCommunity();
        await typeAndSearch(user, 'carol');
        await waitFor(() => expect(screen.getByText('Carol White')).toBeInTheDocument());
    }));

    test('Should display username with @ prefix in search results', withFakeTimers(async () => {
        mockSearch([makeSearchResult()]);
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        renderCommunity();
        await typeAndSearch(user, 'carol');
        await waitFor(() => expect(screen.getByText('@carol')).toBeInTheDocument());
    }));

    test('Should show "No learners found" message when search returns empty', withFakeTimers(async () => {
        mockSearch([]);
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        renderCommunity();
        await typeAndSearch(user, 'xyz');
        await waitFor(() => expect(screen.getByText(/No learners found matching/i)).toBeInTheDocument());
    }));

    test('Should include the search query text in the no-results message', withFakeTimers(async () => {
        mockSearch([]);
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        renderCommunity();
        await typeAndSearch(user, 'xyz');
        await waitFor(() => expect(screen.getByText(/xyz/)).toBeInTheDocument());
    }));

    test('Should filter the logged-in user out of search results', withFakeTimers(async () => {
        mockSearch([
            { _id: 's1', username: 'myuser', fullName: 'Me', avatarUrl: '' },
            { _id: 's2', username: 'other', fullName: 'Other User', avatarUrl: '' },
        ]);
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        renderCommunity();
        await typeAndSearch(user, 'user');
        await waitFor(() => {
            expect(screen.queryByText('Me')).not.toBeInTheDocument();
            expect(screen.getByText('Other User')).toBeInTheDocument();
        });
    }));

    test('Should navigate to user profile when a search result card is clicked', withFakeTimers(async () => {
        mockSearch([makeSearchResult()]);
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        renderCommunity();
        await typeAndSearch(user, 'carol');
        await waitFor(() => expect(screen.getByText('Carol White')).toBeInTheDocument());
        await user.click(screen.getByText('Carol White').closest('.user-result-card'));
        expect(mockNavigate).toHaveBeenCalledWith('/profile/carol');
    }));

    test('Should hide search results and restore friends view when input is cleared', withFakeTimers(async () => {
        mockSearch([]);
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        renderCommunity();
        const input = screen.getByPlaceholderText(/find learners/i);
        await typeAndSearch(user, 'test');
        await user.clear(input);
        vi.advanceTimersByTime(500);
        await waitFor(() => {
            expect(screen.queryByText(/Search Results/i)).not.toBeInTheDocument();
            expect(screen.getByText(friendsHeadingStarts())).toBeInTheDocument();
        });
    }));

    test('Should call the search API with the correct query string', withFakeTimers(async () => {
        mockSearch([]);
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        renderCommunity();
        await typeAndSearch(user, 'alice');
        expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('q=alice'));
    }));

    test('Should NOT call the search API when input is empty on mount', withFakeTimers(async () => {
        renderCommunity();
        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
        expect(axios.get).not.toHaveBeenCalledWith(expect.stringContaining('/api/auth/search'));
    }));

    test('Should not crash when the search API fails', withFakeTimers(async () => {
        axios.get.mockImplementation((url) => {
            if (url.includes('/api/auth/search')) return Promise.reject(new Error('Search failed'));
            return Promise.resolve({ data: { friendRequests: [], friends: [] } });
        });
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        renderCommunity();
        await user.type(screen.getByPlaceholderText(/find learners/i), 'fail');
        vi.advanceTimersByTime(500);
        await waitFor(() => expect(screen.getByText(/No learners found matching/i)).toBeInTheDocument());
    }));

    test('Should use username as fallback display name when fullName is absent', withFakeTimers(async () => {
        mockSearch([{ _id: 's1', username: 'carol', avatarUrl: '' }]);
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        renderCommunity();
        await typeAndSearch(user, 'carol');
        await waitFor(() => expect(screen.getByText('carol')).toBeInTheDocument());
    }));

    test('Should render user-avatar img in search result cards', withFakeTimers(async () => {
        mockSearch([makeSearchResult()]);
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        renderCommunity();
        await typeAndSearch(user, 'carol');
        await waitFor(() => expect(document.querySelector('.user-avatar')).toBeInTheDocument());
    }));

    test('Should render a ChevronRight svg icon inside each search result card', withFakeTimers(async () => {
        mockSearch([makeSearchResult()]);
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        renderCommunity();
        await typeAndSearch(user, 'carol');
        await waitFor(() => {
            const card = screen.getByText('Carol White').closest('.user-result-card');
            expect(card.querySelector('svg')).toBeInTheDocument();
        });
    }));
});

// =============================================================================
describe('Community Page – Mixed State Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
        axios.get.mockResolvedValue({ data: { friendRequests: [], friends: [] } });
    });

    test('Should show both friend requests and friends at the same time', async () => {
        axios.get.mockResolvedValue({
            data: { friendRequests: [makeRequest()], friends: [makeFriend()] },
        });
        renderCommunity();
        await waitFor(() => {
            expect(screen.getByText(/Friend Requests/i)).toBeInTheDocument();
            expect(screen.getByText(friendsHeading(1))).toBeInTheDocument();
        });
    });

    test('Should hide friend requests section when no requests exist', async () => {
        axios.get.mockResolvedValue({ data: { friendRequests: [], friends: [makeFriend()] } });
        renderCommunity();
        await waitFor(() => {
            expect(screen.queryByText(/Friend Requests/i)).not.toBeInTheDocument();
            expect(screen.getByText(friendsHeading(1))).toBeInTheDocument();
        });
    });

    test('Should hide both sections during active search and restore on clear', withFakeTimers(async () => {
        axios.get.mockImplementation((url) => {
            if (url.includes('/api/auth/search')) return Promise.resolve({ data: [] });
            return Promise.resolve({ data: { friendRequests: [makeRequest()], friends: [makeFriend()] } });
        });
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        renderCommunity();

        await waitFor(() => expect(screen.getByText(friendsHeadingStarts())).toBeInTheDocument());

        const input = screen.getByPlaceholderText(/find learners/i);
        await user.type(input, 'test');
        vi.advanceTimersByTime(500);

        await waitFor(() => {
            expect(screen.getByText(/Search Results/i)).toBeInTheDocument();
            expect(screen.queryByText(friendsHeadingStarts())).not.toBeInTheDocument();
        });

        await user.clear(input);
        vi.advanceTimersByTime(500);

        await waitFor(() => {
            expect(screen.queryByText(/Search Results/i)).not.toBeInTheDocument();
            expect(screen.getByText(friendsHeadingStarts())).toBeInTheDocument();
        });
    }));
});