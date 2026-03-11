// Unit tests for LandingPage component (Updated for new SaaS UI)
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';

// Mock navigate function at module level
const mockNavigate = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const renderLandingPage = () => {
    return render(
        <BrowserRouter>
            <LandingPage />
        </BrowserRouter>
    );
};

describe('LandingPage Component Tests', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        mockNavigate.mockClear();
    });

    // ==================== RENDERING TESTS ====================
    test('Should render landing page root container', () => {
        renderLandingPage();

        const root = document.querySelector('.zn-root');
        expect(root).toBeInTheDocument();
    });

    test('Should render logo image', () => {
        renderLandingPage();

        const logo = screen.getByAltText(/LinguaAble mascot/i);
        expect(logo).toBeInTheDocument();
        expect(logo).toHaveClass('zn-logo-img');
    });

    test('Should render hero text correctly', () => {
        renderLandingPage();

        expect(document.querySelector('.zn-hero')).toBeInTheDocument();
        // Check for torn headline texts
        expect(screen.getByText(/Learn/i, { selector: '.zn-h1-learn' })).toBeInTheDocument();
        expect(screen.getByText(/made for the/i, { selector: '.zn-h1-if' })).toBeInTheDocument();
        
        // Body text
        expect(screen.getByText(/Short bursts. Voice practice. Real Hindi. Zero overwhelm/i)).toBeInTheDocument();
    });

    test('Should render Sign In and Sign Up buttons in nav', () => {
        renderLandingPage();

        const signInButtons = screen.getAllByText(/sign in/i);
        expect(signInButtons.length).toBeGreaterThan(0);
        
        const signUpButton = screen.getByText('SIGN UP');
        expect(signUpButton).toBeInTheDocument();
    });

    // ==================== FEATURES SECTION TESTS ====================
    test('Should render features section title', () => {
        renderLandingPage();

        expect(screen.getByText("what's inside")).toBeInTheDocument();
        expect(document.querySelector('.zn-features-h2')).toBeInTheDocument();
    });

    test('Should render feature cards', () => {
        renderLandingPage();

        // New feature cards text
        expect(screen.getByText('ADHD-First')).toBeInTheDocument();
        expect(screen.getByText('Dyslexia Mode')).toBeInTheDocument();
        expect(screen.getByText('Voice AI')).toBeInTheDocument();
        expect(screen.getByText('Adaptive Pace')).toBeInTheDocument();
        expect(screen.getByText('Streak XP')).toBeInTheDocument();
        expect(screen.getByText('India-Built')).toBeInTheDocument();
    });

    // ==================== HOW IT WORKS SECTION TESTS ====================
    test('Should render how it works section', () => {
        renderLandingPage();

        expect(screen.getByText('how it works')).toBeInTheDocument();
        expect(screen.getByText('tell us how you learn')).toBeInTheDocument();
        expect(screen.getByText('do a tiny lesson')).toBeInTheDocument();
        expect(screen.getByText('watch it stick')).toBeInTheDocument();
    });

    // ==================== NAVIGATION TESTS ====================
    test('Should navigate to login page when nav Sign In clicked', async () => {
        const user = userEvent.setup();
        renderLandingPage();

        const navSignIn = document.querySelector('.zn-link-btn');
        await user.click(navSignIn);

        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('Should navigate to signup page when nav SIGN UP clicked', async () => {
        const user = userEvent.setup();
        renderLandingPage();

        const navSignUp = document.querySelector('.zn-stamp-btn');
        await user.click(navSignUp);

        expect(mockNavigate).toHaveBeenCalledWith('/signup');
    });

    // ==================== AUTO-LOGIN REDIRECT TESTS ====================
    test('Should check localStorage for existing token on mount', () => {
        const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');

        renderLandingPage();

        expect(getItemSpy).toHaveBeenCalledWith('token');

        getItemSpy.mockRestore();
    });

    test('Should redirect to dashboard if token exists', () => {
        localStorage.setItem('token', 'mock-token');

        renderLandingPage();

        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    test('Should not redirect if no token exists', () => {
        localStorage.removeItem('token');

        renderLandingPage();

        expect(mockNavigate).not.toHaveBeenCalled();
    });
});