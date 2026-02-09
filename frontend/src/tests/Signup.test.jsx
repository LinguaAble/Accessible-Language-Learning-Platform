import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import Signup from '../pages/Signup';

const renderSignup = () => {
    return render(
        <BrowserRouter>
            <Signup />
        </BrowserRouter>
    );
};

describe('Signup Component Tests', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ==================== RENDERING TESTS ====================
    test('Should render signup form with all fields', () => {
        renderSignup();

        expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
        const submitButton = screen.getByRole('button', { name: /Sign Up/i });
        expect(submitButton).toHaveClass('login-btn');
    });

    test('Should have link to login page', () => {
        renderSignup();

        const loginLink = screen.getByText(/Sign In/i);
        expect(loginLink).toBeInTheDocument();
        expect(loginLink.closest('a')).toHaveAttribute('href', '/');
    });

    // ==================== USER INTERACTION TESTS ====================
    test('Should allow user to fill in all form fields', async () => {
        const user = userEvent.setup();
        renderSignup();

        const emailInput = screen.getByLabelText(/Email Address/i);
        const passwordInput = screen.getByLabelText(/^Password$/i);
        const confirmInput = screen.getByLabelText(/Confirm Password/i);

        await user.type(emailInput, 'newuser@example.com');
        await user.type(passwordInput, 'SecurePass123');
        await user.type(confirmInput, 'SecurePass123');

        expect(emailInput).toHaveValue('newuser@example.com');
        expect(passwordInput).toHaveValue('SecurePass123');
        expect(confirmInput).toHaveValue('SecurePass123');
    });

    test('Should toggle password visibility', async () => {
        const user = userEvent.setup();
        renderSignup();

        const passwordInput = screen.getByLabelText(/^Password$/i);
        const toggleButtons = screen.getAllByRole('button');
        const eyeButton = toggleButtons.find(btn =>
            btn.getAttribute('type') === 'button' &&
            btn.parentElement.querySelector('#password')
        );

        expect(passwordInput).toHaveAttribute('type', 'password');

        await user.click(eyeButton);
        expect(passwordInput).toHaveAttribute('type', 'text');
    });

    // ==================== VALIDATION TESTS ====================
    test('Should show error if password is too short', async () => {
        const user = userEvent.setup();
        renderSignup();

        const emailInput = screen.getByLabelText(/Email Address/i);
        const passwordInput = screen.getByLabelText(/^Password$/i);
        const confirmInput = screen.getByLabelText(/Confirm Password/i);
        const submitButton = screen.getByRole('button', { name: /Sign Up/i });

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, '12345'); // Only 5 characters
        await user.type(confirmInput, '12345');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Password is too short/i)).toBeInTheDocument();
        });
    });

    test('Should show warning when typing short password', async () => {
        const user = userEvent.setup();
        renderSignup();

        const passwordInput = screen.getByLabelText(/^Password$/i);

        await user.type(passwordInput, '123');

        expect(screen.getByText(/Password must be at least 6 characters/i)).toBeInTheDocument();
    });

    test('Should show error if passwords do not match', async () => {
        const user = userEvent.setup();
        renderSignup();

        const emailInput = screen.getByLabelText(/Email Address/i);
        const passwordInput = screen.getByLabelText(/^Password$/i);
        const confirmInput = screen.getByLabelText(/Confirm Password/i);
        const submitButton = screen.getByRole('button', { name: /Sign Up/i });

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'Password123');
        await user.type(confirmInput, 'DifferentPass456');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
        });
    });

    // ==================== FORM SUBMISSION TESTS ====================
    test('Should register successfully with valid data', async () => {
        const user = userEvent.setup();
        const mockResponse = {
            data: {
                token: 'mock-jwt-token',
                user: {
                    email: 'newuser@example.com',
                    username: 'newuser',
                    completedLessons: []
                }
            }
        };

        axios.post.mockResolvedValueOnce(mockResponse);

        renderSignup();

        const emailInput = screen.getByLabelText(/Email Address/i);
        const passwordInput = screen.getByLabelText(/^Password$/i);
        const confirmInput = screen.getByLabelText(/Confirm Password/i);
        const submitButton = screen.getByRole('button', { name: /Sign Up/i });

        await user.type(emailInput, 'newuser@example.com');
        await user.type(passwordInput, 'SecurePass123');
        await user.type(confirmInput, 'SecurePass123');
        await user.click(submitButton);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:5000/api/auth/register',
                expect.objectContaining({
                    email: 'newuser@example.com',
                    password: 'SecurePass123'
                })
            );
        });
    });

    test('Should display error when email already exists', async () => {
        const user = userEvent.setup();
        const mockError = {
            response: {
                data: {
                    message: 'This email is already registered.'
                }
            }
        };

        axios.post.mockRejectedValueOnce(mockError);

        renderSignup();

        const emailInput = screen.getByLabelText(/Email Address/i);
        const passwordInput = screen.getByLabelText(/^Password$/i);
        const confirmInput = screen.getByLabelText(/Confirm Password/i);
        const submitButton = screen.getByRole('button', { name: /Sign Up/i });

        await user.type(emailInput, 'existing@example.com');
        await user.type(passwordInput, 'Password123');
        await user.type(confirmInput, 'Password123');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/This email is already registered/i)).toBeInTheDocument();
        });
    });

    test('Should show loading state during registration', async () => {
        const user = userEvent.setup();

        // Mock a delayed response
        axios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

        renderSignup();

        const emailInput = screen.getByLabelText(/Email Address/i);
        const passwordInput = screen.getByLabelText(/^Password$/i);
        const confirmInput = screen.getByLabelText(/Confirm Password/i);
        const submitButton = screen.getByRole('button', { name: /Sign Up/i });

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'Password123');
        await user.type(confirmInput, 'Password123');
        await user.click(submitButton);

        expect(screen.getByText(/Creating Account.../i)).toBeInTheDocument();
    });

    test('Should display generic error on network failure', async () => {
        const user = userEvent.setup();

        axios.post.mockRejectedValueOnce(new Error('Network Error'));

        renderSignup();

        const emailInput = screen.getByLabelText(/Email Address/i);
        const passwordInput = screen.getByLabelText(/^Password$/i);
        const confirmInput = screen.getByLabelText(/Confirm Password/i);
        const submitButton = screen.getByRole('button', { name: /Sign Up/i });

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'Password123');
        await user.type(confirmInput, 'Password123');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Registration failed/i)).toBeInTheDocument();
        });
    });
});
