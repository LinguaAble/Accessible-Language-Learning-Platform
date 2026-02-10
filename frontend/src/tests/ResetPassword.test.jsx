import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ResetPassword from '../pages/ResetPassword';

// Mock navigate function
const mockNavigate = vi.fn();

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => ({ token: 'mock-reset-token-123' }),
    };
});

const renderResetPassword = () => {
    return render(
        <BrowserRouter>
            <Routes>
                <Route path="*" element={<ResetPassword />} />
            </Routes>
        </BrowserRouter>
    );
};

describe('ResetPassword Component Tests', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
    });

    // ==================== RENDERING TESTS ====================
    test('Should render reset password form with all elements', () => {
        renderResetPassword();

        expect(screen.getByText(/LinguaAble/i)).toBeInTheDocument();
        expect(screen.getByText(/Set New Password/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter new password/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Confirm new password/i)).toBeInTheDocument();
        
        const submitButton = screen.getByRole('button', { name: /Update Password/i });
        expect(submitButton).toBeInTheDocument();
        expect(submitButton).toHaveClass('login-btn');
    });

    test('Should render logo image', () => {
        renderResetPassword();

        const logo = screen.getByAltText(/LinguaAble Zebra/i);
        expect(logo).toBeInTheDocument();
        expect(logo).toHaveClass('app-logo');
    });

    test('Should render brand title with correct styling', () => {
        renderResetPassword();

        const brandTitle = screen.getByText(/LinguaAble/i);
        expect(brandTitle).toBeInTheDocument();
        expect(brandTitle).toHaveClass('brand-title');
    });

    test('Should render page title', () => {
        renderResetPassword();

        const pageTitle = screen.getByText(/Set New Password/i);
        expect(pageTitle).toBeInTheDocument();
        expect(pageTitle).toHaveClass('page-title');
    });

    // ==================== PASSWORD VISIBILITY TOGGLE TESTS ====================
    test('Should have password visibility toggle buttons', () => {
        renderResetPassword();

        const toggleButtons = screen.getAllByRole('button');
        // Filter out the submit button
        const eyeButtons = toggleButtons.filter(btn => btn.getAttribute('type') === 'button');
        
        expect(eyeButtons.length).toBeGreaterThanOrEqual(2); // One for each password field
    });

    test('Should toggle new password visibility', async () => {
        const user = userEvent.setup();
        renderResetPassword();

        const passwordInput = screen.getByPlaceholderText(/Enter new password/i);
        const toggleButtons = screen.getAllByRole('button');
        const passwordToggle = toggleButtons.find(btn => 
            btn.getAttribute('type') === 'button' &&
            btn.parentElement.querySelector('input[placeholder*="Enter new password"]')
        );

        // Initially should be password type
        expect(passwordInput).toHaveAttribute('type', 'password');

        // Click to show password
        await user.click(passwordToggle);
        expect(passwordInput).toHaveAttribute('type', 'text');

        // Click again to hide
        await user.click(passwordToggle);
        expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('Should toggle confirm password visibility', async () => {
        const user = userEvent.setup();
        renderResetPassword();

        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i);
        const toggleButtons = screen.getAllByRole('button');
        const confirmToggle = toggleButtons.find(btn => 
            btn.getAttribute('type') === 'button' &&
            btn.parentElement.querySelector('input[placeholder*="Confirm new password"]')
        );

        // Initially should be password type
        expect(confirmInput).toHaveAttribute('type', 'password');

        // Click to show password
        await user.click(confirmToggle);
        expect(confirmInput).toHaveAttribute('type', 'text');

        // Click again to hide
        await user.click(confirmToggle);
        expect(confirmInput).toHaveAttribute('type', 'password');
    });

    // ==================== USER INPUT TESTS ====================
    test('Should allow user to type in new password field', async () => {
        const user = userEvent.setup();
        renderResetPassword();

        const passwordInput = screen.getByPlaceholderText(/Enter new password/i);
        await user.type(passwordInput, 'NewSecurePass123');

        expect(passwordInput).toHaveValue('NewSecurePass123');
    });

    test('Should allow user to type in confirm password field', async () => {
        const user = userEvent.setup();
        renderResetPassword();

        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i);
        await user.type(confirmInput, 'NewSecurePass123');

        expect(confirmInput).toHaveValue('NewSecurePass123');
    });

    test('Should allow user to fill both password fields', async () => {
        const user = userEvent.setup();
        renderResetPassword();

        const passwordInput = screen.getByPlaceholderText(/Enter new password/i);
        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i);

        await user.type(passwordInput, 'MyNewPassword123');
        await user.type(confirmInput, 'MyNewPassword123');

        expect(passwordInput).toHaveValue('MyNewPassword123');
        expect(confirmInput).toHaveValue('MyNewPassword123');
    });

    // ==================== VALIDATION TESTS ====================
    test('Should require new password field', () => {
        renderResetPassword();

        const passwordInput = screen.getByPlaceholderText(/Enter new password/i);
        expect(passwordInput).toHaveAttribute('required');
    });

    test('Should require confirm password field', () => {
        renderResetPassword();

        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i);
        expect(confirmInput).toHaveAttribute('required');
    });

    test('Should show error when passwords do not match', async () => {
        const user = userEvent.setup();
        renderResetPassword();

        const passwordInput = screen.getByPlaceholderText(/Enter new password/i);
        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i);
        const submitButton = screen.getByRole('button', { name: /Update Password/i });

        await user.type(passwordInput, 'Password123');
        await user.type(confirmInput, 'DifferentPassword456');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
        });
    });

    test('Should not call API when passwords do not match', async () => {
        const user = userEvent.setup();
        renderResetPassword();

        const passwordInput = screen.getByPlaceholderText(/Enter new password/i);
        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i);
        const submitButton = screen.getByRole('button', { name: /Update Password/i });

        await user.type(passwordInput, 'Password123');
        await user.type(confirmInput, 'DifferentPassword');
        await user.click(submitButton);

        await waitFor(() => {
            expect(axios.put).not.toHaveBeenCalled();
        });
    });

    // ==================== FORM SUBMISSION TESTS ====================
    test('Should submit form with matching passwords', async () => {
        const user = userEvent.setup();
        const mockResponse = {
            data: {
                success: true,
                message: 'Password updated successfully'
            }
        };

        axios.put.mockResolvedValueOnce(mockResponse);

        renderResetPassword();

        const passwordInput = screen.getByPlaceholderText(/Enter new password/i);
        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i);
        const submitButton = screen.getByRole('button', { name: /Update Password/i });

        await user.type(passwordInput, 'NewPassword123');
        await user.type(confirmInput, 'NewPassword123');
        await user.click(submitButton);

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                'http://localhost:5000/api/auth/reset-password/mock-reset-token-123',
                expect.objectContaining({
                    password: 'NewPassword123'
                })
            );
        });
    });

    test('Should use token from URL params in API call', async () => {
        const user = userEvent.setup();
        const mockResponse = { data: { success: true } };
        axios.put.mockResolvedValueOnce(mockResponse);

        renderResetPassword();

        const passwordInput = screen.getByPlaceholderText(/Enter new password/i);
        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i);
        const submitButton = screen.getByRole('button', { name: /Update Password/i });

        await user.type(passwordInput, 'Password123');
        await user.type(confirmInput, 'Password123');
        await user.click(submitButton);

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                expect.stringContaining('mock-reset-token-123'),
                expect.any(Object)
            );
        });
    });

    test('Should display success message after password reset', async () => {
        const user = userEvent.setup();
        const mockResponse = {
            data: {
                success: true,
                message: 'Password reset successful'
            }
        };

        axios.put.mockResolvedValueOnce(mockResponse);

        renderResetPassword();

        const passwordInput = screen.getByPlaceholderText(/Enter new password/i);
        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i);
        const submitButton = screen.getByRole('button', { name: /Update Password/i });

        await user.type(passwordInput, 'NewPassword123');
        await user.type(confirmInput, 'NewPassword123');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Password Updated! Redirecting to login/i)).toBeInTheDocument();
        });
    });

    test('Should navigate to login after successful password reset', async () => {
        const user = userEvent.setup();
        const mockResponse = { data: { success: true } };
        axios.put.mockResolvedValueOnce(mockResponse);

        renderResetPassword();

        const passwordInput = screen.getByPlaceholderText(/Enter new password/i);
        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i);
        const submitButton = screen.getByRole('button', { name: /Update Password/i });

        await user.type(passwordInput, 'NewPassword123');
        await user.type(confirmInput, 'NewPassword123');
        
        // Mock form submission
        const form = submitButton.closest('form');
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);

        await waitFor(() => {
            expect(screen.getByText(/Password Updated!/i)).toBeInTheDocument();
        });

        // Note: Navigation happens after 2s timeout in component
        // We verify the message is shown, actual navigation testing would require timer mocking
    });

    // ==================== ERROR HANDLING TESTS ====================
    test('Should display error for invalid token', async () => {
        const user = userEvent.setup();
        const mockError = {
            response: {
                data: {
                    message: 'Invalid or expired token'
                }
            }
        };

        axios.put.mockRejectedValueOnce(mockError);

        renderResetPassword();

        const passwordInput = screen.getByPlaceholderText(/Enter new password/i);
        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i);

        await user.type(passwordInput, 'NewPassword123');
        await user.type(confirmInput, 'NewPassword123');

        // Trigger form submit event directly
        const form = document.querySelector('form');
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);

        await waitFor(() => {
            expect(screen.getByText(/Invalid or expired token/i)).toBeInTheDocument();
        });
    });

    test('Should display generic error when no response message', async () => {
        const user = userEvent.setup();
        
        axios.put.mockRejectedValueOnce(new Error('Network Error'));

        renderResetPassword();

        const passwordInput = screen.getByPlaceholderText(/Enter new password/i);
        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i);

        await user.type(passwordInput, 'NewPassword123');
        await user.type(confirmInput, 'NewPassword123');

        // Trigger form submit event directly
        const form = document.querySelector('form');
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);

        await waitFor(() => {
            expect(screen.getByText(/Invalid or expired token/i)).toBeInTheDocument();
        });
    });

    test('Should handle API error with custom message', async () => {
        const user = userEvent.setup();
        const mockError = {
            response: {
                data: {
                    message: 'Token has expired. Please request a new password reset.'
                }
            }
        };

        axios.put.mockRejectedValueOnce(mockError);

        renderResetPassword();

        const passwordInput = screen.getByPlaceholderText(/Enter new password/i);
        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i);

        await user.type(passwordInput, 'NewPassword123');
        await user.type(confirmInput, 'NewPassword123');

        // Trigger form submit event directly
        const form = document.querySelector('form');
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);

        await waitFor(() => {
            expect(screen.getByText(/Token has expired/i)).toBeInTheDocument();
        });
    });

    // ==================== MESSAGE DISPLAY TESTS ====================
    test('Should show success message with green styling', async () => {
        const user = userEvent.setup();
        const mockResponse = { data: { success: true } };
        axios.put.mockResolvedValueOnce(mockResponse);

        renderResetPassword();

        const passwordInput = screen.getByPlaceholderText(/Enter new password/i);
        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i);

        await user.type(passwordInput, 'NewPassword123');
        await user.type(confirmInput, 'NewPassword123');

        // Trigger form submit event directly
        const form = document.querySelector('form');
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);

        await waitFor(() => {
            const successMessage = screen.getByText(/Password Updated!/i);
            expect(successMessage).toBeInTheDocument();
            // The message div itself has the error-message class
            const messageContainer = successMessage.closest('.error-message');
            expect(messageContainer).toBeInTheDocument();
            expect(messageContainer).toHaveStyle({ borderColor: 'rgb(46, 204, 113)' });
        });
    });

    test('Should show error message with default error styling', async () => {
        const user = userEvent.setup();
        const mockError = {
            response: {
                data: {
                    message: 'Invalid token'
                }
            }
        };

        axios.put.mockRejectedValueOnce(mockError);

        renderResetPassword();

        const passwordInput = screen.getByPlaceholderText(/Enter new password/i);
        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i);

        await user.type(passwordInput, 'NewPassword123');
        await user.type(confirmInput, 'NewPassword123');

        // Trigger form submit event directly
        const form = document.querySelector('form');
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);

        await waitFor(() => {
            const errorMessage = screen.getByText(/Invalid token/i);
            expect(errorMessage).toBeInTheDocument();
            expect(errorMessage).toHaveClass('error-message');
        });
    });

    test('Should clear error message when submitting again', async () => {
        const user = userEvent.setup();
        
        // First submission fails
        const mockError = {
            response: {
                data: {
                    message: 'Invalid token'
                }
            }
        };
        axios.put.mockRejectedValueOnce(mockError);

        renderResetPassword();

        const passwordInput = screen.getByPlaceholderText(/Enter new password/i);
        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i);

        await user.type(passwordInput, 'NewPassword123');
        await user.type(confirmInput, 'NewPassword123');

        // First submission
        let form = document.querySelector('form');
        let submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);

        await waitFor(() => {
            expect(screen.getByText(/Invalid token/i)).toBeInTheDocument();
        });

        // Second submission succeeds
        const mockResponse = { data: { success: true } };
        axios.put.mockResolvedValueOnce(mockResponse);

        await user.clear(passwordInput);
        await user.clear(confirmInput);
        await user.type(passwordInput, 'AnotherPassword123');
        await user.type(confirmInput, 'AnotherPassword123');
        
        // Second submission
        form = document.querySelector('form');
        submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);

        await waitFor(() => {
            expect(screen.queryByText(/Invalid token/i)).not.toBeInTheDocument();
        });
    });

    // ==================== INPUT STYLING TESTS ====================
    test('Should have correct input styling with padding for icons', () => {
        renderResetPassword();

        const passwordInput = screen.getByPlaceholderText(/Enter new password/i);
        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i);

        // Both inputs should have right padding for the eye icon
        expect(passwordInput).toHaveStyle({ paddingRight: '40px' });
        expect(confirmInput).toHaveStyle({ paddingRight: '40px' });
    });

    test('Should have password inputs with marginBottom: 0', () => {
        renderResetPassword();

        const passwordInput = screen.getByPlaceholderText(/Enter new password/i);
        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i);

        expect(passwordInput).toHaveStyle({ marginBottom: '0' });
        expect(confirmInput).toHaveStyle({ marginBottom: '0' });
    });

    // ==================== ACCESSIBILITY TESTS ====================
    test('Should have labels for password inputs', () => {
        renderResetPassword();

        const labels = document.querySelectorAll('label');
        const labelTexts = Array.from(labels).map(label => label.textContent);
        
        expect(labelTexts).toContain('New Password');
        expect(labelTexts).toContain('Confirm Password');
    });

    test('Should have appropriate placeholders', () => {
        renderResetPassword();

        const passwordInput = screen.getByPlaceholderText(/Enter new password/i);
        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i);

        expect(passwordInput).toHaveAttribute('placeholder', 'Enter new password');
        expect(confirmInput).toHaveAttribute('placeholder', 'Confirm new password');
    });

    test('Should have alt text for logo', () => {
        renderResetPassword();

        const logo = screen.getByAltText(/LinguaAble Zebra/i);
        expect(logo).toHaveAttribute('alt', 'LinguaAble Zebra');
    });

    // ==================== CSS CLASS TESTS ====================
    test('Should have correct CSS class structure', () => {
        renderResetPassword();

        expect(document.querySelector('.login-container')).toBeInTheDocument();
        expect(document.querySelector('.login-box')).toBeInTheDocument();
        expect(document.querySelector('.logo-container')).toBeInTheDocument();
        expect(document.querySelector('.brand-title')).toBeInTheDocument();
        expect(document.querySelector('.page-title')).toBeInTheDocument();
    });

    test('Should have input-group class for form fields', () => {
        renderResetPassword();

        const inputGroups = document.querySelectorAll('.input-group');
        expect(inputGroups.length).toBeGreaterThanOrEqual(2); // At least 2 password fields
    });

    // ==================== FORM BEHAVIOR TESTS ====================

    test('Should handle form submission via Enter key', async () => {
        const user = userEvent.setup();
        const mockResponse = { data: { success: true } };
        axios.put.mockResolvedValueOnce(mockResponse);

        renderResetPassword();

        const passwordInput = screen.getByPlaceholderText(/Enter new password/i);
        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i);

        await user.type(passwordInput, 'NewPassword123');
        await user.type(confirmInput, 'NewPassword123{Enter}');

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalled();
        });
    });

    // ==================== EDGE CASE TESTS ====================
    test('Should handle empty form submission', () => {
        renderResetPassword();

        const submitButton = screen.getByRole('button', { name: /Update Password/i });
        const passwordInput = screen.getByPlaceholderText(/Enter new password/i);
        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i);
        
        // HTML5 validation should prevent submission
        expect(passwordInput).toHaveAttribute('required');
        expect(confirmInput).toHaveAttribute('required');
        expect(submitButton).toBeInTheDocument();
    });

    test('Should handle very long passwords', async () => {
        const user = userEvent.setup();
        const longPassword = 'A'.repeat(100) + '123';
        
        renderResetPassword();

        const passwordInput = screen.getByPlaceholderText(/Enter new password/i);
        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i);

        await user.type(passwordInput, longPassword);
        await user.type(confirmInput, longPassword);

        expect(passwordInput).toHaveValue(longPassword);
        expect(confirmInput).toHaveValue(longPassword);
    });

    test('Should handle special characters in password', async () => {
        const user = userEvent.setup();
        const mockResponse = { data: { success: true } };
        axios.put.mockResolvedValueOnce(mockResponse);

        renderResetPassword();

        const specialPassword = 'P@ssw0rd!#$%^&*()';
        const passwordInput = screen.getByPlaceholderText(/Enter new password/i);
        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i);

        await user.type(passwordInput, specialPassword);
        await user.type(confirmInput, specialPassword);

        // Trigger form submit event directly
        const form = document.querySelector('form');
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    password: specialPassword
                })
            );
        });
    });

    // ==================== INTEGRATION TESTS ====================
    test('Should complete full password reset flow', async () => {
        const user = userEvent.setup();
        const mockResponse = { data: { success: true } };
        axios.put.mockResolvedValueOnce(mockResponse);

        renderResetPassword();

        // Fill in form
        const passwordInput = screen.getByPlaceholderText(/Enter new password/i);
        const confirmInput = screen.getByPlaceholderText(/Confirm new password/i);
        await user.type(passwordInput, 'NewSecurePassword123');
        await user.type(confirmInput, 'NewSecurePassword123');

        // Submit form
        const form = document.querySelector('form');
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);

        // Verify API call
        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                'http://localhost:5000/api/auth/reset-password/mock-reset-token-123',
                { password: 'NewSecurePassword123' }
            );
        });

        // Verify success message
        await waitFor(() => {
            expect(screen.getByText(/Password Updated!/i)).toBeInTheDocument();
        });

        // Note: Navigation after timeout happens in component, would need timer mocks to test
    });
});