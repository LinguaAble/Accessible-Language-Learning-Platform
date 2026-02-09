import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import ForgotPassword from '../pages/ForgotPassword';

const renderForgotPassword = () => {
    return render(
        <BrowserRouter>
            <ForgotPassword />
        </BrowserRouter>
    );
};

describe('ForgotPassword Component Tests', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ==================== STEP 1: REQUEST OTP ====================
    test('Should render forgot password form', () => {
        renderForgotPassword();

        expect(screen.getByText(/Forgot Password?/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
        const submitButton = screen.getByRole('button', { name: /Send OTP Code/i });
        expect(submitButton).toHaveClass('login-btn');
    });

    test('Should have link to login page', () => {
        renderForgotPassword();

        const loginLink = screen.getByText(/Sign In/i);
        expect(loginLink).toBeInTheDocument();
        expect(loginLink.closest('a')).toHaveAttribute('href', '/');
    });

    test('Should allow user to enter email', async () => {
        const user = userEvent.setup();
        renderForgotPassword();

        const emailInput = screen.getByLabelText(/Email Address/i);
        await user.type(emailInput, 'test@example.com');

        expect(emailInput).toHaveValue('test@example.com');
    });

    test('Should send OTP request successfully', async () => {
        const user = userEvent.setup();
        axios.post.mockResolvedValueOnce({ data: { success: true } });

        renderForgotPassword();

        const emailInput = screen.getByLabelText(/Email Address/i);
        const submitButton = screen.getByRole('button', { name: /Send OTP Code/i });

        await user.type(emailInput, 'test@example.com');
        await user.click(submitButton);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:5000/api/auth/forgot-password',
                { email: 'test@example.com' }
            );
        });
    });

    test('Should display success message after OTP sent', async () => {
        const user = userEvent.setup();
        axios.post.mockResolvedValueOnce({ data: { success: true } });

        renderForgotPassword();

        const emailInput = screen.getByLabelText(/Email Address/i);
        const submitButton = screen.getByRole('button', { name: /Send OTP Code/i });

        await user.type(emailInput, 'test@example.com');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/OTP sent to.*Check your inbox/i)).toBeInTheDocument();
        });
    });

    test('Should display error for non-existent email', async () => {
        const user = userEvent.setup();
        const mockError = {
            response: {
                data: {
                    message: 'User not found'
                }
            }
        };

        axios.post.mockRejectedValueOnce(mockError);

        renderForgotPassword();

        const emailInput = screen.getByLabelText(/Email Address/i);
        const submitButton = screen.getByRole('button', { name: /Send OTP Code/i });

        await user.type(emailInput, 'nonexistent@example.com');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/User not found/i)).toBeInTheDocument();
        });
    });

    test('Should move to step 2 after OTP sent', async () => {
        const user = userEvent.setup();
        axios.post.mockResolvedValueOnce({ data: { success: true } });

        renderForgotPassword();

        const emailInput = screen.getByLabelText(/Email Address/i);
        const submitButton = screen.getByRole('button', { name: /Send OTP Code/i });

        await user.type(emailInput, 'test@example.com');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Enter the OTP/i)).toBeInTheDocument();
        });
    });
});
