import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Settings from '../pages/Settings';
import { useUser } from '../context/UserContext';

// Mock CSS
vi.mock('../Dashboard.css', () => ({}));

// Mock UserContext
vi.mock('../context/UserContext');

// Mock FileReader for avatar upload tests
global.FileReader = class FileReader {
    readAsDataURL() {
        this.onloadend({ target: { result: 'data:image/png;base64,mockImageData' } });
    }
};

describe('Settings Component Tests', () => {
    const mockUpdatePreferences = vi.fn();
    const mockUpdateProfile = vi.fn();

    const mockUser = {
        email: 'test@example.com',
        username: 'testuser',
        fullName: 'Test User',
        age: '25',
        gender: 'male',
        bio: 'Test bio',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser',
        loginHistory: [
            { timestamp: '2026-02-10T10:00:00Z', device: 'Chrome on Windows' },
            { timestamp: '2026-02-09T15:30:00Z', device: 'Firefox on Mac' }
        ]
    };

    const mockPreferences = {
        theme: 'dark',
        soundEffects: true,
        animationReduced: false,
        fontSize: 'medium',
        dailyGoalMinutes: 10
    };

    beforeEach(() => {
        vi.clearAllMocks();
        useUser.mockReturnValue({
            user: mockUser,
            preferences: mockPreferences,
            todayProgress: 5,
            updatePreferences: mockUpdatePreferences,
            updateProfile: mockUpdateProfile
        });
        mockUpdateProfile.mockResolvedValue({ success: true });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // ===== RENDERING TESTS =====
    test('Should render Settings page with all sections', () => {
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        // Header
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText(/Manage your experience, profile, and preferences/i)).toBeInTheDocument();

        // Main sections
        expect(screen.getByText('Profile Information')).toBeInTheDocument();
        expect(screen.getByText('Display & Accessibility')).toBeInTheDocument();
        expect(screen.getByText('Learning Goals')).toBeInTheDocument();
        expect(screen.getByText(/Login History/i)).toBeInTheDocument();
    });

    test('Should display user profile information correctly', () => {
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('@testuser')).toBeInTheDocument();
        expect(screen.getByText('"Test bio"')).toBeInTheDocument();
        expect(screen.getByText(/25 years old/i)).toBeInTheDocument();
        expect(screen.getByText(/Male/i)).toBeInTheDocument();
    });

    // ===== THEME TOGGLE TESTS =====
    test('Should toggle theme from dark to minimalist', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        // Find the theme toggle button by finding the Dark Mode row
        const settingsRows = document.querySelectorAll('.settings-row');
        const themeRow = Array.from(settingsRows).find(row =>
            row.textContent.includes('Dark Mode')
        );
        const themeToggle = themeRow.querySelector('.toggle-btn');

        await user.click(themeToggle);

        expect(mockUpdatePreferences).toHaveBeenCalledWith({ theme: 'minimalist' });
    });

    test('Should toggle theme from minimalist to dark', async () => {
        useUser.mockReturnValue({
            user: mockUser,
            preferences: { ...mockPreferences, theme: 'minimalist' },
            todayProgress: 5,
            updatePreferences: mockUpdatePreferences,
            updateProfile: mockUpdateProfile
        });

        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        const settingsRows = document.querySelectorAll('.settings-row');
        const themeRow = Array.from(settingsRows).find(row =>
            row.textContent.includes('Dark Mode')
        );
        const themeToggle = themeRow.querySelector('.toggle-btn');

        await user.click(themeToggle);

        expect(mockUpdatePreferences).toHaveBeenCalledWith({ theme: 'dark' });
    });

    // ===== SOUND EFFECTS TOGGLE TESTS =====
    test('Should toggle sound effects off', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        const settingsRows = document.querySelectorAll('.settings-row');
        const soundRow = Array.from(settingsRows).find(row =>
            row.textContent.includes('Sound Effects')
        );
        const soundToggle = soundRow.querySelector('.toggle-btn');

        await user.click(soundToggle);

        expect(mockUpdatePreferences).toHaveBeenCalledWith({ soundEffects: false });
    });

    test('Should toggle sound effects on', async () => {
        useUser.mockReturnValue({
            user: mockUser,
            preferences: { ...mockPreferences, soundEffects: false },
            todayProgress: 5,
            updatePreferences: mockUpdatePreferences,
            updateProfile: mockUpdateProfile
        });

        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        const settingsRows = document.querySelectorAll('.settings-row');
        const soundRow = Array.from(settingsRows).find(row =>
            row.textContent.includes('Sound Effects')
        );
        const soundToggle = soundRow.querySelector('.toggle-btn');

        await user.click(soundToggle);

        expect(mockUpdatePreferences).toHaveBeenCalledWith({ soundEffects: true });
    });

    // ===== ANIMATION TOGGLE TESTS =====
    test('Should toggle reduce motion on', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        const settingsRows = document.querySelectorAll('.settings-row');
        const animationRow = Array.from(settingsRows).find(row =>
            row.textContent.includes('Reduce Motion')
        );
        const animationToggle = animationRow.querySelector('.toggle-btn');

        await user.click(animationToggle);

        expect(mockUpdatePreferences).toHaveBeenCalledWith({ animationReduced: true });
    });

    // ===== FONT SIZE TESTS =====
    test('Should change font size to small', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        const smallFontBtn = screen.getAllByText('A').find(btn =>
            btn.closest('.toggle-btn')?.style.fontSize === '0.8rem'
        );

        await user.click(smallFontBtn);

        expect(mockUpdatePreferences).toHaveBeenCalledWith({ fontSize: 'small' });
    });

    test('Should change font size to large', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        const largeFontBtn = screen.getAllByText('A').find(btn =>
            btn.closest('.toggle-btn')?.style.fontSize === '1.2rem'
        );

        await user.click(largeFontBtn);

        expect(mockUpdatePreferences).toHaveBeenCalledWith({ fontSize: 'large' });
    });

    test('Should display active state for current font size', () => {
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        const mediumFontBtn = screen.getAllByText('A').find(btn =>
            btn.closest('.toggle-btn')?.style.fontSize === '1rem'
        );

        expect(mediumFontBtn.closest('.toggle-btn')).toHaveClass('active');
    });

    // ===== DAILY GOAL TESTS =====
    test('Should change daily goal to 5 minutes', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        const fiveMinBtn = screen.getByText('5 min');
        await user.click(fiveMinBtn);

        expect(mockUpdatePreferences).toHaveBeenCalledWith({ dailyGoalMinutes: 5 });
    });

    test('Should change daily goal to 15 minutes', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        const fifteenMinBtn = screen.getByText('15 min');
        await user.click(fifteenMinBtn);

        expect(mockUpdatePreferences).toHaveBeenCalledWith({ dailyGoalMinutes: 15 });
    });

    test('Should display active state for current daily goal', () => {
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        const tenMinBtn = screen.getByText('10 min');
        expect(tenMinBtn.closest('.toggle-btn')).toHaveClass('active');
    });

    // ===== PROFILE EDITING TESTS =====
    test('Should toggle edit profile mode', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        const editBtn = screen.getByText('Edit Profile');
        await user.click(editBtn);

        // Should show form inputs
        expect(screen.getByPlaceholderText('Enter your display name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Age')).toBeInTheDocument();

        // Button should change to Cancel
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    test('Should update profile fields in edit mode', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        // Enter edit mode
        await user.click(screen.getByText('Edit Profile'));

        // Update username
        const usernameInput = screen.getByPlaceholderText('Enter your display name');
        await user.clear(usernameInput);
        await user.type(usernameInput, 'newusername');

        expect(usernameInput).toHaveValue('newusername');

        // Update full name
        const fullNameInput = screen.getByPlaceholderText('Enter your full name');
        await user.clear(fullNameInput);
        await user.type(fullNameInput, 'New Full Name');

        expect(fullNameInput).toHaveValue('New Full Name');
    });

    test('Should save profile changes', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        // Enter edit mode
        await user.click(screen.getByText('Edit Profile'));

        // Update fields
        const usernameInput = screen.getByPlaceholderText('Enter your display name');
        await user.clear(usernameInput);
        await user.type(usernameInput, 'updateduser');

        const bioInput = screen.getByPlaceholderText('Write something about yourself...');
        await user.clear(bioInput);
        await user.type(bioInput, 'Updated bio text');

        // Save
        const saveBtn = screen.getByText('Save Profile');
        await user.click(saveBtn);

        expect(mockUpdateProfile).toHaveBeenCalledWith(
            expect.objectContaining({
                username: 'updateduser',
                bio: 'Updated bio text'
            })
        );

        // Should exit edit mode after save
        await waitFor(() => {
            expect(screen.queryByText('Save Profile')).not.toBeInTheDocument();
        });
    });

    test('Should update age and gender fields', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        await user.click(screen.getByText('Edit Profile'));

        // Update age
        const ageInput = screen.getByPlaceholderText('Age');
        await user.clear(ageInput);
        await user.type(ageInput, '30');
        expect(ageInput).toHaveValue(30);

        // Update gender - find select element by role
        const genderSelect = screen.getByRole('combobox');
        await user.selectOptions(genderSelect, 'female');
        expect(genderSelect).toHaveValue('female');
    });

    test('Should enforce bio character limit', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        await user.click(screen.getByText('Edit Profile'));

        const bioInput = screen.getByPlaceholderText('Write something about yourself...');
        expect(bioInput).toHaveAttribute('maxLength', '500');
    });

    test('Should cancel profile editing', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        // Enter edit mode
        await user.click(screen.getByText('Edit Profile'));

        // Make changes
        const usernameInput = screen.getByPlaceholderText('Enter your display name');
        await user.clear(usernameInput);
        await user.type(usernameInput, 'changedname');

        // Cancel
        await user.click(screen.getByText('Cancel'));

        // Should exit edit mode without saving
        expect(screen.queryByPlaceholderText('Enter your display name')).not.toBeInTheDocument();
        expect(mockUpdateProfile).not.toHaveBeenCalled();
    });

    // ===== AVATAR SELECTION TESTS =====
    test('Should select preset male avatar', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        await user.click(screen.getByText('Edit Profile'));

        // Find and click a male avatar
        const maleAvatar = screen.getByAltText('Male avatar 1');
        await user.click(maleAvatar.parentElement);

        // Save profile
        await user.click(screen.getByText('Save Profile'));

        expect(mockUpdateProfile).toHaveBeenCalledWith(
            expect.objectContaining({
                avatarUrl: expect.stringContaining('John')
            })
        );
    });

    test('Should select preset female avatar', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        await user.click(screen.getByText('Edit Profile'));

        // Find and click a female avatar
        const femaleAvatar = screen.getByAltText('Female avatar 2');
        await user.click(femaleAvatar.parentElement);

        // Save profile
        await user.click(screen.getByText('Save Profile'));

        expect(mockUpdateProfile).toHaveBeenCalledWith(
            expect.objectContaining({
                avatarUrl: expect.stringContaining('Jessica')
            })
        );
    });

    test.skip('Should handle custom avatar upload', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        await user.click(screen.getByText('Edit Profile'));

        // Find file input - it's the only file input on the page when in edit mode
        const fileInput = document.querySelector('input[type="file"]');

        // Create a mock file
        const file = new File(['dummy content'], 'avatar.png', { type: 'image/png' });
        Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

        // Upload file
        await user.upload(fileInput, file);

        // Save profile
        await user.click(screen.getByText('Save Profile'));

        expect(mockUpdateProfile).toHaveBeenCalledWith(
            expect.objectContaining({
                avatarUrl: expect.stringContaining('data:image')
            })
        );
    });

    // ===== LOGIN HISTORY TESTS =====
    test('Should display login history', () => {
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        expect(screen.getByText(/Chrome on Windows/i)).toBeInTheDocument();
        expect(screen.getByText(/Firefox on Mac/i)).toBeInTheDocument();
    });

    test('Should display message when no login history', () => {
        useUser.mockReturnValue({
            user: { ...mockUser, loginHistory: [] },
            preferences: mockPreferences,
            todayProgress: 5,
            updatePreferences: mockUpdatePreferences,
            updateProfile: mockUpdateProfile
        });

        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        expect(screen.getByText(/No login history available yet/i)).toBeInTheDocument();
    });

    // ===== ERROR HANDLING TESTS =====
    test('Should handle profile save error gracefully', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        mockUpdateProfile.mockRejectedValue(new Error('Network error'));

        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        await user.click(screen.getByText('Edit Profile'));

        const usernameInput = screen.getByPlaceholderText('Enter your display name');
        await user.clear(usernameInput);
        await user.type(usernameInput, 'newname');

        await user.click(screen.getByText('Save Profile'));

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to update profile',
                expect.any(Error)
            );
        });

        consoleErrorSpy.mockRestore();
    });

    test('Should show saving state during profile update', async () => {
        mockUpdateProfile.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        await user.click(screen.getByText('Edit Profile'));
        await user.click(screen.getByText('Save Profile'));

        expect(screen.getByText('Saving...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
        });
    });

    // ===== FALLBACK TESTS =====
    test('Should display fallback avatar when user has no avatar', () => {
        useUser.mockReturnValue({
            user: { ...mockUser, avatarUrl: '' },
            preferences: mockPreferences,
            todayProgress: 5,
            updatePreferences: mockUpdatePreferences,
            updateProfile: mockUpdateProfile
        });

        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        const avatar = screen.getAllByAltText('Profile avatar')[0];
        expect(avatar.src).toContain('dicebear.com');
        expect(avatar.src).toContain('seed=testuser');
    });

    test('Should display fallback username when user has no username', () => {
        useUser.mockReturnValue({
            user: { ...mockUser, username: '', fullName: '' },
            preferences: mockPreferences,
            todayProgress: 5,
            updatePreferences: mockUpdatePreferences,
            updateProfile: mockUpdateProfile
        });

        render(
            <MemoryRouter>
                <Settings />
            </MemoryRouter>
        );

        expect(screen.getByText('No name set')).toBeInTheDocument();
    });
});
