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

describe('User Progress API Tests', () => {

    // ==================== UPDATE PROGRESS TESTS ====================
    describe('PUT /api/auth/update-progress - Update User Progress', () => {

        let testUser;

        beforeEach(async () => {
            // Create a test user before each test
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'progresstest@example.com',
                    password: 'Password123',
                    username: 'progresstest'
                });

            testUser = response.body.user;
        });

        // ========== COMPLETED LESSONS TESTS ==========
        test('Should update completed lessons array', async () => {
            const response = await request(app)
                .put('/api/auth/update-progress')
                .send({
                    email: 'progresstest@example.com',
                    completedLessons: [1, 2, 3]
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.completedLessons).toEqual([1, 2, 3]);
        });

        test('Should merge and deduplicate completed lessons', async () => {
            // First update
            await request(app)
                .put('/api/auth/update-progress')
                .send({
                    email: 'progresstest@example.com',
                    completedLessons: [1, 2, 3]
                });

            // Second update with overlapping lessons
            const response = await request(app)
                .put('/api/auth/update-progress')
                .send({
                    email: 'progresstest@example.com',
                    completedLessons: [3, 4, 5]
                });

            expect(response.status).toBe(200);
            expect(response.body.completedLessons).toEqual([1, 2, 3, 4, 5]);
        });

        test('Should handle empty completed lessons array', async () => {
            const response = await request(app)
                .put('/api/auth/update-progress')
                .send({
                    email: 'progresstest@example.com',
                    completedLessons: []
                });

            expect(response.status).toBe(200);
            expect(response.body.completedLessons).toEqual([]);
        });

        // ========== DAILY PROGRESS (MINUTES) TESTS ==========
        test('Should update daily progress (minutes)', async () => {
            const response = await request(app)
                .put('/api/auth/update-progress')
                .send({
                    email: 'progresstest@example.com',
                    todayProgress: 15
                });

            expect(response.status).toBe(200);
            expect(response.body.todayProgress).toBe(15);
            expect(response.body.progressDate).toBeDefined();
        });

        test('Should increment daily progress on same day', async () => {
            // First update
            await request(app)
                .put('/api/auth/update-progress')
                .send({
                    email: 'progresstest@example.com',
                    todayProgress: 10
                });

            // Second update on same day
            const response = await request(app)
                .put('/api/auth/update-progress')
                .send({
                    email: 'progresstest@example.com',
                    todayProgress: 25
                });

            expect(response.status).toBe(200);
            expect(response.body.todayProgress).toBe(25);
        });

        test('Should reset progress when date changes', async () => {
            // Set initial progress with old date
            const user = await User.findOne({ email: 'progresstest@example.com' });
            user.progressDate = 'Mon Jan 01 2024'; // Old date
            user.todayProgress = 50;
            await user.save();

            // Update with new progress (should detect new day)
            const response = await request(app)
                .put('/api/auth/update-progress')
                .send({
                    email: 'progresstest@example.com',
                    todayProgress: 10
                });

            expect(response.status).toBe(200);
            expect(response.body.todayProgress).toBe(10);
            expect(response.body.progressDate).not.toBe('Mon Jan 01 2024');
        });

        test('Should handle zero progress', async () => {
            const response = await request(app)
                .put('/api/auth/update-progress')
                .send({
                    email: 'progresstest@example.com',
                    todayProgress: 0
                });

            expect(response.status).toBe(200);
            expect(response.body.todayProgress).toBe(0);
        });

        // ========== DAILY LESSON COUNT TESTS ==========
        test('Should increment daily lesson count', async () => {
            const today = new Date().toISOString().split('T')[0];

            const response = await request(app)
                .put('/api/auth/update-progress')
                .send({
                    email: 'progresstest@example.com',
                    incrementLessonCount: 1,
                    date: today
                });

            expect(response.status).toBe(200);
            expect(response.body.dailyLessonCounts).toBeDefined();
            expect(response.body.dailyLessonCounts.length).toBe(1);
            expect(response.body.dailyLessonCounts[0].date).toBe(today);
            expect(response.body.dailyLessonCounts[0].count).toBe(1);
        });

        test('Should accumulate lesson count for same day', async () => {
            const today = new Date().toISOString().split('T')[0];

            // First lesson
            await request(app)
                .put('/api/auth/update-progress')
                .send({
                    email: 'progresstest@example.com',
                    incrementLessonCount: 1,
                    date: today
                });

            // Second lesson
            await request(app)
                .put('/api/auth/update-progress')
                .send({
                    email: 'progresstest@example.com',
                    incrementLessonCount: 1,
                    date: today
                });

            // Third lesson
            const response = await request(app)
                .put('/api/auth/update-progress')
                .send({
                    email: 'progresstest@example.com',
                    incrementLessonCount: 1,
                    date: today
                });

            expect(response.status).toBe(200);
            expect(response.body.dailyLessonCounts.length).toBe(1);
            expect(response.body.dailyLessonCounts[0].count).toBe(3);
        });

        test('Should track lesson counts for different days', async () => {
            const day1 = '2024-02-01';
            const day2 = '2024-02-02';
            const day3 = '2024-02-03';

            // Day 1
            await request(app)
                .put('/api/auth/update-progress')
                .send({
                    email: 'progresstest@example.com',
                    incrementLessonCount: 2,
                    date: day1
                });

            // Day 2
            await request(app)
                .put('/api/auth/update-progress')
                .send({
                    email: 'progresstest@example.com',
                    incrementLessonCount: 3,
                    date: day2
                });

            // Day 3
            const response = await request(app)
                .put('/api/auth/update-progress')
                .send({
                    email: 'progresstest@example.com',
                    incrementLessonCount: 1,
                    date: day3
                });

            expect(response.status).toBe(200);
            expect(response.body.dailyLessonCounts.length).toBe(3);

            const counts = response.body.dailyLessonCounts;
            expect(counts.find(e => e.date === day1).count).toBe(2);
            expect(counts.find(e => e.date === day2).count).toBe(3);
            expect(counts.find(e => e.date === day3).count).toBe(1);
        });

        test('Should use server date if date not provided', async () => {
            const response = await request(app)
                .put('/api/auth/update-progress')
                .send({
                    email: 'progresstest@example.com',
                    incrementLessonCount: 1
                    // No date provided
                });

            expect(response.status).toBe(200);
            expect(response.body.dailyLessonCounts.length).toBe(1);
            expect(response.body.dailyLessonCounts[0].date).toBeDefined();
        });

        // ========== COMBINED UPDATES TESTS ==========
        test('Should update all progress fields simultaneously', async () => {
            const today = new Date().toISOString().split('T')[0];

            const response = await request(app)
                .put('/api/auth/update-progress')
                .send({
                    email: 'progresstest@example.com',
                    completedLessons: [1, 2, 3],
                    todayProgress: 20,
                    incrementLessonCount: 3,
                    date: today
                });

            expect(response.status).toBe(200);
            expect(response.body.completedLessons).toEqual([1, 2, 3]);
            expect(response.body.todayProgress).toBe(20);
            expect(response.body.dailyLessonCounts.length).toBe(1);
            expect(response.body.dailyLessonCounts[0].count).toBe(3);
        });

        // ========== ERROR HANDLING TESTS ==========
        test('Should return 400 if email is missing', async () => {
            const response = await request(app)
                .put('/api/auth/update-progress')
                .send({
                    completedLessons: [1, 2, 3]
                    // No email
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Email is required');
        });

        test('Should return 404 if user not found', async () => {
            const response = await request(app)
                .put('/api/auth/update-progress')
                .send({
                    email: 'nonexistent@example.com',
                    completedLessons: [1, 2, 3]
                });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('User not found');
        });

        test('Should handle request with no update fields gracefully', async () => {
            const response = await request(app)
                .put('/api/auth/update-progress')
                .send({
                    email: 'progresstest@example.com'
                    // No update fields
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
});
