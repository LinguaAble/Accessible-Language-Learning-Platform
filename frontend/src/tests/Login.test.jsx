import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';

// Wrap component with Router for testing
const renderLogin = () => {
    return render(
        <BrowserRouter>
            <Login />
        </BrowserRouter>
    );
};

describe('Login Component Tests', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ==================== RENDERING TESTS ====================
    test('Should render login form with all elements', () => {
        renderLogin();

        expect(screen.getByText(/Welcome to/i)).toBeInTheDocument();
        // LinguaAble is split into two spans, check for both parts
        expect(screen.getByText(/Lingua/i)).toBeInTheDocument();
        expect(screen.getByText(/Able/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        // Use className to get the actual submit button, not Google login
        const submitButton = document.querySelector('button.login-btn');
        expect(submitButton).toBeInTheDocument();
        expect(submitButton.textContent).toBe('Sign In');
        expect(screen.getByText(/Forgot Password?/i)).toBeInTheDocument();
        expect(screen.getByText(/New here?/i)).toBeInTheDocument();
    });

    test('Should render password visibility toggle button', () => {
        renderLogin();

        const passwordInput = screen.getByLabelText(/Password/i);
        expect(passwordInput).toHaveAttribute('type', 'password');

        // Eye icon button should be present (it's a button with type="button")
        const buttons = screen.getAllByRole('button');
        const toggleButton = buttons.find(btn => btn.getAttribute('type') === 'button');
        expect(toggleButton).toBeInTheDocument();
    });

    test('Should render remember me checkbox', () => {
        renderLogin();

        const checkbox = screen.getByLabelText(/Stay signed in/i);
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).toHaveAttribute('type', 'checkbox');
    });

    // ==================== USER INTERACTION TESTS ====================
    test('Should allow user to type in email field', async () => {
        const user = userEvent.setup();
        renderLogin();

        const emailInput = screen.getByLabelText(/Email Address/i);
        await user.type(emailInput, 'test@example.com');

        expect(emailInput).toHaveValue('test@example.com');
    });

    test('Should allow user to type in password field', async () => {
        const user = userEvent.setup();
        renderLogin();

        const passwordInput = screen.getByLabelText(/Password/i);
        await user.type(passwordInput, 'MyPassword123');

        expect(passwordInput).toHaveValue('MyPassword123');
    });

    test('Should toggle password visibility when eye icon clicked', async () => {
        const user = userEvent.setup();
        renderLogin();

        const passwordInput = screen.getByLabelText(/Password/i);
        const toggleButtons = screen.getAllByRole('button');
        const eyeButton = toggleButtons.find(btn => btn.getAttribute('type') === 'button');

        // Initially password type
        expect(passwordInput).toHaveAttribute('type', 'password');

        // Click to show password
        await user.click(eyeButton);
        expect(passwordInput).toHaveAttribute('type', 'text');

        // Click again to hide
        await user.click(eyeButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('Should toggle remember me checkbox', async () => {
        const user = userEvent.setup();
        renderLogin();

        const checkbox = screen.getByLabelText(/Stay signed in/i);

        expect(checkbox).not.toBeChecked();

        await user.click(checkbox);
        expect(checkbox).toBeChecked();

        await user.click(checkbox);
        expect(checkbox).not.toBeChecked();
    });

    // ==================== FORM SUBMISSION TESTS ====================
    test('Should submit form with valid credentials', async () => {
        const user = userEvent.setup();
        const mockResponse = {
            data: {
                token: 'mock-jwt-token',
                user: {
                    email: 'test@example.com',
                    username: 'testuser',
                    completedLessons: []
                }
            }
        };

        axios.post.mockResolvedValueOnce(mockResponse);

        renderLogin();

        const emailInput = screen.getByLabelText(/Email Address/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const submitButton = document.querySelector('button.login-btn');

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'Password123');
        await user.click(submitButton);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:5000/api/auth/login',
                expect.objectContaining({
                    email: 'test@example.com',
                    password: 'Password123'
                })
            );
        });
    });

    test('Should display error message on failed login', async () => {
        const user = userEvent.setup();
        const mockError = {
            response: {
                data: {
                    message: 'Invalid email or password.'
                }
            }
        };

        axios.post.mockRejectedValueOnce(mockError);

        renderLogin();

        const emailInput = screen.getByLabelText(/Email Address/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const submitButton = document.querySelector('button.login-btn');

        await user.type(emailInput, 'wrong@example.com');
        await user.type(passwordInput, 'WrongPassword');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
        });
    });

    test('Should display network error message when API fails', async () => {
        const user = userEvent.setup();

        axios.post.mockRejectedValueOnce(new Error('Network Error'));

        renderLogin();

        const emailInput = screen.getByLabelText(/Email Address/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const submitButton = document.querySelector('button.login-btn');

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'Password123');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Unable to sign in/i)).toBeInTheDocument();
        });
    });

    test('Should include rememberMe in login request when checked', async () => {
        const user = userEvent.setup();
        const mockResponse = {
            data: {
                token: 'mock-jwt-token',
                user: { email: 'test@example.com', completedLessons: [] }
            }
        };

        axios.post.mockResolvedValueOnce(mockResponse);

        renderLogin();

        const emailInput = screen.getByLabelText(/Email Address/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const checkbox = screen.getByLabelText(/Stay signed in/i);
        const submitButton = document.querySelector('button.login-btn');

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'Password123');
        await user.click(checkbox);
        await user.click(submitButton);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:5000/api/auth/login',
                expect.objectContaining({
                    rememberMe: true
                })
            );
        });
    });

    // ==================== NAVIGATION TESTS ====================
    test('Should have link to forgot password page', () => {
        renderLogin();

        const forgotLink = screen.getByText(/Forgot Password?/i);
        expect(forgotLink).toBeInTheDocument();
        expect(forgotLink.closest('a')).toHaveAttribute('href', '/forgot-password');
    });

    test('Should have link to signup page', () => {
        renderLogin();

        const signupLink = screen.getByText(/Create an Account/i);
        expect(signupLink).toBeInTheDocument();
        expect(signupLink.closest('a')).toHaveAttribute('href', '/signup');
    });

    // ==================== VALIDATION TESTS ====================
    test('Should require email field', () => {
        renderLogin();

        const emailInput = screen.getByLabelText(/Email Address/i);
        expect(emailInput).toHaveAttribute('required');
    });

    test('Should require password field', () => {
        renderLogin();

        const passwordInput = screen.getByLabelText(/Password/i);
        expect(passwordInput).toHaveAttribute('required');
    });

    test('Should have email type for email input', () => {
        renderLogin();

        const emailInput = screen.getByLabelText(/Email Address/i);
        expect(emailInput).toHaveAttribute('type', 'email');
    });
});
