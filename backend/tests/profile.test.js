// Mock nodemailer BEFORE importing routes
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockImplementation(() => Promise.resolve({ messageId: 'test-message-id' }))
    })
}));

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
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

describe('Profile Management API Tests', () => {

    // ==================== UPDATE PROFILE TESTS ====================
    describe('PUT /api/auth/update-profile - Update User Profile', () => {

        let testUser;

        beforeEach(async () => {
            // Create a test user before each test
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'profiletest@example.com',
                    password: 'Password123',
                    username: 'profiletest'
                });

            testUser = response.body.user;
        });

        // ========== USERNAME UPDATE TESTS ==========
        test('Should update username', async () => {
            const response = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'profiletest@example.com',
                    username: 'newusername'
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Profile updated successfully');
            expect(response.body.user.username).toBe('newusername');
        });

        // ========== FULL NAME UPDATE TESTS ==========
        test('Should update full name', async () => {
            const response = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'profiletest@example.com',
                    fullName: 'John Doe'
                });

            expect(response.status).toBe(200);
            expect(response.body.user.fullName).toBe('John Doe');
        });

        // ========== AGE UPDATE TESTS ==========
        test('Should update age', async () => {
            const response = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'profiletest@example.com',
                    age: 25
                });

            expect(response.status).toBe(200);
            expect(response.body.user.age).toBe(25);
        });

        test('Should handle age as zero', async () => {
            const response = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'profiletest@example.com',
                    age: 0
                });

            expect(response.status).toBe(200);
            expect(response.body.user.age).toBe(0);
        });

        // ========== GENDER UPDATE TESTS ==========
        test('Should update gender to male', async () => {
            const response = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'profiletest@example.com',
                    gender: 'male'
                });

            expect(response.status).toBe(200);
            expect(response.body.user.gender).toBe('male');
        });

        test('Should update gender to female', async () => {
            const response = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'profiletest@example.com',
                    gender: 'female'
                });

            expect(response.status).toBe(200);
            expect(response.body.user.gender).toBe('female');
        });

        test('Should update gender to other', async () => {
            const response = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'profiletest@example.com',
                    gender: 'other'
                });

            expect(response.status).toBe(200);
            expect(response.body.user.gender).toBe('other');
        });

        test('Should update gender to prefer-not-to-say', async () => {
            const response = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'profiletest@example.com',
                    gender: 'prefer-not-to-say'
                });

            expect(response.status).toBe(200);
            expect(response.body.user.gender).toBe('prefer-not-to-say');
        });

        // ========== BIO UPDATE TESTS ==========
        test('Should update bio', async () => {
            const response = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'profiletest@example.com',
                    bio: 'This is my bio. I love learning languages!'
                });

            expect(response.status).toBe(200);
            expect(response.body.user.bio).toBe('This is my bio. I love learning languages!');
        });

        test('Should handle long bio (within 500 char limit)', async () => {
            const longBio = 'A'.repeat(500); // Exactly 500 characters

            const response = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'profiletest@example.com',
                    bio: longBio
                });

            expect(response.status).toBe(200);
            expect(response.body.user.bio).toBe(longBio);
            expect(response.body.user.bio.length).toBe(500);
        });

        test('Should reject bio exceeding 500 characters', async () => {
            const tooLongBio = 'A'.repeat(501); // 501 characters

            const response = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'profiletest@example.com',
                    bio: tooLongBio
                });

            // Mongoose validation should fail
            expect(response.status).toBe(500);
        });

        test('Should handle empty bio', async () => {
            const response = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'profiletest@example.com',
                    bio: ''
                });

            expect(response.status).toBe(200);
            expect(response.body.user.bio).toBe('');
        });

        // ========== AVATAR URL UPDATE TESTS ==========
        test('Should update avatar URL', async () => {
            const response = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'profiletest@example.com',
                    avatarUrl: 'https://example.com/avatar.jpg'
                });

            expect(response.status).toBe(200);
            expect(response.body.user.avatarUrl).toBe('https://example.com/avatar.jpg');
        });

        test('Should handle empty avatar URL', async () => {
            const response = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'profiletest@example.com',
                    avatarUrl: ''
                });

            expect(response.status).toBe(200);
            expect(response.body.user.avatarUrl).toBe('');
        });

        // ========== PREFERENCES UPDATE TESTS ==========
        test('Should update preferences through profile endpoint', async () => {
            const response = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'profiletest@example.com',
                    preferences: {
                        theme: 'light',
                        soundEffects: true
                    }
                });

            expect(response.status).toBe(200);
            expect(response.body.user.preferences.theme).toBe('light');
            expect(response.body.user.preferences.soundEffects).toBe(true);
        });

        test('Should merge preferences with existing preferences', async () => {
            // First update
            await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'profiletest@example.com',
                    preferences: {
                        theme: 'light'
                    }
                });

            // Second update with different preference
            const response = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'profiletest@example.com',
                    preferences: {
                        soundEffects: true
                    }
                });

            expect(response.status).toBe(200);
            // Both preferences should be present
            expect(response.body.user.preferences.theme).toBe('light');
            expect(response.body.user.preferences.soundEffects).toBe(true);
        });

        // ========== MULTIPLE FIELDS UPDATE TESTS ==========
        test('Should update multiple profile fields at once', async () => {
            const response = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'profiletest@example.com',
                    username: 'johndoe',
                    fullName: 'John Doe',
                    age: 30,
                    gender: 'male',
                    bio: 'Language enthusiast',
                    avatarUrl: 'https://example.com/john.jpg'
                });

            expect(response.status).toBe(200);
            expect(response.body.user.username).toBe('johndoe');
            expect(response.body.user.fullName).toBe('John Doe');
            expect(response.body.user.age).toBe(30);
            expect(response.body.user.gender).toBe('male');
            expect(response.body.user.bio).toBe('Language enthusiast');
            expect(response.body.user.avatarUrl).toBe('https://example.com/john.jpg');
        });

        test('Should update all fields including preferences', async () => {
            const response = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'profiletest@example.com',
                    username: 'completeuserprofile',
                    fullName: 'Complete User',
                    age: 28,
                    gender: 'female',
                    bio: 'Complete profile test',
                    avatarUrl: 'https://example.com/complete.jpg',
                    preferences: {
                        theme: 'light',
                        soundEffects: true,
                        animationReduced: true,
                        fontSize: 'large',
                        dailyGoalMinutes: 20
                    }
                });

            expect(response.status).toBe(200);
            const user = response.body.user;
            expect(user.username).toBe('completeuserprofile');
            expect(user.fullName).toBe('Complete User');
            expect(user.age).toBe(28);
            expect(user.gender).toBe('female');
            expect(user.bio).toBe('Complete profile test');
            expect(user.avatarUrl).toBe('https://example.com/complete.jpg');
            expect(user.preferences.theme).toBe('light');
            expect(user.preferences.soundEffects).toBe(true);
            expect(user.preferences.animationReduced).toBe(true);
            expect(user.preferences.fontSize).toBe('large');
            expect(user.preferences.dailyGoalMinutes).toBe(20);
        });

        // ========== OPTIONAL FIELD HANDLING TESTS ==========
        test('Should not overwrite fields when undefined is passed', async () => {
            // First set some values
            await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'profiletest@example.com',
                    fullName: 'Original Name',
                    age: 25
                });

            // Update only username (fullName and age should remain)
            const response = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'profiletest@example.com',
                    username: 'newusername'
                    // fullName and age not provided
                });

            expect(response.status).toBe(200);
            expect(response.body.user.username).toBe('newusername');
            expect(response.body.user.fullName).toBe('Original Name');
            expect(response.body.user.age).toBe(25);
        });

        test('Should persist profile updates in database', async () => {
            await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'profiletest@example.com',
                    fullName: 'Database Test',
                    age: 35
                });

            // Verify in database
            const user = await User.findOne({ email: 'profiletest@example.com' });
            expect(user.fullName).toBe('Database Test');
            expect(user.age).toBe(35);
        });

        // ========== RESPONSE STRUCTURE TESTS ==========
        test('Should return all user fields in response', async () => {
            const response = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'profiletest@example.com',
                    fullName: 'Test User'
                });

            expect(response.status).toBe(200);
            expect(response.body.user).toHaveProperty('email');
            expect(response.body.user).toHaveProperty('username');
            expect(response.body.user).toHaveProperty('fullName');
            // age and gender may not be present if undefined (Mongoose doesn't include undefined fields)
            expect(response.body.user).toHaveProperty('bio');
            expect(response.body.user).toHaveProperty('avatarUrl');
            expect(response.body.user).toHaveProperty('preferences');
            expect(response.body.user).toHaveProperty('completedLessons');
            expect(response.body.user).toHaveProperty('loginHistory');
        });

        test('Should not return password in response', async () => {
            const response = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'profiletest@example.com',
                    fullName: 'Test User'
                });

            expect(response.status).toBe(200);
            expect(response.body.user).not.toHaveProperty('password');
        });

        // ========== ERROR HANDLING TESTS ==========
        test('Should return 404 if user not found', async () => {
            const response = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'nonexistent@example.com',
                    fullName: 'Test User'
                });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('User not found');
        });

        test('Should handle request with only email (no updates)', async () => {
            const response = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'profiletest@example.com'
                    // No update fields
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Profile updated successfully');
        });
    });
});
