import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

// Mock navigate function
const mockNavigate = vi.fn();

// Mock location object
let mockLocationPathname = '/dashboard';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ pathname: mockLocationPathname }),
    };
});

// Helper to render Sidebar with Router
const renderSidebar = () => {
    return render(
        <BrowserRouter>
            <Sidebar />
        </BrowserRouter>
    );
};

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => {
            store[key] = value.toString();
        }),
        clear: vi.fn(() => {
            store = {};
        }),
        removeItem: vi.fn((key) => {
            delete store[key];
        }),
    };
})();

global.localStorage = localStorageMock;
global.sessionStorage = localStorageMock;

describe('Sidebar Component Tests', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
        mockLocationPathname = '/dashboard';
        localStorageMock.clear();
    });

    // ==================== RENDERING TESTS ====================
    describe('Rendering Tests', () => {

        test('Should render sidebar with logo and branding', () => {
            renderSidebar();

            const logo = screen.getByAltText(/LinguaAble Logo/i);
            expect(logo).toBeInTheDocument();
            expect(logo).toHaveClass('logo-image');

            expect(screen.getByText('Lingua')).toBeInTheDocument();
            expect(screen.getByText('Able')).toBeInTheDocument();
            expect(screen.getByText(/Built Around Learners, Not Limitations!/i)).toBeInTheDocument();
        });

        test('Should render all navigation items', () => {
            renderSidebar();

            expect(screen.getByTitle('Dashboard')).toBeInTheDocument();
            expect(screen.getByTitle('Lessons')).toBeInTheDocument();
            expect(screen.getByTitle('Leaderboard')).toBeInTheDocument();
            expect(screen.getByTitle('Settings')).toBeInTheDocument();
            expect(screen.getByTitle('Logout')).toBeInTheDocument();
        });

        test('Should render navigation items with text labels', () => {
            renderSidebar();

            expect(screen.getByText('Dashboard')).toBeInTheDocument();
            expect(screen.getByText('Lessons')).toBeInTheDocument();
            expect(screen.getByText('Leaderboard')).toBeInTheDocument();
            expect(screen.getByText('Settings')).toBeInTheDocument();
            expect(screen.getByText('Logout')).toBeInTheDocument();
        });

        test('Should have correct sidebar structure', () => {
            renderSidebar();

            const sidebar = document.querySelector('.sidebar');
            expect(sidebar).toBeInTheDocument();

            const logoSection = document.querySelector('.logo-section');
            expect(logoSection).toBeInTheDocument();

            const nav = document.querySelector('.side-nav');
            expect(nav).toBeInTheDocument();

            const footer = document.querySelector('.side-footer');
            expect(footer).toBeInTheDocument();
        });

        test('Should render branding with correct classes', () => {
            renderSidebar();

            const brandName = document.querySelector('.brand-name');
            expect(brandName).toBeInTheDocument();
            expect(brandName.textContent).toContain('Lingua');
            expect(brandName.textContent).toContain('Able');

            const highlight = document.querySelector('.highlight-text');
            expect(highlight).toBeInTheDocument();
            expect(highlight.textContent).toBe('Able');

            const slogan = document.querySelector('.slogan-text');
            expect(slogan).toBeInTheDocument();
        });

        test('Should start in collapsed state', () => {
            renderSidebar();

            const sidebar = document.querySelector('.sidebar');
            expect(sidebar).toHaveClass('collapsed');
        });
    });

    // ==================== ACTIVE STATE TESTS ====================
    describe('Active State Tests', () => {

        test('Should highlight Dashboard when on /dashboard', () => {
            mockLocationPathname = '/dashboard';
            renderSidebar();

            const dashboardButton = screen.getByTitle('Dashboard');
            expect(dashboardButton).toHaveClass('active');
        });

        test('Should highlight Lessons when on /lessons', () => {
            mockLocationPathname = '/lessons';
            renderSidebar();

            const lessonsButton = screen.getByTitle('Lessons');
            expect(lessonsButton).toHaveClass('active');
        });



        test('Should highlight Leaderboard when on /leaderboard', () => {
            mockLocationPathname = '/leaderboard';
            renderSidebar();

            const leaderboardButton = screen.getByTitle('Leaderboard');
            expect(leaderboardButton).toHaveClass('active');
        });

        test('Should highlight Settings when on /settings', () => {
            mockLocationPathname = '/settings';
            renderSidebar();

            const settingsButton = screen.getByTitle('Settings');
            expect(settingsButton).toHaveClass('active');
        });

        test('Should only highlight one nav item at a time', () => {
            mockLocationPathname = '/lessons';
            renderSidebar();

            const activeButtons = document.querySelectorAll('.nav-item.active');
            expect(activeButtons).toHaveLength(1);
            expect(activeButtons[0]).toHaveAttribute('title', 'Lessons');
        });
    });

    // ==================== NAVIGATION TESTS ====================
    describe('Navigation Tests', () => {

        test('Should navigate to Dashboard when Dashboard clicked', async () => {
            const user = userEvent.setup();
            renderSidebar();

            const dashboardButton = screen.getByTitle('Dashboard');
            await user.click(dashboardButton);

            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });

        test('Should navigate to Lessons when Lessons clicked', async () => {
            const user = userEvent.setup();
            renderSidebar();

            const lessonsButton = screen.getByTitle('Lessons');
            await user.click(lessonsButton);

            expect(mockNavigate).toHaveBeenCalledWith('/lessons');
        });



        test('Should navigate to Leaderboard when Leaderboard clicked', async () => {
            const user = userEvent.setup();
            renderSidebar();

            const leaderboardButton = screen.getByTitle('Leaderboard');
            await user.click(leaderboardButton);

            expect(mockNavigate).toHaveBeenCalledWith('/leaderboard');
        });

        test('Should navigate to Settings when Settings clicked', async () => {
            const user = userEvent.setup();
            renderSidebar();

            const settingsButton = screen.getByTitle('Settings');
            await user.click(settingsButton);

            expect(mockNavigate).toHaveBeenCalledWith('/settings');
        });
    });

    // ==================== LOGOUT TESTS ====================
    describe('Logout Tests', () => {

        test('Should clear localStorage on logout', async () => {
            const user = userEvent.setup();

            // Set some data in localStorage
            localStorageMock.setItem('token', 'test-token');
            localStorageMock.setItem('user', JSON.stringify({ email: 'test@example.com' }));
            localStorageMock.setItem('completedLessons', JSON.stringify([1, 2, 3]));

            renderSidebar();

            const logoutButton = screen.getByTitle('Logout');
            await user.click(logoutButton);

            expect(localStorageMock.clear).toHaveBeenCalled();
        });

        test('Should clear sessionStorage on logout', async () => {
            const user = userEvent.setup();

            renderSidebar();

            const logoutButton = screen.getByTitle('Logout');
            await user.click(logoutButton);

            expect(localStorageMock.clear).toHaveBeenCalled();
        });

        test('Should navigate to root (/) after logout', async () => {
            const user = userEvent.setup();
            renderSidebar();

            const logoutButton = screen.getByTitle('Logout');
            await user.click(logoutButton);

            expect(mockNavigate).toHaveBeenCalledWith('/');
        });

        test('Should have logout button in footer section', () => {
            renderSidebar();

            const footer = document.querySelector('.side-footer');
            const logoutButton = footer.querySelector('.logout');
            expect(logoutButton).toBeInTheDocument();
        });
    });

    // ==================== COLLAPSE/EXPAND TESTS ====================
    describe('Collapse/Expand Tests', () => {

        test('Should expand sidebar on mouse enter', async () => {
            const user = userEvent.setup();
            renderSidebar();

            const sidebar = document.querySelector('.sidebar');
            expect(sidebar).toHaveClass('collapsed');

            await user.hover(sidebar);

            await waitFor(() => {
                expect(sidebar).not.toHaveClass('collapsed');
            });
        });

        test('Should collapse sidebar on mouse leave', async () => {
            const user = userEvent.setup();
            renderSidebar();

            const sidebar = document.querySelector('.sidebar');

            // First expand it
            await user.hover(sidebar);
            await waitFor(() => {
                expect(sidebar).not.toHaveClass('collapsed');
            });

            // Then unhover
            await user.unhover(sidebar);

            await waitFor(() => {
                expect(sidebar).toHaveClass('collapsed');
            });
        });

        test('Should toggle collapsed class between hover states', async () => {
            const user = userEvent.setup();
            renderSidebar();

            const sidebar = document.querySelector('.sidebar');

            // Should start collapsed
            expect(sidebar).toHaveClass('collapsed');

            // Hover to expand
            await user.hover(sidebar);
            await waitFor(() => {
                expect(sidebar).not.toHaveClass('collapsed');
            });

            // Unhover to collapse
            await user.unhover(sidebar);
            await waitFor(() => {
                expect(sidebar).toHaveClass('collapsed');
            });
        });
    });

    // ==================== ICON TESTS ====================
    describe('Icon Tests', () => {

        test('Should render all navigation icons', () => {
            renderSidebar();

            // Icons are rendered by lucide-react, check for their containers
            const navItems = document.querySelectorAll('.nav-item');
            expect(navItems.length).toBeGreaterThanOrEqual(6);

            // Each nav item should have an SVG icon
            navItems.forEach(item => {
                const svg = item.querySelector('svg');
                expect(svg).toBeInTheDocument();
            });
        });

        test('Should render LayoutDashboard icon for Dashboard', () => {
            renderSidebar();

            const dashboardButton = screen.getByTitle('Dashboard');
            const svg = dashboardButton.querySelector('svg');
            expect(svg).toBeInTheDocument();
        });

        test('Should render logout icon with correct class', () => {
            renderSidebar();

            const logoutButton = screen.getByTitle('Logout');
            expect(logoutButton).toHaveClass('logout');
            const svg = logoutButton.querySelector('svg');
            expect(svg).toBeInTheDocument();
        });
    });

    // ==================== ACCESSIBILITY TESTS ====================
    describe('Accessibility Tests', () => {

        test('Should have title attributes for all nav items', () => {
            renderSidebar();

            const navButtons = document.querySelectorAll('.nav-item');
            navButtons.forEach(button => {
                expect(button).toHaveAttribute('title');
            });
        });

        test('Should have semantic nav element', () => {
            renderSidebar();

            const nav = document.querySelector('nav.side-nav');
            expect(nav).toBeInTheDocument();
        });

        test('Should have aside element for sidebar', () => {
            renderSidebar();

            const aside = document.querySelector('aside.sidebar');
            expect(aside).toBeInTheDocument();
        });

        test('Should have alt text for logo image', () => {
            renderSidebar();

            const logo = screen.getByAltText('LinguaAble Logo');
            expect(logo).toHaveAttribute('alt', 'LinguaAble Logo');
        });

        test('Should have clickable buttons for navigation', () => {
            renderSidebar();

            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThanOrEqual(6);
        });
    });

    // ==================== STRUCTURE TESTS ====================
    describe('Structure Tests', () => {

        test('Should have logo section at top', () => {
            renderSidebar();

            const logoSection = document.querySelector('.logo-section');
            const sidebar = document.querySelector('.sidebar');

            expect(logoSection).toBeInTheDocument();
            expect(sidebar.firstElementChild).toEqual(logoSection);
        });

        test('Should have navigation section in middle', () => {
            renderSidebar();

            const nav = document.querySelector('.side-nav');
            const sidebar = document.querySelector('.sidebar');

            expect(nav).toBeInTheDocument();
            expect(sidebar.children[1]).toEqual(nav);
        });

        test('Should have footer section at bottom', () => {
            renderSidebar();

            const footer = document.querySelector('.side-footer');
            expect(footer).toBeInTheDocument();
        });

        test('Should have Settings and Logout in footer', () => {
            renderSidebar();

            const footer = document.querySelector('.side-footer');
            const settingsButton = footer.querySelector('[title="Settings"]');
            const logoutButton = footer.querySelector('[title="Logout"]');

            expect(settingsButton).toBeInTheDocument();
            expect(logoutButton).toBeInTheDocument();
        });

        test('Should have main nav items in side-nav', () => {
            renderSidebar();

            const nav = document.querySelector('.side-nav');
            const dashboardButton = nav.querySelector('[title="Dashboard"]');
            const lessonsButton = nav.querySelector('[title="Lessons"]');
            const leaderboardButton = nav.querySelector('[title="Leaderboard"]');

            expect(dashboardButton).toBeInTheDocument();
            expect(lessonsButton).toBeInTheDocument();
            expect(leaderboardButton).toBeInTheDocument();
        });
    });

    // ==================== INTERACTION TESTS ====================
    describe('Interaction Tests', () => {

        test('Should be able to click all navigation items', async () => {
            const user = userEvent.setup();
            renderSidebar();

            const dashboardBtn = screen.getByTitle('Dashboard');
            const lessonsBtn = screen.getByTitle('Lessons');
            const leaderboardBtn = screen.getByTitle('Leaderboard');
            const settingsBtn = screen.getByTitle('Settings');

            await user.click(dashboardBtn);
            await user.click(lessonsBtn);
            await user.click(leaderboardBtn);
            await user.click(settingsBtn);

            expect(mockNavigate).toHaveBeenCalledTimes(4);
        });

        test('Should handle rapid navigation clicks', async () => {
            const user = userEvent.setup();
            renderSidebar();

            const dashboardBtn = screen.getByTitle('Dashboard');
            const lessonsBtn = screen.getByTitle('Lessons');

            await user.click(dashboardBtn);
            await user.click(lessonsBtn);
            await user.click(dashboardBtn);

            expect(mockNavigate).toHaveBeenCalledTimes(3);
        });

        test('Should navigate even when sidebar is collapsed', async () => {
            const user = userEvent.setup();
            renderSidebar();

            const sidebar = document.querySelector('.sidebar');
            expect(sidebar).toHaveClass('collapsed');

            const dashboardBtn = screen.getByTitle('Dashboard');
            await user.click(dashboardBtn);

            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    // ==================== CSS CLASS TESTS ====================
    describe('CSS Class Tests', () => {

        test('Should have correct nav-item class for all buttons', () => {
            renderSidebar();

            const buttons = document.querySelectorAll('.nav-item');
            expect(buttons.length).toBeGreaterThanOrEqual(6);
        });

        test('Should have branding-container class', () => {
            renderSidebar();

            const brandingContainer = document.querySelector('.branding-container');
            expect(brandingContainer).toBeInTheDocument();
        });

        test('Should have logo-image class on image', () => {
            renderSidebar();

            const logo = document.querySelector('.logo-image');
            expect(logo).toBeInTheDocument();
            expect(logo.tagName).toBe('IMG');
        });
    });

    // ==================== EDGE CASES ====================
    describe('Edge Cases', () => {

        test('Should handle unknown pathname gracefully', () => {
            mockLocationPathname = '/unknown-route';
            renderSidebar();

            const activeButtons = document.querySelectorAll('.nav-item.active');
            expect(activeButtons).toHaveLength(0);
        });

        test('Should not break with empty localStorage', () => {
            localStorageMock.clear();

            expect(() => renderSidebar()).not.toThrow();
        });

        test('Should handle multiple rapid hover events', async () => {
            const user = userEvent.setup();
            renderSidebar();

            const sidebar = document.querySelector('.sidebar');

            await user.hover(sidebar);
            await user.unhover(sidebar);
            await user.hover(sidebar);
            await user.unhover(sidebar);

            // Should not crash
            expect(sidebar).toBeInTheDocument();
        });
    });
});