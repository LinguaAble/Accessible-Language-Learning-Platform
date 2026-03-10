import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import DailyStudyPlan from '../components/DailyStudyPlan';

// ── Mock axios ────────────────────────────────────────────────────────────────
vi.mock('axios');

// ── Mock UserContext ──────────────────────────────────────────────────────────
let mockUser = {
    email: 'test@example.com',
    completedLessons: [1, 2, 3],
    lessonScores: [],
    dailyScores: [],
    streak: 5,
};
let mockPreferences = { dailyGoalMinutes: 5 };
let mockTodayProgress = 0;

vi.mock('../context/UserContext', () => ({
    useUser: () => ({
        user: mockUser,
        preferences: mockPreferences,
        todayProgress: mockTodayProgress,
    }),
}));

// ── Helper ────────────────────────────────────────────────────────────────────
const renderPlan = () =>
    render(
        <BrowserRouter>
            <DailyStudyPlan />
        </BrowserRouter>
    );

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('DailyStudyPlan Component Tests', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();
        localStorage.clear();
        mockUser = {
            email: 'test@example.com',
            completedLessons: [1, 2, 3],
            lessonScores: [],
            dailyScores: [],
            streak: 5,
        };
        mockPreferences = { dailyGoalMinutes: 5 };
        mockTodayProgress = 0;
    });

    afterEach(() => {
        sessionStorage.clear();
        localStorage.clear();
    });

    // ==================== STRUCTURE TESTS ====================
    describe('Structure Tests', () => {

        test('Should render the plan card container', async () => {
            axios.post.mockResolvedValueOnce({ data: { success: true, plan: 'Study vowels today!' } });
            renderPlan();
            expect(document.querySelector('.db-ai-plan-card')).toBeInTheDocument();
        });

        test('Should render AI Coach badge', async () => {
            axios.post.mockResolvedValueOnce({ data: { success: true, plan: 'Study today!' } });
            renderPlan();
            expect(screen.getByText(/AI Coach/i)).toBeInTheDocument();
        });

        test("Should render Today's Study Plan heading", async () => {
            axios.post.mockResolvedValueOnce({ data: { success: true, plan: 'Study today!' } });
            renderPlan();
            expect(screen.getByText(/Today's Study Plan/i)).toBeInTheDocument();
        });

        test('Should render refresh button', async () => {
            axios.post.mockResolvedValueOnce({ data: { success: true, plan: 'Study today!' } });
            renderPlan();
            expect(screen.getByRole('button', { name: /refresh ai study plan/i })).toBeInTheDocument();
        });

        test('Should render plan body container', async () => {
            axios.post.mockResolvedValueOnce({ data: { success: true, plan: 'Study today!' } });
            renderPlan();
            expect(document.querySelector('.db-ai-plan-body')).toBeInTheDocument();
        });

        test('Should render plan header container', async () => {
            axios.post.mockResolvedValueOnce({ data: { success: true, plan: 'Study today!' } });
            renderPlan();
            expect(document.querySelector('.db-ai-plan-header')).toBeInTheDocument();
        });
    });

    // ==================== LOADING STATE TESTS ====================
    describe('Loading State Tests', () => {

        test('Should show shimmer loader while fetching', async () => {
            axios.post.mockImplementation(() => new Promise(() => {})); // never resolves
            renderPlan();
            await waitFor(() => {
                expect(document.querySelector('.db-ai-shimmer')).toBeInTheDocument();
            });
        });

        test('Should show both shimmer lines while loading', async () => {
            axios.post.mockImplementation(() => new Promise(() => {}));
            renderPlan();
            await waitFor(() => {
                expect(document.querySelector('.shimmer-long')).toBeInTheDocument();
                expect(document.querySelector('.shimmer-short')).toBeInTheDocument();
            });
        });

        test('Should disable refresh button while loading', async () => {
            axios.post.mockImplementation(() => new Promise(() => {}));
            renderPlan();
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /refresh ai study plan/i })).toBeDisabled();
            });
        });

        test('Should hide shimmer after plan is loaded', async () => {
            axios.post.mockResolvedValueOnce({ data: { success: true, plan: 'Practice consonants!' } });
            renderPlan();
            await waitFor(() => {
                expect(document.querySelector('.db-ai-shimmer')).not.toBeInTheDocument();
            });
        });

        test('Should enable refresh button after loading completes', async () => {
            axios.post.mockResolvedValueOnce({ data: { success: true, plan: 'Practice consonants!' } });
            renderPlan();
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /refresh ai study plan/i })).not.toBeDisabled();
            });
        });
    });

    // ==================== SUCCESS STATE TESTS ====================
    describe('Success State Tests', () => {

        test('Should display plan text after successful fetch', async () => {
            axios.post.mockResolvedValueOnce({ data: { success: true, plan: 'Study vowels today!' } });
            renderPlan();
            await waitFor(() => {
                expect(screen.getByText('Study vowels today!')).toBeInTheDocument();
            });
        });

        test('Should render plan inside db-ai-plan-text container', async () => {
            axios.post.mockResolvedValueOnce({ data: { success: true, plan: 'Learn consonants!' } });
            renderPlan();
            await waitFor(() => {
                expect(document.querySelector('.db-ai-plan-text')).toBeInTheDocument();
            });
        });

        test('Should NOT show error when plan loads successfully', async () => {
            axios.post.mockResolvedValueOnce({ data: { success: true, plan: 'Good plan!' } });
            renderPlan();
            await waitFor(() => {
                expect(document.querySelector('.db-ai-error')).not.toBeInTheDocument();
            });
        });

        test('Should NOT show placeholder text when plan is loaded', async () => {
            axios.post.mockResolvedValueOnce({ data: { success: true, plan: 'Loaded plan!' } });
            renderPlan();
            await waitFor(() => {
                expect(screen.queryByText(/Generating your personalized plan/i)).not.toBeInTheDocument();
            });
        });

        test('Should call axios.post with correct endpoint', async () => {
            axios.post.mockResolvedValueOnce({ data: { success: true, plan: 'Plan!' } });
            renderPlan();
            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith(
                    expect.stringContaining('/api/ai/daily-plan'),
                    expect.any(Object)
                );
            });
        });

        test('Should send completedLessons in request payload', async () => {
            axios.post.mockResolvedValueOnce({ data: { success: true, plan: 'Plan!' } });
            renderPlan();
            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith(
                    expect.any(String),
                    expect.objectContaining({
                        completedLessons: expect.any(Array),
                    })
                );
            });
        });

        test('Should send streak in request payload', async () => {
            axios.post.mockResolvedValueOnce({ data: { success: true, plan: 'Plan!' } });
            renderPlan();
            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith(
                    expect.any(String),
                    expect.objectContaining({ streak: 5 })
                );
            });
        });

        test('Should send dailyGoalMinutes in request payload', async () => {
            axios.post.mockResolvedValueOnce({ data: { success: true, plan: 'Plan!' } });
            renderPlan();
            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledWith(
                    expect.any(String),
                    expect.objectContaining({ dailyGoalMinutes: 5 })
                );
            });
        });
    });

    // ==================== ERROR STATE TESTS ====================
    describe('Error State Tests', () => {

        test('Should show error message when API call fails', async () => {
            axios.post.mockRejectedValueOnce(new Error('Network Error'));
            renderPlan();
            await waitFor(() => {
                expect(screen.getByText(/Could not load your plan/i)).toBeInTheDocument();
            });
        });

        test('Should render error inside db-ai-error element', async () => {
            axios.post.mockRejectedValueOnce(new Error('Network Error'));
            renderPlan();
            await waitFor(() => {
                expect(document.querySelector('.db-ai-error')).toBeInTheDocument();
            });
        });

        test('Should NOT show shimmer when error occurs', async () => {
            axios.post.mockRejectedValueOnce(new Error('Network Error'));
            renderPlan();
            await waitFor(() => {
                expect(document.querySelector('.db-ai-shimmer')).not.toBeInTheDocument();
            });
        });

        test('Should NOT show plan text when error occurs', async () => {
            axios.post.mockRejectedValueOnce(new Error('Network Error'));
            renderPlan();
            await waitFor(() => {
                expect(document.querySelector('.db-ai-plan-text')).not.toBeInTheDocument();
            });
        });

        test('Should enable refresh button after error', async () => {
            axios.post.mockRejectedValueOnce(new Error('Network Error'));
            renderPlan();
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /refresh ai study plan/i })).not.toBeDisabled();
            });
        });
    });

    // ==================== PLACEHOLDER STATE TESTS ====================
    describe('Placeholder State Tests', () => {

        test('Should show placeholder when no plan and not loading and no error', async () => {
            // API returns success:false so plan stays empty
            axios.post.mockResolvedValueOnce({ data: { success: false } });
            renderPlan();
            await waitFor(() => {
                expect(screen.getByText(/Generating your personalized plan/i)).toBeInTheDocument();
            });
        });

        test('Should render placeholder inside db-ai-placeholder class', async () => {
            axios.post.mockResolvedValueOnce({ data: { success: false } });
            renderPlan();
            await waitFor(() => {
                expect(document.querySelector('.db-ai-placeholder')).toBeInTheDocument();
            });
        });
    });

    // ==================== CACHE TESTS ====================
    describe('Cache Tests', () => {

        test('Should use cached plan when snapshot matches', async () => {
            // Pre-populate sessionStorage with matching snapshot
            const snapshot = '3||open'; // 3 completed, no scores, goal not done
            sessionStorage.setItem('ai_daily_plan', 'Cached plan text');
            sessionStorage.setItem('ai_daily_plan_snapshot', snapshot);

            renderPlan();

            await waitFor(() => {
                expect(screen.getByText('Cached plan text')).toBeInTheDocument();
            });

            // Should NOT call API when cache is valid
            expect(axios.post).not.toHaveBeenCalled();
        });

        test('Should save plan to sessionStorage after fetch', async () => {
            axios.post.mockResolvedValueOnce({ data: { success: true, plan: 'Fresh plan!' } });
            renderPlan();
            await waitFor(() => {
                expect(sessionStorage.getItem('ai_daily_plan')).toBe('Fresh plan!');
            });
        });

        test('Should save snapshot to sessionStorage after fetch', async () => {
            axios.post.mockResolvedValueOnce({ data: { success: true, plan: 'Fresh plan!' } });
            renderPlan();
            await waitFor(() => {
                expect(sessionStorage.getItem('ai_daily_plan_snapshot')).toBeTruthy();
            });
        });

        test('Should bypass cache and call API when forceRefresh is true', async () => {
            // Set valid cache
            sessionStorage.setItem('ai_daily_plan', 'Old cached plan');
            sessionStorage.setItem('ai_daily_plan_snapshot', '3||open');

            axios.post.mockResolvedValueOnce({ data: { success: true, plan: 'Fresh plan after refresh!' } });

            renderPlan();

            // Wait for initial cache render
            await waitFor(() => {
                expect(screen.getByText('Old cached plan')).toBeInTheDocument();
            });

            // Click refresh button
            const user = userEvent.setup();
            await user.click(screen.getByRole('button', { name: /refresh ai study plan/i }));

            await waitFor(() => {
                expect(axios.post).toHaveBeenCalledTimes(1);
                expect(screen.getByText('Fresh plan after refresh!')).toBeInTheDocument();
            });
        });
    });

    // ==================== REFRESH BUTTON TESTS ====================
    describe('Refresh Button Tests', () => {

        test('Should call API when refresh button is clicked', async () => {
            axios.post
                .mockResolvedValueOnce({ data: { success: true, plan: 'Initial plan' } })
                .mockResolvedValueOnce({ data: { success: true, plan: 'Refreshed plan' } });

            const user = userEvent.setup();
            renderPlan();

            await waitFor(() => {
                expect(screen.getByText('Initial plan')).toBeInTheDocument();
            });

            await user.click(screen.getByRole('button', { name: /refresh ai study plan/i }));

            await waitFor(() => {
                expect(screen.getByText('Refreshed plan')).toBeInTheDocument();
            });
        });

        test('Should show loading state when refresh clicked', async () => {
            axios.post
                .mockResolvedValueOnce({ data: { success: true, plan: 'Initial plan' } })
                .mockImplementationOnce(() => new Promise(() => {})); // refresh never resolves

            const user = userEvent.setup();
            renderPlan();

            await waitFor(() => {
                expect(screen.getByText('Initial plan')).toBeInTheDocument();
            });

            await user.click(screen.getByRole('button', { name: /refresh ai study plan/i }));

            await waitFor(() => {
                expect(document.querySelector('.db-ai-shimmer')).toBeInTheDocument();
            });
        });

        test('Should clear previous error when refresh is clicked', async () => {
            axios.post
                .mockRejectedValueOnce(new Error('Network Error'))
                .mockResolvedValueOnce({ data: { success: true, plan: 'Now it works!' } });

            const user = userEvent.setup();
            renderPlan();

            await waitFor(() => {
                expect(screen.getByText(/Could not load your plan/i)).toBeInTheDocument();
            });

            await user.click(screen.getByRole('button', { name: /refresh ai study plan/i }));

            await waitFor(() => {
                expect(screen.queryByText(/Could not load your plan/i)).not.toBeInTheDocument();
                expect(screen.getByText('Now it works!')).toBeInTheDocument();
            });
        });
    });
});