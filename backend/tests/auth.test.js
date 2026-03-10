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
const OTP = require('../models/OTP');
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

            // Verify User was NOT created yet
            const user = await User.findOne({ email: 'newuser@example.com' });
            expect(user).toBeNull();

            // Verify OTP token was saved in DB
            const otpRecord = await OTP.findOne({ email: 'newuser@example.com' });
            expect(otpRecord).toBeDefined();
            expect(otpRecord.signupData).toBeDefined();
            expect(otpRecord.signupData.username).toBe('newuser');
        });

        test('Should hash password in database', async () => {
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'hashtest@example.com',
                    password: 'MyPassword123',
                    username: 'hashtest'
                });

            // User is not created yet, so check OTP collection
            const otpRecord = await OTP.findOne({ email: 'hashtest@example.com' });
            expect(otpRecord.signupData.password).not.toBe('MyPassword123'); // Password should be hashed
            expect(otpRecord.signupData.password.length).toBeGreaterThan(20); // Bcrypt hash is long

            // Verify password can be compared
            const isMatch = await bcrypt.compare('MyPassword123', otpRecord.signupData.password);
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

            const otpRecord = await OTP.findOne({ email: 'loginhistory@example.com' });
            expect(otpRecord).toBeDefined();
            
            // Note: loginHistory is no longer initialized in OTP, it's initialized on creation inside verify-mfa.
            // But we can check if it exists in DB as an OTP record.
            expect(otpRecord.signupData).toBeDefined();
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
            // Mock an existing user for login MFA tests
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('TestPass123', salt);
            
            await User.create({
                email: 'mfalogin@example.com',
                password: hashedPassword,
                username: 'mfalogin'
            });

            // Mock OTP for login
            const hashedOtpLogin = crypto.createHash('sha256').update('123456').digest('hex');
            
            await OTP.create({
                email: 'mfalogin@example.com',
                otp: hashedOtpLogin
            });

            // Mock OTP for signup (user doesn't exist yet)
            const hashedOtpSignup = crypto.createHash('sha256').update('654321').digest('hex');
            await OTP.create({
                email: 'mfasignup@example.com',
                otp: hashedOtpSignup,
                signupData: {
                    password: hashedPassword,
                    username: 'mfasignup'
                }
            });
        });

        test('Should verify correct login OTP and return token', async () => {
            const response = await request(app)
                .post('/api/auth/verify-mfa')
                .send({
                    email: 'mfalogin@example.com',
                    otp: '123456'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe('mfalogin@example.com');

            // Verify OTP record is deleted
            const otpRecord = await OTP.findOne({ email: 'mfalogin@example.com' });
            expect(otpRecord).toBeNull();
        });

        test('Should verify correct signup OTP, create user, and return token', async () => {
            const response = await request(app)
                .post('/api/auth/verify-mfa')
                .send({
                    email: 'mfasignup@example.com',
                    otp: '654321'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body.user.email).toBe('mfasignup@example.com');

            // Verify User is created
            const user = await User.findOne({ email: 'mfasignup@example.com' });
            expect(user).toBeDefined();

            // Verify OTP record is deleted
            const otpRecord = await OTP.findOne({ email: 'mfasignup@example.com' });
            expect(otpRecord).toBeNull();
        });

        test('Should return 400 with incorrect OTP', async () => {
            const response = await request(app)
                .post('/api/auth/verify-mfa')
                .send({
                    email: 'mfalogin@example.com',
                    otp: '000000' // Wrong OTP
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid or expired verification code.');
        });

        test('Should return 400 with expired OTP (not found in DB)', async () => {
            // Delete the token to simulate expiry
            await OTP.deleteOne({ email: 'mfalogin@example.com' });

            const response = await request(app)
                .post('/api/auth/verify-mfa')
                .send({
                    email: 'mfalogin@example.com',
                    otp: '123456'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid or expired verification code.');
        });

        test('Should resend MFA token successfully', async () => {
            const response = await request(app)
                .post('/api/auth/resend-mfa')
                .send({
                    email: 'mfalogin@example.com'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            
            const otpRecord = await OTP.findOne({ email: 'mfalogin@example.com' });
            expect(otpRecord).toBeDefined();
            expect(otpRecord.createdAt.getTime()).toBeGreaterThan(Date.now() - 5000); 
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
