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

describe('Settings Management API Tests', () => {

    // ==================== UPDATE SETTINGS TESTS ====================
    describe('PUT /api/auth/update-settings - Update User Settings', () => {

        let testUser;

        beforeEach(async () => {
            // Create a test user before each test
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'settingstest@example.com',
                    password: 'Password123',
                    username: 'settingstest'
                });

            testUser = response.body.user;
        });

        // ========== SUCCESSFUL UPDATE TESTS ==========
        test('Should update theme preference', async () => {
            const response = await request(app)
                .put('/api/auth/update-settings')
                .send({
                    email: 'settingstest@example.com',
                    preferences: {
                        theme: 'light'
                    }
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.preferences.theme).toBe('light');
        });

        test('Should update sound effects preference', async () => {
            const response = await request(app)
                .put('/api/auth/update-settings')
                .send({
                    email: 'settingstest@example.com',
                    preferences: {
                        soundEffects: true
                    }
                });

            expect(response.status).toBe(200);
            expect(response.body.preferences.soundEffects).toBe(true);
        });

        test('Should update animation reduced preference', async () => {
            const response = await request(app)
                .put('/api/auth/update-settings')
                .send({
                    email: 'settingstest@example.com',
                    preferences: {
                        animationReduced: true
                    }
                });

            expect(response.status).toBe(200);
            expect(response.body.preferences.animationReduced).toBe(true);
        });

        test('Should update font size preference', async () => {
            const response = await request(app)
                .put('/api/auth/update-settings')
                .send({
                    email: 'settingstest@example.com',
                    preferences: {
                        fontSize: 'large'
                    }
                });

            expect(response.status).toBe(200);
            expect(response.body.preferences.fontSize).toBe('large');
        });

        test('Should update daily goal minutes preference', async () => {
            const response = await request(app)
                .put('/api/auth/update-settings')
                .send({
                    email: 'settingstest@example.com',
                    preferences: {
                        dailyGoalMinutes: 15
                    }
                });

            expect(response.status).toBe(200);
            expect(response.body.preferences.dailyGoalMinutes).toBe(15);
        });

        test('Should update multiple preferences at once', async () => {
            const response = await request(app)
                .put('/api/auth/update-settings')
                .send({
                    email: 'settingstest@example.com',
                    preferences: {
                        theme: 'light',
                        soundEffects: true,
                        animationReduced: true,
                        fontSize: 'large',
                        dailyGoalMinutes: 20
                    }
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.preferences.theme).toBe('light');
            expect(response.body.preferences.soundEffects).toBe(true);
            expect(response.body.preferences.animationReduced).toBe(true);
            expect(response.body.preferences.fontSize).toBe('large');
            expect(response.body.preferences.dailyGoalMinutes).toBe(20);
        });

        test('Should preserve existing preferences when updating partial preferences', async () => {
            // First update
            await request(app)
                .put('/api/auth/update-settings')
                .send({
                    email: 'settingstest@example.com',
                    preferences: {
                        theme: 'light',
                        soundEffects: true
                    }
                });

            // Second update (only fontSize)
            const response = await request(app)
                .put('/api/auth/update-settings')
                .send({
                    email: 'settingstest@example.com',
                    preferences: {
                        fontSize: 'large'
                    }
                });

            expect(response.status).toBe(200);
            // Should preserve previous updates
            expect(response.body.preferences.theme).toBe('light');
            expect(response.body.preferences.soundEffects).toBe(true);
            // And include new update
            expect(response.body.preferences.fontSize).toBe('large');
        });

        test('Should persist settings in database', async () => {
            await request(app)
                .put('/api/auth/update-settings')
                .send({
                    email: 'settingstest@example.com',
                    preferences: {
                        theme: 'light',
                        dailyGoalMinutes: 30
                    }
                });

            // Verify in database
            const user = await User.findOne({ email: 'settingstest@example.com' });
            expect(user.preferences.theme).toBe('light');
            expect(user.preferences.dailyGoalMinutes).toBe(30);
        });

        test('Should handle boolean false values correctly', async () => {
            // First set to true
            await request(app)
                .put('/api/auth/update-settings')
                .send({
                    email: 'settingstest@example.com',
                    preferences: {
                        soundEffects: true
                    }
                });

            // Then set to false
            const response = await request(app)
                .put('/api/auth/update-settings')
                .send({
                    email: 'settingstest@example.com',
                    preferences: {
                        soundEffects: false
                    }
                });

            expect(response.status).toBe(200);
            expect(response.body.preferences.soundEffects).toBe(false);
        });

        test('Should handle zero value for dailyGoalMinutes', async () => {
            const response = await request(app)
                .put('/api/auth/update-settings')
                .send({
                    email: 'settingstest@example.com',
                    preferences: {
                        dailyGoalMinutes: 0
                    }
                });

            expect(response.status).toBe(200);
            expect(response.body.preferences.dailyGoalMinutes).toBe(0);
        });

        // ========== ERROR HANDLING TESTS ==========
        test('Should return 400 if email is missing', async () => {
            const response = await request(app)
                .put('/api/auth/update-settings')
                .send({
                    preferences: {
                        theme: 'light'
                    }
                    // No email
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Data missing');
        });

        test('Should return 400 if preferences are missing', async () => {
            const response = await request(app)
                .put('/api/auth/update-settings')
                .send({
                    email: 'settingstest@example.com'
                    // No preferences
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Data missing');
        });

        test('Should return 400 if both email and preferences are missing', async () => {
            const response = await request(app)
                .put('/api/auth/update-settings')
                .send({
                    // Empty body
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Data missing');
        });

        test('Should return 404 if user not found', async () => {
            const response = await request(app)
                .put('/api/auth/update-settings')
                .send({
                    email: 'nonexistent@example.com',
                    preferences: {
                        theme: 'light'
                    }
                });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('User not found');
        });

        test('Should handle empty preferences object', async () => {
            const response = await request(app)
                .put('/api/auth/update-settings')
                .send({
                    email: 'settingstest@example.com',
                    preferences: {}
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('Should ignore unknown preference fields', async () => {
            const response = await request(app)
                .put('/api/auth/update-settings')
                .send({
                    email: 'settingstest@example.com',
                    preferences: {
                        theme: 'light',
                        unknownField: 'value'
                    }
                });

            expect(response.status).toBe(200);
            expect(response.body.preferences.theme).toBe('light');
            // Unknown field should not be in response (Mongoose schema validation)
        });
    });
});
