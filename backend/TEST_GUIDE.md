# Backend Testing Guide

This guide covers testing strategies for the Node.js + Express backend.

## 🛠️ Prerequisites
- **Jest**: Test runner
- **Supertest**: HTTP assertions
- **MongoDB Memory Server** (Optional, for isolated DB tests)

## 🏃 Running Tests

```bash
cd backend
npm test
```

## 🧪 Writing Tests

We use `supertest` to test API endpoints without running the actual server.

### Example: Auth Route Test (`tests/auth.test.js`)

```javascript
const request = require('supertest');
const app = require('../index'); // Import your Express app
const mongoose = require('mongoose');

describe('Auth Endpoints', () => {
  
  beforeAll(async () => {
    // Connect to a test database
    await mongoose.connect(process.env.MONGO_URI_TEST);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@test.com',
        password: 'Password123'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
  });

});
```

## 🔍 Coverage
Run `npm test -- --coverage` to see which lines of code are covered by tests.
