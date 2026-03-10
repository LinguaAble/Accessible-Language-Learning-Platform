import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AccessibilityWidget from '../components/AccessibilityWidget';

// ── Mock CSS ──────────────────────────────────────────────────────────────────
vi.mock('../components/AccessibilityWidget.css', () => ({}));

// ── Mock UserContext ──────────────────────────────────────────────────────────
const mockUpdatePreferences = vi.fn();
let mockPreferences = {
    fontSize: 'medium',
    theme: 'dark',
    dyslexiaFont: false,
    colorOverlay: 'none',
};

vi.mock('../context/UserContext', () => ({
    useUser: () => ({
        preferences: mockPreferences,
        updatePreferences: mockUpdatePreferences,
    }),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────
const renderWidget = (path = '/dashboard') =>
    render(
        <MemoryRouter initialEntries={[path]}>
            <AccessibilityWidget />
        </MemoryRouter>
    );

// opens the menu and returns the user instance
const openMenu = async () => {
    const user = userEvent.setup();
    renderWidget();
    await user.click(screen.getByRole('button', { name: /accessibility options/i }));
    return user;
};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('AccessibilityWidget Component Tests', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockPreferences = {
            fontSize: 'medium',
            theme: 'dark',
            dyslexiaFont: false,
            colorOverlay: 'none',
        };
    });

    // ==================== VISIBILITY TESTS ====================
    describe('Visibility Tests', () => {

        test('Should render FAB button on normal pages', () => {
            renderWidget('/dashboard');
            expect(screen.getByRole('button', { name: /accessibility options/i })).toBeInTheDocument();
        });

        test('Should return null on /learn route', () => {
            renderWidget('/learn');
            expect(screen.queryByRole('button', { name: /accessibility options/i })).not.toBeInTheDocument();
        });

        test('Should NOT show menu panel on initial render', () => {
            renderWidget();
            expect(screen.queryByText(/Accessibility Tools/i)).not.toBeInTheDocument();
        });

        test('Should have accessibility-widget class on wrapper', () => {
            renderWidget();
            expect(document.querySelector('.accessibility-widget')).toBeInTheDocument();
        });

        test('Should have open class on wrapper when menu is open', async () => {
            await openMenu();
            expect(document.querySelector('.accessibility-widget.open')).toBeInTheDocument();
        });
    });

    // ==================== OPEN / CLOSE TESTS ====================
    describe('Open / Close Tests', () => {

        test('Should open menu when FAB is clicked', async () => {
            await openMenu();
            expect(screen.getByText(/Accessibility Tools/i)).toBeInTheDocument();
        });

        test('Should close menu when FAB is clicked again', async () => {
            const user = userEvent.setup();
            renderWidget();
            const fab = screen.getByRole('button', { name: /accessibility options/i });

            await user.click(fab); // open
            await user.click(fab); // close

            expect(screen.queryByText(/Accessibility Tools/i)).not.toBeInTheDocument();
        });

        test('Should close menu when X close button is clicked', async () => {
            await openMenu();
            expect(screen.getByText(/Accessibility Tools/i)).toBeInTheDocument();

            const user = userEvent.setup();
            await user.click(document.querySelector('.close-btn'));

            expect(screen.queryByText(/Accessibility Tools/i)).not.toBeInTheDocument();
        });

        test('Should close menu when clicking outside', async () => {
            await openMenu();
            expect(screen.getByText(/Accessibility Tools/i)).toBeInTheDocument();

            const user = userEvent.setup();
            await user.click(document.body);

            await waitFor(() => {
                expect(screen.queryByText(/Accessibility Tools/i)).not.toBeInTheDocument();
            });
        });

        test('Should show accessibility-menu element when open', async () => {
            await openMenu();
            expect(document.querySelector('.accessibility-menu')).toBeInTheDocument();
        });
    });

    // ==================== STRUCTURE TESTS ====================
    describe('Structure Tests', () => {

        test('Should render accessibility-header inside menu', async () => {
            await openMenu();
            expect(document.querySelector('.accessibility-header')).toBeInTheDocument();
        });

        test('Should render exactly 4 accessibility sections', async () => {
            await openMenu();
            expect(document.querySelectorAll('.accessibility-section')).toHaveLength(4);
        });

        test('FAB should have correct aria-label', () => {
            renderWidget();
            expect(screen.getByLabelText(/Accessibility Options/i)).toBeInTheDocument();
        });

        test('FAB should have accessibility-fab class', () => {
            renderWidget();
            expect(document.querySelector('.accessibility-fab')).toBeInTheDocument();
        });
    });

    // ==================== FONT SIZE TESTS ====================
    describe('Font Size Tests', () => {

        test('Should render Font Size section label', async () => {
            await openMenu();
            expect(screen.getByText(/Font Size/i)).toBeInTheDocument();
        });

        test('Should call updatePreferences with small for first font button', async () => {
            const user = await openMenu();
            const fontBtns = document.querySelectorAll('.accessibility-section')[0].querySelectorAll('.tool-btn');
            await user.click(fontBtns[0]);
            expect(mockUpdatePreferences).toHaveBeenCalledWith({ fontSize: 'small' });
        });

        test('Should call updatePreferences with medium for second font button', async () => {
            const user = await openMenu();
            const fontBtns = document.querySelectorAll('.accessibility-section')[0].querySelectorAll('.tool-btn');
            await user.click(fontBtns[1]);
            expect(mockUpdatePreferences).toHaveBeenCalledWith({ fontSize: 'medium' });
        });

        test('Should call updatePreferences with large for third font button', async () => {
            const user = await openMenu();
            const fontBtns = document.querySelectorAll('.accessibility-section')[0].querySelectorAll('.tool-btn');
            await user.click(fontBtns[2]);
            expect(mockUpdatePreferences).toHaveBeenCalledWith({ fontSize: 'large' });
        });

        test('Should mark medium button active when fontSize is medium', async () => {
            mockPreferences = { ...mockPreferences, fontSize: 'medium' };
            await openMenu();
            const fontBtns = document.querySelectorAll('.accessibility-section')[0].querySelectorAll('.tool-btn');
            expect(fontBtns[1]).toHaveClass('active');
            expect(fontBtns[0]).not.toHaveClass('active');
            expect(fontBtns[2]).not.toHaveClass('active');
        });

        test('Should mark small button active when fontSize is small', async () => {
            mockPreferences = { ...mockPreferences, fontSize: 'small' };
            await openMenu();
            const fontBtns = document.querySelectorAll('.accessibility-section')[0].querySelectorAll('.tool-btn');
            expect(fontBtns[0]).toHaveClass('active');
        });

        test('Should mark large button active when fontSize is large', async () => {
            mockPreferences = { ...mockPreferences, fontSize: 'large' };
            await openMenu();
            const fontBtns = document.querySelectorAll('.accessibility-section')[0].querySelectorAll('.tool-btn');
            expect(fontBtns[2]).toHaveClass('active');
        });
    });

    // ==================== THEME TESTS ====================
    describe('Theme Tests', () => {

        test('Should render Theme Design section label', async () => {
            await openMenu();
            expect(screen.getByText(/Theme Design/i)).toBeInTheDocument();
        });

        test('Should render Light and Dark buttons', async () => {
            await openMenu();
            expect(screen.getByText(/Light/i)).toBeInTheDocument();
            expect(screen.getByText(/Dark/i)).toBeInTheDocument();
        });

        test('Should call updatePreferences with light when Light clicked', async () => {
            const user = await openMenu();
            const themeBtns = document.querySelectorAll('.accessibility-section')[1].querySelectorAll('.tool-btn');
            await user.click(themeBtns[0]);
            expect(mockUpdatePreferences).toHaveBeenCalledWith({ theme: 'light' });
        });

        test('Should call updatePreferences with dark when Dark clicked', async () => {
            const user = await openMenu();
            const themeBtns = document.querySelectorAll('.accessibility-section')[1].querySelectorAll('.tool-btn');
            await user.click(themeBtns[1]);
            expect(mockUpdatePreferences).toHaveBeenCalledWith({ theme: 'dark' });
        });

        test('Should mark Dark button active when theme is dark', async () => {
            mockPreferences = { ...mockPreferences, theme: 'dark' };
            await openMenu();
            const themeBtns = document.querySelectorAll('.accessibility-section')[1].querySelectorAll('.tool-btn');
            expect(themeBtns[1]).toHaveClass('active');
            expect(themeBtns[0]).not.toHaveClass('active');
        });

        test('Should mark Light button active when theme is light', async () => {
            mockPreferences = { ...mockPreferences, theme: 'light' };
            await openMenu();
            const themeBtns = document.querySelectorAll('.accessibility-section')[1].querySelectorAll('.tool-btn');
            expect(themeBtns[0]).toHaveClass('active');
        });
    });

    // ==================== DYSLEXIA FONT TESTS ====================
    describe('Dyslexia Font Tests', () => {

        test('Should render Dyslexia Friendly Font section label', async () => {
            await openMenu();
            expect(screen.getByText(/Dyslexia Friendly Font/i)).toBeInTheDocument();
        });

        test('Should show OFF text when dyslexiaFont is false', async () => {
            mockPreferences = { ...mockPreferences, dyslexiaFont: false };
            await openMenu();
            expect(screen.getByText('OFF')).toBeInTheDocument();
        });

        test('Should show ON text when dyslexiaFont is true', async () => {
            mockPreferences = { ...mockPreferences, dyslexiaFont: true };
            await openMenu();
            expect(screen.getByText('ON')).toBeInTheDocument();
        });

        test('Should call updatePreferences toggling dyslexiaFont false → true', async () => {
            mockPreferences = { ...mockPreferences, dyslexiaFont: false };
            const user = await openMenu();
            await user.click(screen.getByText('OFF'));
            expect(mockUpdatePreferences).toHaveBeenCalledWith({ dyslexiaFont: true });
        });

        test('Should call updatePreferences toggling dyslexiaFont true → false', async () => {
            mockPreferences = { ...mockPreferences, dyslexiaFont: true };
            const user = await openMenu();
            await user.click(screen.getByText('ON'));
            expect(mockUpdatePreferences).toHaveBeenCalledWith({ dyslexiaFont: false });
        });

        test('Should mark dyslexia button active when dyslexiaFont is true', async () => {
            mockPreferences = { ...mockPreferences, dyslexiaFont: true };
            await openMenu();
            const dyslexiaBtn = document.querySelectorAll('.accessibility-section')[2].querySelector('.tool-btn');
            expect(dyslexiaBtn).toHaveClass('active');
        });

        test('Should NOT mark dyslexia button active when dyslexiaFont is false', async () => {
            mockPreferences = { ...mockPreferences, dyslexiaFont: false };
            await openMenu();
            const dyslexiaBtn = document.querySelectorAll('.accessibility-section')[2].querySelector('.tool-btn');
            expect(dyslexiaBtn).not.toHaveClass('active');
        });
    });

    // ==================== COLOR OVERLAY TESTS ====================
    describe('Color Overlay Tests', () => {

        test('Should render Reading Color Overlay section label', async () => {
            await openMenu();
            expect(screen.getByText(/Reading Color Overlay/i)).toBeInTheDocument();
        });

        test('Should render exactly 5 color overlay buttons', async () => {
            await openMenu();
            expect(document.querySelectorAll('.color-btn')).toHaveLength(5);
        });

        const overlays = [
            { value: 'none',   title: 'None' },
            { value: 'yellow', title: 'Yellow' },
            { value: 'blue',   title: 'Blue' },
            { value: 'green',  title: 'Green' },
            { value: 'rose',   title: 'Rose' },
        ];

        overlays.forEach(({ value, title }) => {
            test(`Should call updatePreferences with colorOverlay "${value}" when ${title} clicked`, async () => {
                const user = await openMenu();
                await user.click(screen.getByTitle(title));
                expect(mockUpdatePreferences).toHaveBeenCalledWith({ colorOverlay: value });
            });
        });

        test('Should mark yellow button active when colorOverlay is yellow', async () => {
            mockPreferences = { ...mockPreferences, colorOverlay: 'yellow' };
            await openMenu();
            expect(screen.getByTitle('Yellow')).toHaveClass('active');
            expect(screen.getByTitle('None')).not.toHaveClass('active');
        });

        test('Should mark None button active when colorOverlay is none', async () => {
            mockPreferences = { ...mockPreferences, colorOverlay: 'none' };
            await openMenu();
            expect(screen.getByTitle('None')).toHaveClass('active');
        });

        test('Should render all color button titles', async () => {
            await openMenu();
            overlays.forEach(({ title }) => {
                expect(screen.getByTitle(title)).toBeInTheDocument();
            });
        });
    });
});