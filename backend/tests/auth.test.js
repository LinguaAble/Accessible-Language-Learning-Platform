// Mock nodemailer BEFORE importing routes (must be at top)
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockImplementation(() => Promise.resolve({ messageId: 'test-message-id' }))
    })
}));

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const authRoutes = require('../routes/authRoutes');
const User = require('../models/User');
require('./setup'); // Import test database setup

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-12345';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'test-password';

describe('Authentication API Tests', () => {

    // ==================== USER REGISTRATION TESTS ====================
    describe('POST /api/auth/register - User Registration', () => {

        test('Should register a new user successfully and return pendingMFA', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'newuser@example.com',
                    password: 'SecurePass123!',
                    username: 'newuser'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('pendingMFA', true);
            expect(response.body).toHaveProperty('email', 'newuser@example.com');
            expect(response.body).not.toHaveProperty('token');

            // Verify MFA token was saved in DB
            const user = await User.findOne({ email: 'newuser@example.com' });
            expect(user.mfaToken).toBeDefined();
            expect(user.mfaTokenExpire).toBeDefined();
        });

        test('Should hash password in database', async () => {
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'hashtest@example.com',
                    password: 'MyPassword123',
                    username: 'hashtest'
                });

            const user = await User.findOne({ email: 'hashtest@example.com' });
            expect(user.password).not.toBe('MyPassword123'); // Password should be hashed
            expect(user.password.length).toBeGreaterThan(20); // Bcrypt hash is long

            // Verify password can be compared
            const isMatch = await bcrypt.compare('MyPassword123', user.password);
            expect(isMatch).toBe(true);
        });

        test('Should initialize login history on registration in DB', async () => {
             await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'loginhistory@example.com',
                    password: 'Password123',
                    username: 'loginhistory'
                });

            const user = await User.findOne({ email: 'loginhistory@example.com' });
            expect(user.loginHistory).toBeDefined();
            expect(user.loginHistory.length).toBe(1);
            expect(user.loginHistory[0]).toHaveProperty('timestamp');
            expect(user.loginHistory[0].device).toBe('Web Browser');
        });

        test('Should return 400 if email already exists', async () => {
            // Register first user
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'duplicate@example.com',
                    password: 'Password123',
                    username: 'user1'
                });

            // Try to register with same email
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'duplicate@example.com',
                    password: 'DifferentPass456',
                    username: 'user2'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('This email is already registered.');
        });
    });

    // ==================== USER LOGIN TESTS ====================
    describe('POST /api/auth/login - User Login', () => {

        beforeEach(async () => {
            // Create a test user before each login test
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'logintest@example.com',
                    password: 'LoginPass123',
                    username: 'logintest'
                });
        });

        test('Should login with valid credentials and return pendingMFA', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'logintest@example.com',
                    password: 'LoginPass123'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('pendingMFA', true);
            expect(response.body).toHaveProperty('email', 'logintest@example.com');
            expect(response.body).not.toHaveProperty('token');
        });

        test('Should return 400 with invalid email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'SomePassword'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid email or password.');
        });

        test('Should return 400 with wrong password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'logintest@example.com',
                    password: 'WrongPassword123'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid email or password.');
        });
    });

    // ==================== MFA VERIFICATION TESTS ====================
    describe('POST /api/auth/verify-mfa & resend-mfa', () => {

        beforeEach(async () => {
            // Create and mock MFA user
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('TestPass123', salt);
            
            const hashedOtp = crypto.createHash('sha256').update('123456').digest('hex');
            
            await User.create({
                email: 'mfatest@example.com',
                password: hashedPassword,
                username: 'mfatest',
                mfaToken: hashedOtp,
                mfaTokenExpire: Date.now() + 60000 // 1 min validity
            });
        });

        test('Should verify correct OTP and return token', async () => {
            const response = await request(app)
                .post('/api/auth/verify-mfa')
                .send({
                    email: 'mfatest@example.com',
                    otp: '123456'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe('mfatest@example.com');

            // Verify MFA fields are cleared in DB
            const user = await User.findOne({ email: 'mfatest@example.com' });
            expect(user.mfaToken).toBeUndefined();
            expect(user.mfaTokenExpire).toBeUndefined();
        });

        test('Should return 400 with incorrect OTP', async () => {
            const response = await request(app)
                .post('/api/auth/verify-mfa')
                .send({
                    email: 'mfatest@example.com',
                    otp: '654321' // Wrong OTP
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid or expired verification code.');
        });

        test('Should return 400 with expired OTP', async () => {
            // Expire the token
            await User.findOneAndUpdate(
                { email: 'mfatest@example.com' },
                { mfaTokenExpire: Date.now() - 1000 }
            );

            const response = await request(app)
                .post('/api/auth/verify-mfa')
                .send({
                    email: 'mfatest@example.com',
                    otp: '123456'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid or expired verification code.');
        });

        test('Should resend MFA token successfully', async () => {
            const response = await request(app)
                .post('/api/auth/resend-mfa')
                .send({
                    email: 'mfatest@example.com'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            
            // Wait for DB save (async usually fast enough, but just in case)
            const user = await User.findOne({ email: 'mfatest@example.com' });
            
            // Check if OTP was updated (might be slightly different due to random regeneration)
            expect(user.mfaTokenExpire.getTime()).toBeGreaterThan(Date.now() + 4 * 60 * 1000); // Should be a ~5m expiry
        });
    });

    // ==================== PASSWORD RESET TESTS ====================
    describe('Password Reset Flow', () => {

        beforeEach(async () => {
            // Create a test user
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'resettest@example.com',
                    password: 'OriginalPass123',
                    username: 'resettest'
                });
        });

        describe('POST /api/auth/forgot-password - Request OTP', () => {

            test.skip('Should generate OTP and save hashed token', async () => {
                const response = await request(app)
                    .post('/api/auth/forgot-password')
                    .send({
                        email: 'resettest@example.com'
                    });

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                
                const user = await User.findOne({ email: 'resettest@example.com' });
                expect(user.resetPasswordToken).toBeDefined();
            });

            test('Should return 404 for non-existent email', async () => {
                const response = await request(app)
                    .post('/api/auth/forgot-password')
                    .send({
                        email: 'nonexistent@example.com'
                    });

                expect(response.status).toBe(404);
            });
        });

        describe('PUT /api/auth/reset-password/:token - Reset Password', () => {

            let validOTP;

            beforeEach(async () => {
                validOTP = Math.floor(100000 + Math.random() * 900000).toString();
                const hashedToken = crypto.createHash('sha256').update(validOTP).digest('hex');
                await User.findOneAndUpdate(
                    { email: 'resettest@example.com' },
                    {
                        resetPasswordToken: hashedToken,
                        resetPasswordExpire: Date.now() + 60000
                    }
                );
            });

            test('Should reset password with valid OTP', async () => {
                const response = await request(app)
                    .put(`/api/auth/reset-password/${validOTP}`)
                    .send({
                        password: 'NewPassword456'
                    });

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);

                const user = await User.findOne({ email: 'resettest@example.com' });
                const isMatch = await bcrypt.compare('NewPassword456', user.password);
                expect(isMatch).toBe(true);
            });

            test('Should return 400 with invalid OTP', async () => {
                const response = await request(app)
                    .put('/api/auth/reset-password/999999')
                    .send({ password: 'NewPassword456' });

                expect(response.status).toBe(400);
            });
        });
    });
});
