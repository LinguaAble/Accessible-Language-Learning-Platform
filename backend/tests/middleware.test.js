const jwt = require('jsonwebtoken');
const express = require('express');
const request = require('supertest');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
require('./setup'); // Import test database setup

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-12345';

// Create Express app for testing
const app = express();
app.use(express.json());

// Test route that uses the protect middleware
app.get('/api/protected', protect, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

describe('Authentication Middleware Tests', () => {

    // ==================== PROTECT MIDDLEWARE TESTS ====================
    describe('protect middleware - JWT Authentication', () => {

        let testUser;
        let validToken;

        beforeEach(async () => {
            // Create a test user
            testUser = new User({
                email: 'middleware@example.com',
                username: 'middlewaretest',
                password: 'hashedpassword123'
            });
            await testUser.save();

            // Generate a valid token
            validToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        });

        // ========== VALID TOKEN TESTS ==========
        test('Should accept valid JWT token', async () => {
            const response = await request(app)
                .get('/api/protected')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('Should attach user to req.user', async () => {
            const response = await request(app)
                .get('/api/protected')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.email).toBe('middleware@example.com');
            expect(response.body.user.username).toBe('middlewaretest');
        });

        test('Should exclude password from req.user', async () => {
            const response = await request(app)
                .get('/api/protected')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body.user).not.toHaveProperty('password');
        });

        test('Should include user ID in req.user', async () => {
            const response = await request(app)
                .get('/api/protected')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body.user._id).toBeDefined();
            expect(response.body.user._id.toString()).toBe(testUser._id.toString());
        });

        // ========== INVALID TOKEN TESTS ==========
        test('Should reject invalid token', async () => {
            const response = await request(app)
                .get('/api/protected')
                .set('Authorization', 'Bearer invalid-token-12345');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Not authorized, token failed');
        });

        test('Should reject malformed token', async () => {
            const response = await request(app)
                .get('/api/protected')
                .set('Authorization', 'Bearer malformed.token.here');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Not authorized, token failed');
        });

        test('Should reject token with wrong secret', async () => {
            const wrongToken = jwt.sign({ id: testUser._id }, 'wrong-secret-key', { expiresIn: '7d' });

            const response = await request(app)
                .get('/api/protected')
                .set('Authorization', `Bearer ${wrongToken}`);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Not authorized, token failed');
        });

        // ========== EXPIRED TOKEN TESTS ==========
        test('Should reject expired token', async () => {
            // Create token that expires immediately
            const expiredToken = jwt.sign(
                { id: testUser._id },
                process.env.JWT_SECRET,
                { expiresIn: '0s' }
            );

            // Wait a moment to ensure expiration
            await new Promise(resolve => setTimeout(resolve, 100));

            const response = await request(app)
                .get('/api/protected')
                .set('Authorization', `Bearer ${expiredToken}`);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Not authorized, token failed');
        });

        // ========== MISSING TOKEN TESTS ==========
        test('Should reject request with no Authorization header', async () => {
            const response = await request(app)
                .get('/api/protected');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Not authorized, no token');
        });

        test('Should reject request with empty Authorization header', async () => {
            const response = await request(app)
                .get('/api/protected')
                .set('Authorization', '');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Not authorized, no token');
        });

        // ========== MALFORMED AUTHORIZATION HEADER TESTS ==========
        test('Should reject Authorization header without Bearer prefix', async () => {
            const response = await request(app)
                .get('/api/protected')
                .set('Authorization', validToken);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Not authorized, no token');
        });

        test('Should reject Authorization header with wrong prefix', async () => {
            const response = await request(app)
                .get('/api/protected')
                .set('Authorization', `Basic ${validToken}`);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Not authorized, no token');
        });

        test('Should reject Authorization header with only "Bearer"', async () => {
            const response = await request(app)
                .get('/api/protected')
                .set('Authorization', 'Bearer');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Not authorized, token failed');
        });

        test('Should reject Authorization header with extra spaces', async () => {
            const response = await request(app)
                .get('/api/protected')
                .set('Authorization', `Bearer  ${validToken}`); // Double space

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Not authorized, token failed');
        });

        // ========== NON-EXISTENT USER TESTS ==========
        test('Should reject token for non-existent user', async () => {
            // Create token with fake user ID
            const fakeUserId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectId format
            const fakeToken = jwt.sign({ id: fakeUserId }, process.env.JWT_SECRET, { expiresIn: '7d' });

            const response = await request(app)
                .get('/api/protected')
                .set('Authorization', `Bearer ${fakeToken}`);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Not authorized, token failed');
        });

        test('Should reject token with invalid user ID format', async () => {
            const invalidToken = jwt.sign({ id: 'invalid-id' }, process.env.JWT_SECRET, { expiresIn: '7d' });

            const response = await request(app)
                .get('/api/protected')
                .set('Authorization', `Bearer ${invalidToken}`);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Not authorized, token failed');
        });

        test('Should reject token with missing user ID', async () => {
            const noIdToken = jwt.sign({ email: 'test@example.com' }, process.env.JWT_SECRET, { expiresIn: '7d' });

            const response = await request(app)
                .get('/api/protected')
                .set('Authorization', `Bearer ${noIdToken}`);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Not authorized, token failed');
        });

        // ========== TOKEN PAYLOAD TESTS ==========
        test('Should work with token containing extra claims', async () => {
            const tokenWithExtra = jwt.sign(
                {
                    id: testUser._id,
                    email: testUser.email,
                    role: 'user'
                },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            const response = await request(app)
                .get('/api/protected')
                .set('Authorization', `Bearer ${tokenWithExtra}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        // ========== CASE SENSITIVITY TESTS ==========
        test('Should be case-sensitive for Bearer prefix', async () => {
            const response = await request(app)
                .get('/api/protected')
                .set('Authorization', `bearer ${validToken}`); // lowercase

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Not authorized, no token');
        });

        test('Should be case-sensitive for BEARER prefix', async () => {
            const response = await request(app)
                .get('/api/protected')
                .set('Authorization', `BEARER ${validToken}`); // uppercase

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Not authorized, no token');
        });

        // ========== MULTIPLE REQUESTS TESTS ==========
        test('Should handle multiple requests with same token', async () => {
            // First request
            const response1 = await request(app)
                .get('/api/protected')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response1.status).toBe(200);

            // Second request with same token
            const response2 = await request(app)
                .get('/api/protected')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response2.status).toBe(200);
        });

        test('Should handle requests from different users', async () => {
            // Create second user
            const user2 = new User({
                email: 'middleware2@example.com',
                username: 'middlewaretest2',
                password: 'hashedpassword456'
            });
            await user2.save();

            const token2 = jwt.sign({ id: user2._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

            // Request with first user's token
            const response1 = await request(app)
                .get('/api/protected')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response1.status).toBe(200);
            expect(response1.body.user.email).toBe('middleware@example.com');

            // Request with second user's token
            const response2 = await request(app)
                .get('/api/protected')
                .set('Authorization', `Bearer ${token2}`);

            expect(response2.status).toBe(200);
            expect(response2.body.user.email).toBe('middleware2@example.com');
        });
    });
});
