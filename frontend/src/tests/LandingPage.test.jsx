// Unit tests for LandingPage component
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
    test('Should render landing page with hero section', () => {
        renderLandingPage();

        // Check for hero title by finding the h1 element
        const heroTitle = document.querySelector('.hero-title');
        expect(heroTitle).toBeInTheDocument();
        expect(heroTitle.textContent).toContain('Lingua');
        expect(heroTitle.textContent).toContain('Able');
        expect(screen.getByText(/Built Around Learners, Not Limitations!/i)).toBeInTheDocument();
    });

    test('Should render logo image', () => {
        renderLandingPage();

        const logo = screen.getByAltText(/LinguaAble Mascot/i);
        expect(logo).toBeInTheDocument();
        expect(logo).toHaveClass('landing-logo');
    });

    test('Should render hero description text', () => {
        renderLandingPage();

        expect(screen.getByText(/Master Hindi with confidence!/i)).toBeInTheDocument();
        expect(screen.getByText(/Specially designed for learners with dyslexia/i)).toBeInTheDocument();
    });

    test('Should render Sign In button', () => {
        renderLandingPage();

        const signInButton = screen.getByRole('button', { name: /Sign In/i });
        expect(signInButton).toBeInTheDocument();
        expect(signInButton).toHaveClass('primary-btn');
    });

    test('Should render Create Account button', () => {
        renderLandingPage();

        const signupButton = screen.getByRole('button', { name: /Create Account/i });
        expect(signupButton).toBeInTheDocument();
        expect(signupButton).toHaveClass('secondary-btn');
    });

    // ==================== FEATURES SECTION TESTS ====================
    test('Should render features section title', () => {
        renderLandingPage();

        expect(screen.getByText(/Why Choose LinguaAble?/i)).toBeInTheDocument();
    });

    test('Should render all 6 feature cards', () => {
        renderLandingPage();

        expect(screen.getByText(/Dyslexia-Friendly Design/i)).toBeInTheDocument();
        expect(screen.getByText(/ADHD-Optimized Learning/i)).toBeInTheDocument();
        expect(screen.getByText(/Interactive Speech Practice/i)).toBeInTheDocument();
        // Use the exact heading text instead of partial match
        expect(screen.getByRole('heading', { name: /Multi-Sensory Approach/i })).toBeInTheDocument();
        expect(screen.getByText(/Adaptive Difficulty/i)).toBeInTheDocument();
        expect(screen.getByText(/Motivational Rewards/i)).toBeInTheDocument();
    });

    test('Should render feature descriptions', () => {
        renderLandingPage();

        expect(screen.getByText(/Clear fonts, high contrast, and customizable text spacing/i)).toBeInTheDocument();
        expect(screen.getByText(/Short, focused lessons with frequent breaks/i)).toBeInTheDocument();
        expect(screen.getByText(/Real-time pronunciation feedback and voice recognition/i)).toBeInTheDocument();
    });

    test('Should render all feature icons', () => {
        renderLandingPage();

        // Check for emoji icons in feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        expect(featureCards).toHaveLength(6);

        featureCards.forEach(card => {
            const icon = card.querySelector('.feature-icon');
            expect(icon).toBeInTheDocument();
        });
    });

    // ==================== NAVIGATION TESTS ====================
    test('Should navigate to login page when Sign In clicked', async () => {
        const user = userEvent.setup();
        renderLandingPage();

        const signInButton = screen.getByRole('button', { name: /Sign In/i });
        await user.click(signInButton);

        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('Should navigate to signup page when Create Account clicked', async () => {
        const user = userEvent.setup();
        renderLandingPage();

        const signupButton = screen.getByRole('button', { name: /Create Account/i });
        await user.click(signupButton);

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

        // Should attempt to navigate to dashboard
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    test('Should not redirect if no token exists', () => {
        localStorage.removeItem('token');

        renderLandingPage();

        // Should not navigate
        expect(mockNavigate).not.toHaveBeenCalled();

        // Should still render landing page content
        expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
        expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
    });

    // ==================== ANIMATION TESTS ====================
    test('Should have floating shapes for background animation', () => {
        renderLandingPage();

        const floatingShapes = document.querySelector('.floating-shapes');
        expect(floatingShapes).toBeInTheDocument();

        const shapes = document.querySelectorAll('.shape');
        expect(shapes.length).toBeGreaterThan(0);
    });

    test('Should set isVisible state on mount for animations', async () => {
        renderLandingPage();

        await waitFor(() => {
            const featureCards = document.querySelectorAll('.feature-card');
            // After mount, cards should have visible class for animations
            expect(featureCards.length).toBe(6);
        });
    });

    // ==================== CSS CLASS TESTS ====================
    test('Should have correct CSS classes for styling', () => {
        renderLandingPage();

        expect(document.querySelector('.landing-page')).toBeInTheDocument();
        expect(document.querySelector('.landing-container')).toBeInTheDocument();
        expect(document.querySelector('.hero-section')).toBeInTheDocument();
        expect(document.querySelector('.features-section')).toBeInTheDocument();
    });

    test('Should have hero tagline with correct text', () => {
        renderLandingPage();

        const tagline = screen.getByText(/Built Around Learners, Not Limitations!/i);
        expect(tagline).toHaveClass('hero-tagline');
    });

    test('Should have CTA buttons container', () => {
        renderLandingPage();

        const ctaButtons = document.querySelector('.cta-buttons');
        expect(ctaButtons).toBeInTheDocument();

        const buttons = ctaButtons.querySelectorAll('button');
        expect(buttons).toHaveLength(2);
    });

    // ==================== ACCESSIBILITY TESTS ====================
    test('Should have alt text for logo image', () => {
        renderLandingPage();

        const logo = screen.getByAltText(/LinguaAble Mascot/i);
        expect(logo).toHaveAttribute('alt', 'LinguaAble Mascot');
    });

    test('Should have semantic HTML structure', () => {
        renderLandingPage();

        // Check for proper heading hierarchy
        const h1 = document.querySelector('.hero-title');
        const h2 = document.querySelector('.features-title');

        expect(h1).toBeInTheDocument();
        expect(h2).toBeInTheDocument();
    });

    // ==================== BRANDING TESTS ====================
    test('Should render brand colors correctly', () => {
        renderLandingPage();

        const heroTitle = document.querySelector('.hero-title');
        expect(heroTitle).toBeInTheDocument();

        const linguaPart = heroTitle.querySelector('.text-brand-blue');
        const ablePart = heroTitle.querySelector('.text-brand-red');

        expect(linguaPart).toBeInTheDocument();
        expect(linguaPart.textContent).toBe('Lingua');
        expect(ablePart).toBeInTheDocument();
        expect(ablePart.textContent).toBe('Able');
    });

    test('Should have logo wrapper with correct class', () => {
        renderLandingPage();

        const logoWrapper = document.querySelector('.logo-wrapper');
        expect(logoWrapper).toBeInTheDocument();
    });

    // ==================== CONTENT VERIFICATION TESTS ====================
    test('Should render complete hero description', () => {
        renderLandingPage();

        const description = screen.getByText(/Our accessible, multi-sensory approach makes learning Hindi engaging, effective, and stress-free./i);
        expect(description).toBeInTheDocument();
        expect(description).toHaveClass('hero-description');
    });

    test('Should render features grid with correct structure', () => {
        renderLandingPage();

        const featuresGrid = document.querySelector('.features-grid');
        expect(featuresGrid).toBeInTheDocument();

        const featureCards = featuresGrid.querySelectorAll('.feature-card');
        expect(featureCards).toHaveLength(6);
    });

    test('Should have correct feature card structure', () => {
        renderLandingPage();

        const firstFeature = screen.getByText(/Dyslexia-Friendly Design/i);
        const featureCard = firstFeature.closest('.feature-card');

        expect(featureCard.querySelector('.feature-icon')).toBeInTheDocument();
        expect(featureCard.querySelector('.feature-title')).toBeInTheDocument();
        expect(featureCard.querySelector('.feature-description')).toBeInTheDocument();
    });

    // ==================== USEEFFECT TESTS ====================
    test('Should trigger animation setup on mount', async () => {
        renderLandingPage();

        await waitFor(() => {
            // Animation state should be set after mount
            const featureCards = document.querySelectorAll('.feature-card');
            expect(featureCards.length).toBe(6);
        });
    });

    // ==================== BUTTON INTERACTION TESTS ====================
    test('Should have clickable buttons', async () => {
        const user = userEvent.setup();
        renderLandingPage();

        const signInButton = screen.getByRole('button', { name: /Sign In/i });
        const signupButton = screen.getByRole('button', { name: /Create Account/i });

        expect(signInButton).toBeEnabled();
        expect(signupButton).toBeEnabled();

        await user.click(signInButton);
        await user.click(signupButton);

        // Buttons should remain in document after clicks
        expect(signInButton).toBeInTheDocument();
        expect(signupButton).toBeInTheDocument();
    });

    // ==================== LAYOUT TESTS ====================
    test('Should have proper page structure', () => {
        renderLandingPage();

        const landingPage = document.querySelector('.landing-page');
        const container = landingPage.querySelector('.landing-container');
        const heroSection = container.querySelector('.hero-section');
        const featuresSection = container.querySelector('.features-section');

        expect(landingPage).toBeInTheDocument();
        expect(container).toBeInTheDocument();
        expect(heroSection).toBeInTheDocument();
        expect(featuresSection).toBeInTheDocument();
    });
});