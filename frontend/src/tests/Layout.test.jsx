import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import React from 'react';

// Mock CSS import
vi.mock('../Dashboard.css', () => ({}));

// Helper function to render Layout with routing context
const renderLayout = (initialRoute = '/dashboard') => {
    return render(
        <MemoryRouter initialEntries={[initialRoute]}>
            <Routes>
                <Route path="/*" element={<Layout />}>
                    <Route path="dashboard" element={<div data-testid="dashboard-content">Dashboard Page</div>} />
                    <Route path="lessons" element={<div data-testid="lessons-content">Lessons Page</div>} />
                    <Route path="settings" element={<div data-testid="settings-content">Settings Page</div>} />
                </Route>
            </Routes>
        </MemoryRouter>
    );
};

describe('Layout Component Tests', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ==================== RENDERING TESTS ====================
    describe('Rendering Tests', () => {

        test('Should render the Layout component', () => {
            renderLayout();

            // Layout container should be present
            const container = document.querySelector('.dashboard-container');
            expect(container).toBeInTheDocument();
        });

        test('Should render Sidebar component', () => {
            renderLayout();

            const sidebar = document.querySelector('.sidebar');
            expect(sidebar).toBeInTheDocument();
        });

        test('Should render main content area', () => {
            renderLayout();

            const mainContent = document.querySelector('.main-content');
            expect(mainContent).toBeInTheDocument();
        });

        test('Should have correct CSS class structure', () => {
            renderLayout();

            const container = document.querySelector('.dashboard-container');
            const mainContent = document.querySelector('.main-content');

            expect(container).toHaveClass('dashboard-container');
            expect(mainContent).toHaveClass('main-content');
        });

        test('Should render with proper semantic HTML structure', () => {
            renderLayout();

            // Main element should be present
            const mainElement = document.querySelector('main');
            expect(mainElement).toBeInTheDocument();
            expect(mainElement).toHaveClass('main-content');
        });
    });

    // ==================== OUTLET RENDERING TESTS ====================
    describe('Outlet Rendering Tests', () => {

        test('Should render dashboard content through Outlet', () => {
            renderLayout('/dashboard');

            const dashboardContent = screen.getByTestId('dashboard-content');
            expect(dashboardContent).toBeInTheDocument();
            expect(dashboardContent).toHaveTextContent('Dashboard Page');
        });

        test('Should render lessons content through Outlet', () => {
            renderLayout('/lessons');

            const lessonsContent = screen.getByTestId('lessons-content');
            expect(lessonsContent).toBeInTheDocument();
            expect(lessonsContent).toHaveTextContent('Lessons Page');
        });

        test('Should render settings content through Outlet', () => {
            renderLayout('/settings');

            const settingsContent = screen.getByTestId('settings-content');
            expect(settingsContent).toBeInTheDocument();
            expect(settingsContent).toHaveTextContent('Settings Page');
        });

        test('Should render child routes inside main content area', () => {
            renderLayout('/dashboard');

            const mainContent = document.querySelector('.main-content');
            const dashboardContent = screen.getByTestId('dashboard-content');

            expect(mainContent).toContainElement(dashboardContent);
        });
    });

    // ==================== LAYOUT STRUCTURE TESTS ====================
    describe('Layout Structure Tests', () => {

        test('Should have sidebar as first child', () => {
            renderLayout();

            const container = document.querySelector('.dashboard-container');
            const sidebar = document.querySelector('.sidebar');

            expect(container.firstChild).toBe(sidebar);
        });

        test('Should have main content as second child', () => {
            renderLayout();

            const container = document.querySelector('.dashboard-container');
            const mainContent = document.querySelector('.main-content');

            expect(container.children[1]).toBe(mainContent);
        });

        test('Should maintain layout structure across different routes', () => {
            const { rerender } = renderLayout('/dashboard');

            // Check initial structure
            expect(document.querySelector('.dashboard-container')).toBeInTheDocument();
            expect(document.querySelector('.sidebar')).toBeInTheDocument();
            expect(document.querySelector('.main-content')).toBeInTheDocument();

            // Re-render with different route
            rerender(
                <MemoryRouter initialEntries={['/lessons']}>
                    <Routes>
                        <Route path="/*" element={<Layout />}>
                            <Route path="lessons" element={<div data-testid="lessons-content">Lessons Page</div>} />
                        </Route>
                    </Routes>
                </MemoryRouter>
            );

            // Structure should remain consistent
            expect(document.querySelector('.dashboard-container')).toBeInTheDocument();
            expect(document.querySelector('.sidebar')).toBeInTheDocument();
            expect(document.querySelector('.main-content')).toBeInTheDocument();
        });
    });

    // ==================== CONTAINER TESTS ====================
    describe('Container Tests', () => {

        test('Should have dashboard-container as wrapper element', () => {
            renderLayout();

            const container = document.querySelector('.dashboard-container');
            const sidebar = document.querySelector('.sidebar');
            const mainContent = document.querySelector('.main-content');

            expect(container).toContainElement(sidebar);
            expect(container).toContainElement(mainContent);
        });

        test('Should maintain consistent container structure', () => {
            renderLayout();

            const container = document.querySelector('.dashboard-container');
            
            // Should have exactly 2 direct children (Sidebar + main)
            expect(container.children).toHaveLength(2);
        });

        test('Should render as a div element', () => {
            renderLayout();

            const container = document.querySelector('.dashboard-container');
            expect(container.tagName).toBe('DIV');
        });
    });

    // ==================== MAIN CONTENT TESTS ====================
    describe('Main Content Tests', () => {

        test('Should render main element with correct tag', () => {
            renderLayout();

            const mainContent = document.querySelector('main.main-content');
            expect(mainContent).toBeInTheDocument();
            expect(mainContent.tagName).toBe('MAIN');
        });

        test('Should wrap Outlet component in main element', () => {
            renderLayout('/dashboard');

            const mainContent = document.querySelector('main.main-content');
            const outletContent = screen.getByTestId('dashboard-content');

            expect(mainContent).toContainElement(outletContent);
        });

    });

    // ==================== INTEGRATION TESTS ====================
    describe('Integration Tests', () => {

        test('Should work with Outlet for nested routing', () => {
            renderLayout('/dashboard');

            // Both Layout and child route should render
            expect(document.querySelector('.sidebar')).toBeInTheDocument();
            expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
        });

        test('Should maintain sidebar across all routes', () => {
            const { rerender } = renderLayout('/dashboard');

            expect(document.querySelector('.sidebar')).toBeInTheDocument();

            // Change route
            rerender(
                <MemoryRouter initialEntries={['/lessons']}>
                    <Routes>
                        <Route path="/*" element={<Layout />}>
                            <Route path="lessons" element={<div data-testid="lessons-content">Lessons Page</div>} />
                        </Route>
                    </Routes>
                </MemoryRouter>
            );

            // Sidebar should still be present
            expect(document.querySelector('.sidebar')).toBeInTheDocument();
        });
    });

    // ==================== COMPONENT ISOLATION TESTS ====================
    describe('Component Isolation Tests', () => {

        test('Should render Layout independently of child routes', () => {
            render(
                <MemoryRouter>
                    <Layout />
                </MemoryRouter>
            );

            expect(document.querySelector('.sidebar')).toBeInTheDocument();
            expect(document.querySelector('.main-content')).toBeInTheDocument();
        });

        test('Should not break when no child routes are defined', () => {
            render(
                <MemoryRouter>
                    <Routes>
                        <Route path="/*" element={<Layout />} />
                    </Routes>
                </MemoryRouter>
            );

            expect(document.querySelector('.sidebar')).toBeInTheDocument();
            expect(document.querySelector('.main-content')).toBeInTheDocument();
        });
    });

    // ==================== ACCESSIBILITY TESTS ====================
    describe('Accessibility Tests', () => {

        test('Should use semantic main element for content', () => {
            renderLayout();

            const mainElement = screen.getByRole('main');
            expect(mainElement).toBeInTheDocument();
            expect(mainElement).toHaveClass('main-content');
        });

        test('Should have proper landmark structure', () => {
            renderLayout('/dashboard');

            // Main landmark should exist
            const mainLandmark = screen.getByRole('main');
            expect(mainLandmark).toBeInTheDocument();

            // Content should be inside main landmark
            const content = screen.getByTestId('dashboard-content');
            expect(mainLandmark).toContainElement(content);
        });
    });

    // ==================== CSS CLASS TESTS ====================
    describe('CSS Class Tests', () => {

        test('Should apply dashboard-container class to wrapper', () => {
            renderLayout();

            const container = document.querySelector('.dashboard-container');
            expect(container).toBeInTheDocument();
            expect(container.className).toContain('dashboard-container');
        });

        test('Should apply main-content class to main element', () => {
            renderLayout();

            const mainContent = document.querySelector('.main-content');
            expect(mainContent).toBeInTheDocument();
            expect(mainContent.className).toContain('main-content');
        });

        test('Should maintain CSS classes across route changes', () => {
            const { rerender } = renderLayout('/dashboard');

            expect(document.querySelector('.dashboard-container')).toHaveClass('dashboard-container');
            expect(document.querySelector('.main-content')).toHaveClass('main-content');

            rerender(
                <MemoryRouter initialEntries={['/lessons']}>
                    <Routes>
                        <Route path="/*" element={<Layout />}>
                            <Route path="lessons" element={<div data-testid="lessons-content">Lessons</div>} />
                        </Route>
                    </Routes>
                </MemoryRouter>
            );

            expect(document.querySelector('.dashboard-container')).toHaveClass('dashboard-container');
            expect(document.querySelector('.main-content')).toHaveClass('main-content');
        });
    });

    // ==================== EDGE CASES ====================
    describe('Edge Cases', () => {

        test('Should handle empty Outlet gracefully', () => {
            render(
                <MemoryRouter initialEntries={['/nonexistent']}>
                    <Routes>
                        <Route path="/*" element={<Layout />} />
                    </Routes>
                </MemoryRouter>
            );

            expect(document.querySelector('.sidebar')).toBeInTheDocument();
            expect(document.querySelector('.main-content')).toBeInTheDocument();
        });

        test('Should render without errors', () => {
            expect(() => renderLayout()).not.toThrow();
        });

        test('Should maintain structure when rapidly switching routes', () => {
            const { rerender } = renderLayout('/dashboard');

            for (let i = 0; i < 5; i++) {
                rerender(
                    <MemoryRouter initialEntries={['/lessons']}>
                        <Routes>
                            <Route path="/*" element={<Layout />}>
                                <Route path="lessons" element={<div data-testid="lessons-content">Lessons</div>} />
                            </Route>
                        </Routes>
                    </MemoryRouter>
                );

                rerender(
                    <MemoryRouter initialEntries={['/dashboard']}>
                        <Routes>
                            <Route path="/*" element={<Layout />}>
                                <Route path="dashboard" element={<div data-testid="dashboard-content">Dashboard</div>} />
                            </Route>
                        </Routes>
                    </MemoryRouter>
                );
            }

            expect(document.querySelector('.sidebar')).toBeInTheDocument();
            expect(document.querySelector('.main-content')).toBeInTheDocument();
        });
    });

    // ==================== COMPONENT HIERARCHY TESTS ====================
    describe('Component Hierarchy Tests', () => {

        test('Should have correct parent-child relationship', () => {
            renderLayout('/dashboard');

            const container = document.querySelector('.dashboard-container');
            const sidebar = document.querySelector('.sidebar');
            const mainContent = document.querySelector('.main-content');

            expect(container.contains(sidebar)).toBe(true);
            expect(container.contains(mainContent)).toBe(true);
        });

        test('Should nest Outlet content inside main element', () => {
            renderLayout('/dashboard');

            const mainContent = document.querySelector('.main-content');
            const dashboardContent = screen.getByTestId('dashboard-content');

            expect(mainContent.contains(dashboardContent)).toBe(true);
        });

        test('Should preserve hierarchy across different routes', () => {
            const { rerender } = renderLayout('/dashboard');

            let container = document.querySelector('.dashboard-container');
            let mainContent = document.querySelector('.main-content');

            expect(container.contains(mainContent)).toBe(true);

            rerender(
                <MemoryRouter initialEntries={['/lessons']}>
                    <Routes>
                        <Route path="/*" element={<Layout />}>
                            <Route path="lessons" element={<div data-testid="lessons-content">Lessons</div>} />
                        </Route>
                    </Routes>
                </MemoryRouter>
            );

            container = document.querySelector('.dashboard-container');
            mainContent = document.querySelector('.main-content');

            expect(container.contains(mainContent)).toBe(true);
        });
    });
});