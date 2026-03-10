import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Practice from '../pages/Practice';

// ── Mock CSS ──────────────────────────────────────────────────────────────────
vi.mock('../Dashboard.css', () => ({}));

// ── Helper ────────────────────────────────────────────────────────────────────
const renderPractice = () =>
    render(
        <BrowserRouter>
            <Practice />
        </BrowserRouter>
    );

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('Practice Component Tests', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ==================== RENDERING TESTS ====================
    describe('Rendering Tests', () => {

        test('Should render subtitle text', () => {
            renderPractice();
            expect(screen.getByText(/Sharpen your skills/i)).toBeInTheDocument();
        });

        test('Should render placeholder content text', () => {
            renderPractice();
            expect(screen.getByText(/Practice Content Goes Here/i)).toBeInTheDocument();
        });

        test('Should render streak pill with 5 Day Streak', () => {
            renderPractice();
            const streakPill = document.querySelector('.stat-pill.streak');
            expect(streakPill).toBeInTheDocument();
            expect(streakPill).toHaveTextContent('5 Day Streak');
        });

        test('Should render notification bell button', () => {
            renderPractice();
            const notifBtn = document.querySelector('.notif-btn');
            expect(notifBtn).toBeInTheDocument();
        });

        test('Should render profile avatar with correct image', () => {
            renderPractice();
            const avatar = screen.getByAltText(/User/i);
            expect(avatar).toBeInTheDocument();
            expect(avatar).toHaveAttribute('src', expect.stringContaining('Arjun'));
        });
    });

    // ==================== CSS STRUCTURE TESTS ====================
    describe('CSS Structure Tests', () => {

        test('Should render content-header', () => {
            renderPractice();
            expect(document.querySelector('.content-header')).toBeInTheDocument();
        });

        test('Should render greeting container', () => {
            renderPractice();
            expect(document.querySelector('.greeting')).toBeInTheDocument();
        });

        test('Should render header-stats container', () => {
            renderPractice();
            expect(document.querySelector('.header-stats')).toBeInTheDocument();
        });

        test('Should render dashboard-grid container', () => {
            renderPractice();
            expect(document.querySelector('.dashboard-grid')).toBeInTheDocument();
        });

        test('Should render profile-avatar container', () => {
            renderPractice();
            expect(document.querySelector('.profile-avatar')).toBeInTheDocument();
        });
    });

    // ==================== ACCESSIBILITY TESTS ====================
    describe('Accessibility Tests', () => {

        test('Should have alt text on profile avatar image', () => {
            renderPractice();
            const img = screen.getByAltText(/User/i);
            expect(img).toHaveAttribute('alt', 'User');
        });

        test('Should render header as a header element', () => {
            renderPractice();
            const header = document.querySelector('header.content-header');
            expect(header).toBeInTheDocument();
        });
    });
});