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

describe('User Data Retrieval API Tests', () => {

    // ==================== GET USER DATA TESTS ====================
    describe('POST /api/auth/get-user-data - Get User Data', () => {

        let testUser;

        beforeEach(async () => {
            // Create a test user with full profile
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'userdata@example.com',
                    password: 'Password123',
                    username: 'userdatatest'
                });

            testUser = response.body.user;

            // Update user with additional data
            await request(app)
                .put('/api/auth/update-profile')
                .send({
                    email: 'userdata@example.com',
                    fullName: 'Test User',
                    age: 25,
                    gender: 'male',
                    bio: 'This is a test bio',
                    avatarUrl: 'https://example.com/avatar.jpg'
                });

            // Add some progress data
            await request(app)
                .put('/api/auth/update-progress')
                .send({
                    email: 'userdata@example.com',
                    completedLessons: [1, 2, 3, 4, 5],
                    todayProgress: 30,
                    incrementLessonCount: 5,
                    date: '2024-02-10'
                });
        });

        // ========== SUCCESSFUL RETRIEVAL TESTS ==========
        test('Should retrieve user data successfully', async () => {
            const response = await request(app)
                .post('/api/auth/get-user-data')
                .send({
                    email: 'userdata@example.com'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.username).toBe('userdatatest');
        });

        test('Should exclude password from response', async () => {
            const response = await request(app)
                .post('/api/auth/get-user-data')
                .send({
                    email: 'userdata@example.com'
                });

            expect(response.status).toBe(200);
            expect(response.body.user).not.toHaveProperty('password');
        });

        test('Should return all user profile fields', async () => {
            const response = await request(app)
                .post('/api/auth/get-user-data')
                .send({
                    email: 'userdata@example.com'
                });

            expect(response.status).toBe(200);
            const user = response.body.user;

            expect(user).toHaveProperty('username');
            expect(user).toHaveProperty('fullName');
            expect(user).toHaveProperty('age');
            expect(user).toHaveProperty('gender');
            expect(user).toHaveProperty('bio');
            expect(user).toHaveProperty('avatarUrl');
        });

        test('Should return user preferences', async () => {
            const response = await request(app)
                .post('/api/auth/get-user-data')
                .send({
                    email: 'userdata@example.com'
                });

            expect(response.status).toBe(200);
            expect(response.body.user).toHaveProperty('preferences');
            expect(response.body.user.preferences).toHaveProperty('theme');
            expect(response.body.user.preferences).toHaveProperty('soundEffects');
            expect(response.body.user.preferences).toHaveProperty('animationReduced');
            expect(response.body.user.preferences).toHaveProperty('fontSize');
            expect(response.body.user.preferences).toHaveProperty('dailyGoalMinutes');
        });

        test('Should return default preferences for new user', async () => {
            const response = await request(app)
                .post('/api/auth/get-user-data')
                .send({
                    email: 'userdata@example.com'
                });

            expect(response.status).toBe(200);
            const prefs = response.body.user.preferences;

            expect(prefs.theme).toBe('dark');
            expect(prefs.soundEffects).toBe(false);
            expect(prefs.animationReduced).toBe(false);
            expect(prefs.fontSize).toBe('medium');
            expect(prefs.dailyGoalMinutes).toBe(5);
        });

        test('Should return login history', async () => {
            const response = await request(app)
                .post('/api/auth/get-user-data')
                .send({
                    email: 'userdata@example.com'
                });

            expect(response.status).toBe(200);
            expect(response.body.user).toHaveProperty('loginHistory');
            expect(Array.isArray(response.body.user.loginHistory)).toBe(true);
            expect(response.body.user.loginHistory.length).toBeGreaterThan(0);
            expect(response.body.user.loginHistory[0]).toHaveProperty('timestamp');
            expect(response.body.user.loginHistory[0]).toHaveProperty('device');
        });

        test('Should return completed lessons', async () => {
            const response = await request(app)
                .post('/api/auth/get-user-data')
                .send({
                    email: 'userdata@example.com'
                });

            expect(response.status).toBe(200);
            expect(response.body.user).toHaveProperty('completedLessons');
            expect(Array.isArray(response.body.user.completedLessons)).toBe(true);
            expect(response.body.user.completedLessons).toEqual([1, 2, 3, 4, 5]);
        });

        test('Should return daily progress data', async () => {
            const response = await request(app)
                .post('/api/auth/get-user-data')
                .send({
                    email: 'userdata@example.com'
                });

            expect(response.status).toBe(200);
            expect(response.body.user).toHaveProperty('todayProgress');
            expect(response.body.user).toHaveProperty('progressDate');
            expect(response.body.user.todayProgress).toBe(30);
        });

        test('Should return daily lesson counts', async () => {
            const response = await request(app)
                .post('/api/auth/get-user-data')
                .send({
                    email: 'userdata@example.com'
                });

            expect(response.status).toBe(200);
            expect(response.body.user).toHaveProperty('dailyLessonCounts');
            expect(Array.isArray(response.body.user.dailyLessonCounts)).toBe(true);
            expect(response.body.user.dailyLessonCounts.length).toBe(1);
            expect(response.body.user.dailyLessonCounts[0].date).toBe('2024-02-10');
            expect(response.body.user.dailyLessonCounts[0].count).toBe(5);
        });

        test('Should return updated profile data', async () => {
            const response = await request(app)
                .post('/api/auth/get-user-data')
                .send({
                    email: 'userdata@example.com'
                });

            expect(response.status).toBe(200);
            const user = response.body.user;

            expect(user.fullName).toBe('Test User');
            expect(user.age).toBe(25);
            expect(user.gender).toBe('male');
            expect(user.bio).toBe('This is a test bio');
            expect(user.avatarUrl).toBe('https://example.com/avatar.jpg');
        });

        // ========== ERROR HANDLING TESTS ==========
        test('Should return 400 if email is missing', async () => {
            const response = await request(app)
                .post('/api/auth/get-user-data')
                .send({
                    // No email
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Email required');
        });

        test('Should return 404 if user not found', async () => {
            const response = await request(app)
                .post('/api/auth/get-user-data')
                .send({
                    email: 'nonexistent@example.com'
                });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('User not found');
        });

        test('Should handle user with minimal data', async () => {
            // Create a minimal user
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'minimal@example.com',
                    password: 'Password123'
                });

            const response = await request(app)
                .post('/api/auth/get-user-data')
                .send({
                    email: 'minimal@example.com'
                });

            expect(response.status).toBe(200);
            expect(response.body.user.username).toBe('minimal'); // Default from email
            expect(response.body.user.completedLessons).toEqual([]);
            expect(response.body.user.todayProgress).toBe(0);
        });

        test('Should handle user with empty arrays', async () => {
            // Create user and ensure empty arrays
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'emptydata@example.com',
                    password: 'Password123'
                });

            const response = await request(app)
                .post('/api/auth/get-user-data')
                .send({
                    email: 'emptydata@example.com'
                });

            expect(response.status).toBe(200);
            expect(response.body.user.completedLessons).toEqual([]);
            expect(response.body.user.dailyLessonCounts).toEqual([]);
            expect(response.body.user.loginHistory.length).toBeGreaterThan(0); // Has registration entry
        });
    });
});
