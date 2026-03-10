import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LearningReport from '../pages/LearningReport';

// ── Mock navigate ─────────────────────────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

// ── Mock CSS ──────────────────────────────────────────────────────────────────
vi.mock('./LearningReport.css', () => ({}));

// ── Mock UserContext ──────────────────────────────────────────────────────────
let mockUser = {};
let mockStreak = 0;

vi.mock('../context/UserContext', () => ({
    useUser: () => ({ user: mockUser, streak: mockStreak }),
}));

// ── Helper ────────────────────────────────────────────────────────────────────
const renderReport = () =>
    render(
        <BrowserRouter>
            <LearningReport />
        </BrowserRouter>
    );

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('LearningReport Component Tests', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockStreak = 0;
        mockUser = {
            dailyScores: [],
            dailyLessonCounts: [],
            loginHistory: [],
            completedLessons: [],
            streak: 0,
            todayProgress: 0,
            preferences: { dailyGoalMinutes: 5 },
        };
    });

    // ==================== RENDERING TESTS ====================
    describe('Rendering Tests', () => {

        test('Should render the page title', () => {
            renderReport();
            expect(screen.getByRole('heading', { name: /Performance Report/i })).toBeInTheDocument();
        });

        test('Should render subtitle text', () => {
            renderReport();
            expect(screen.getByText(/Tracking your journey to language mastery/i)).toBeInTheDocument();
        });

        test('Should render Back to Dashboard button', () => {
            renderReport();
            expect(screen.getByRole('button', { name: /Back to Dashboard/i })).toBeInTheDocument();
        });

        test('Should render LAST SYNCED badge', () => {
            renderReport();
            expect(screen.getByText(/LAST SYNCED/i)).toBeInTheDocument();
        });

        test('Should render Weekly Snapshot toggle button', () => {
            renderReport();
            expect(screen.getByRole('button', { name: /Weekly Snapshot/i })).toBeInTheDocument();
        });

        test('Should render Overall Mastery toggle button', () => {
            renderReport();
            expect(screen.getByRole('button', { name: /Overall Mastery/i })).toBeInTheDocument();
        });

        test('Should default to weekly view on first render', () => {
            renderReport();
            expect(screen.getByText(/Weekly Activity Velocity/i)).toBeInTheDocument();
        });

        test('Should render all 7 day labels in weekly chart', () => {
            renderReport();
            ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(day => {
                expect(screen.getAllByText(day).length).toBeGreaterThan(0);
            });
        });

        test('Should render Points this week label', () => {
            renderReport();
            expect(screen.getByText(/Points this week/i)).toBeInTheDocument();
        });

        test('Should render Lessons done label', () => {
            renderReport();
            expect(screen.getByText(/Lessons done/i)).toBeInTheDocument();
        });

        test('Should render Goal Completed mini card', () => {
            renderReport();
            expect(screen.getByText(/Goal Completed/i)).toBeInTheDocument();
        });

        test('Should render Study Intensity mini card', () => {
            renderReport();
            expect(screen.getByText(/Study Intensity/i)).toBeInTheDocument();
        });

        test('Should render Lifetime Days Active mini card', () => {
            renderReport();
            expect(screen.getByText(/Lifetime Days Active/i)).toBeInTheDocument();
        });

        test('Should render Weekly Recommendation section', () => {
            renderReport();
            expect(screen.getByText(/Weekly Recommendation/i)).toBeInTheDocument();
        });
    });

    // ==================== TOGGLE TESTS ====================
    describe('Toggle / Tab Tests', () => {

        test('Weekly Snapshot button should have active class by default', () => {
            renderReport();
            const weeklyBtn = screen.getByRole('button', { name: /Weekly Snapshot/i });
            expect(weeklyBtn).toHaveClass('active');
        });

        test('Overall Mastery button should NOT have active class by default', () => {
            renderReport();
            const overallBtn = screen.getByRole('button', { name: /Overall Mastery/i });
            expect(overallBtn).not.toHaveClass('active');
        });

        test('Should switch to Overall Mastery view when clicked', async () => {
            const user = userEvent.setup();
            renderReport();

            await user.click(screen.getByRole('button', { name: /Overall Mastery/i }));

            expect(screen.getByText(/Skill Proficiency/i)).toBeInTheDocument();
        });

        test('Overall Mastery button should have active class after click', async () => {
            const user = userEvent.setup();
            renderReport();

            const overallBtn = screen.getByRole('button', { name: /Overall Mastery/i });
            await user.click(overallBtn);

            expect(overallBtn).toHaveClass('active');
        });

        test('Should switch back to Weekly view when Weekly Snapshot is clicked again', async () => {
            const user = userEvent.setup();
            renderReport();

            await user.click(screen.getByRole('button', { name: /Overall Mastery/i }));
            await user.click(screen.getByRole('button', { name: /Weekly Snapshot/i }));

            expect(screen.getByText(/Weekly Activity Velocity/i)).toBeInTheDocument();
        });

        test('Should NOT show Weekly content when Overall Mastery is active', async () => {
            const user = userEvent.setup();
            renderReport();

            await user.click(screen.getByRole('button', { name: /Overall Mastery/i }));

            expect(screen.queryByText(/Weekly Activity Velocity/i)).not.toBeInTheDocument();
        });

        test('Should NOT show Overall content when Weekly is active', () => {
            renderReport();
            expect(screen.queryByText(/Skill Proficiency/i)).not.toBeInTheDocument();
        });
    });

    // ==================== OVERALL MASTERY VIEW TESTS ====================
    describe('Overall Mastery View Tests', () => {

        const switchToOverall = async () => {
            const user = userEvent.setup();
            renderReport();
            await user.click(screen.getByRole('button', { name: /Overall Mastery/i }));
        };

        test('Should render Skill Proficiency card', async () => {
            await switchToOverall();
            expect(screen.getByText(/Skill Proficiency/i)).toBeInTheDocument();
        });

        test('Should render GLOBAL RANK badge', async () => {
            await switchToOverall();
            expect(screen.getByText(/GLOBAL RANK: B1/i)).toBeInTheDocument();
        });

        test('Should render all 4 skill progress bars', async () => {
            await switchToOverall();
            expect(screen.getByText('Vocabulary')).toBeInTheDocument();
            expect(screen.getByText('Grammar')).toBeInTheDocument();
            expect(screen.getByText('Pronunciation')).toBeInTheDocument();
            expect(screen.getByText('Consistency')).toBeInTheDocument();
        });

        test('Should render Milestones & Unlocks card', async () => {
            await switchToOverall();
            expect(screen.getByText(/Milestones & Unlocks/i)).toBeInTheDocument();
        });

        test('Should render all 4 milestones', async () => {
            await switchToOverall();
            expect(screen.getByText('Seed Sower')).toBeInTheDocument();
            expect(screen.getByText('Quick Learner')).toBeInTheDocument();
            expect(screen.getByText('Unstoppable')).toBeInTheDocument();
            expect(screen.getByText('Linguist')).toBeInTheDocument();
        });

        test('Should render milestone descriptions', async () => {
            await switchToOverall();
            expect(screen.getByText(/Complete 1st Lesson/i)).toBeInTheDocument();
            expect(screen.getByText(/Gain 100 Points Overall/i)).toBeInTheDocument();
            expect(screen.getByText(/Maintain 7 Day Streak/i)).toBeInTheDocument();
            expect(screen.getByText(/Complete 10 Lessons/i)).toBeInTheDocument();
        });

        test('Should render Lifetime Points stat card', async () => {
            await switchToOverall();
            expect(screen.getByText(/Lifetime Points/i)).toBeInTheDocument();
        });

        test('Should render Lessons Completed stat card', async () => {
            await switchToOverall();
            expect(screen.getByText(/Lessons Completed/i)).toBeInTheDocument();
        });

        test('Should render Best Streak stat card', async () => {
            await switchToOverall();
            expect(screen.getByText(/Best Streak/i)).toBeInTheDocument();
        });

        test('Should render Tier Status as PRO', async () => {
            await switchToOverall();
            expect(screen.getByText('PRO')).toBeInTheDocument();
            expect(screen.getByText(/Tier Status/i)).toBeInTheDocument();
        });
    });

    // ==================== DATA / ANALYTICS TESTS ====================
    describe('Analytics Data Tests', () => {

        test('Should show 0 weekly points when no daily scores', () => {
            mockUser = { ...mockUser, dailyScores: [] };
            renderReport();
            // weeklyPoints = 0
            const summaryVals = document.querySelectorAll('.lr-summary-val');
            expect(summaryVals[0]).toHaveTextContent('0');
        });

        test('Should show correct total score in overall view', async () => {
            const user = userEvent.setup();
            mockUser = {
                ...mockUser,
                dailyScores: [
                    { date: '2024-01-01', score: 50 },
                    { date: '2024-01-02', score: 30 },
                ],
                completedLessons: [],
            };
            renderReport();
            await user.click(screen.getByRole('button', { name: /Overall Mastery/i }));

            const miniVals = document.querySelectorAll('.lr-mini-val');
            // First mini-val in overall grid is totalScore
            expect(miniVals[0]).toHaveTextContent('80');
        });

        test('Should show correct lessons count in overall view', async () => {
            const user = userEvent.setup();
            mockUser = {
                ...mockUser,
                completedLessons: [1, 2, 3, 4, 5],
            };
            renderReport();
            await user.click(screen.getByRole('button', { name: /Overall Mastery/i }));

            expect(screen.getByText('5')).toBeInTheDocument();
        });

        test('Should show Low intensity when no lessons this week', () => {
            renderReport();
            expect(screen.getByText('Low')).toBeInTheDocument();
        });

        test('Should show High intensity when lessons completed this week', () => {
            const today = new Date();
            const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            mockUser = {
                ...mockUser,
                dailyLessonCounts: [{ date: fmt(today), count: 3 }],
            };
            renderReport();
            expect(screen.getByText('High')).toBeInTheDocument();
        });

        test('Should show 0% goal when todayProgress is 0', () => {
            mockUser = { ...mockUser, todayProgress: 0, preferences: { dailyGoalMinutes: 5 } };
            renderReport();
            const miniVals = document.querySelectorAll('.lr-mini-val');
            expect(miniVals[0]).toHaveTextContent('0%');
        });

        test('Should show 100% goal when todayProgress meets goal', () => {
            mockUser = { ...mockUser, todayProgress: 5, preferences: { dailyGoalMinutes: 5 } };
            renderReport();
            const miniVals = document.querySelectorAll('.lr-mini-val');
            expect(miniVals[0]).toHaveTextContent('100%');
        });
    });

    // ==================== MILESTONE UNLOCK TESTS ====================
    describe('Milestone Unlock Tests', () => {

        test('Seed Sower should be locked when no lessons completed', async () => {
            const user = userEvent.setup();
            mockUser = { ...mockUser, completedLessons: [] };
            renderReport();
            await user.click(screen.getByRole('button', { name: /Overall Mastery/i }));

            const seedSowerItem = screen.getByText('Seed Sower').closest('.lr-milestone-item');
            expect(seedSowerItem).toHaveClass('locked');
        });

        test('Seed Sower should be unlocked when 1 lesson completed', async () => {
            const user = userEvent.setup();
            mockUser = { ...mockUser, completedLessons: [1] };
            renderReport();
            await user.click(screen.getByRole('button', { name: /Overall Mastery/i }));

            const seedSowerItem = screen.getByText('Seed Sower').closest('.lr-milestone-item');
            expect(seedSowerItem).toHaveClass('unlocked');
        });

        test('Quick Learner should be locked when totalScore < 100', async () => {
            const user = userEvent.setup();
            mockUser = { ...mockUser, dailyScores: [{ date: '2024-01-01', score: 50 }] };
            renderReport();
            await user.click(screen.getByRole('button', { name: /Overall Mastery/i }));

            const item = screen.getByText('Quick Learner').closest('.lr-milestone-item');
            expect(item).toHaveClass('locked');
        });

        test('Quick Learner should be unlocked when totalScore >= 100', async () => {
            const user = userEvent.setup();
            mockUser = { ...mockUser, dailyScores: [{ date: '2024-01-01', score: 100 }] };
            renderReport();
            await user.click(screen.getByRole('button', { name: /Overall Mastery/i }));

            const item = screen.getByText('Quick Learner').closest('.lr-milestone-item');
            expect(item).toHaveClass('unlocked');
        });

        test('Unstoppable should be locked when streak < 7', async () => {
            const user = userEvent.setup();
            mockStreak = 3;
            renderReport();
            await user.click(screen.getByRole('button', { name: /Overall Mastery/i }));

            const item = screen.getByText('Unstoppable').closest('.lr-milestone-item');
            expect(item).toHaveClass('locked');
        });

        test('Unstoppable should be unlocked when streak >= 7', async () => {
            const user = userEvent.setup();
            mockStreak = 7;
            renderReport();
            await user.click(screen.getByRole('button', { name: /Overall Mastery/i }));

            const item = screen.getByText('Unstoppable').closest('.lr-milestone-item');
            expect(item).toHaveClass('unlocked');
        });

        test('Linguist should be locked when lessons < 10', async () => {
            const user = userEvent.setup();
            mockUser = { ...mockUser, completedLessons: [1, 2, 3] };
            renderReport();
            await user.click(screen.getByRole('button', { name: /Overall Mastery/i }));

            const item = screen.getByText('Linguist').closest('.lr-milestone-item');
            expect(item).toHaveClass('locked');
        });

        test('Linguist should be unlocked when lessons >= 10', async () => {
            const user = userEvent.setup();
            mockUser = { ...mockUser, completedLessons: [1,2,3,4,5,6,7,8,9,10] };
            renderReport();
            await user.click(screen.getByRole('button', { name: /Overall Mastery/i }));

            const item = screen.getByText('Linguist').closest('.lr-milestone-item');
            expect(item).toHaveClass('unlocked');
        });
    });

    // ==================== WEEKLY RECOMMENDATION TESTS ====================
    describe('Weekly Recommendation Tests', () => {

        test('Should show low momentum message when weeklyPoints <= 50', () => {
            renderReport();
            expect(screen.getByText(/Consistency is key/i)).toBeInTheDocument();
        });

        test('Should show high momentum message when weeklyPoints > 50', () => {
            const today = new Date();
            const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            mockUser = {
                ...mockUser,
                dailyScores: [{ date: fmt(today), score: 80 }],
            };
            renderReport();
            expect(screen.getByText(/incredible momentum/i)).toBeInTheDocument();
        });
    });

    // ==================== NAVIGATION TESTS ====================
    describe('Navigation Tests', () => {

        test('Should call navigate to /dashboard when Back button clicked', async () => {
            const user = userEvent.setup();
            renderReport();

            await user.click(screen.getByRole('button', { name: /Back to Dashboard/i }));

            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    // ==================== CSS CLASS TESTS ====================
    describe('CSS Structure Tests', () => {

        test('Should render lr-root container', () => {
            renderReport();
            expect(document.querySelector('.lr-root')).toBeInTheDocument();
        });

        test('Should render lr-header-nav', () => {
            renderReport();
            expect(document.querySelector('.lr-header-nav')).toBeInTheDocument();
        });

        test('Should render lr-report-toggle', () => {
            renderReport();
            expect(document.querySelector('.lr-report-toggle')).toBeInTheDocument();
        });

        test('Should render lr-weekly-grid in weekly view', () => {
            renderReport();
            expect(document.querySelector('.lr-weekly-grid')).toBeInTheDocument();
        });

        test('Should render lr-overall-grid in overall view', async () => {
            const user = userEvent.setup();
            renderReport();
            await user.click(screen.getByRole('button', { name: /Overall Mastery/i }));
            expect(document.querySelector('.lr-overall-grid')).toBeInTheDocument();
        });

        test('Should render lr-mini-card elements in weekly view', () => {
            renderReport();
            const miniCards = document.querySelectorAll('.lr-mini-card');
            expect(miniCards.length).toBeGreaterThanOrEqual(3);
        });
    });
});