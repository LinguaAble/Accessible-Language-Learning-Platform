# Testing Guide

This project does not currently have a pre-configured testing environment. This guide provides step-by-step instructions to set up testing for both the Frontend (Vitest) and Backend (Jest).

## 🎯 Testing Strategy
- **Frontend**: Unit & Component tests using **Vitest** + **React Testing Library**.
- **Backend**: API & Unit tests using **Jest** + **Supertest**.
- **E2E**: End-to-End user journey tests using **Cypress**.

---

## 🎨 Frontend Testing (Vitest)

We recommend **Vitest** for the frontend as it is built natively for Vite, offering faster performance than Jest for this stack.

### 1. Installation
Run the following inside the `frontend` directory:

```bash
cd frontend
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

### 2. Configuration (`vite.config.js`)
Update your `vite.config.js` (or `.ts`) to include the test configuration:

```javascript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.js', // We will create this next
  },
})
```

### 3. Setup File
Create a new file at `frontend/src/tests/setup.js`:

```javascript
import '@testing-library/jest-dom';
```

### 4. Add Test Script
Add the following script to `frontend/package.json`:

```json
"scripts": {
  "test": "vitest",
  "test:ui": "vitest --ui",
  "coverage": "vitest run --coverage"
}
```

### 5. Example Test
Create `frontend/src/components/Example.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn/i); // Adjust text based on your App content
  expect(linkElement).toBeInTheDocument();
});
```

---

## 🔧 Backend Testing (Jest)

We use **Jest** for the backend as it is the industry standard for Node.js testing.

### 1. Installation
Run the following inside the `backend` directory:

```bash
cd backend
npm install -D jest supertest
```

### 2. Configuration
Initialize Jest (or create `jest.config.js` manually):

```bash
npx jest --init
# Choose: Node environment, Coverage=Yes, Babel=No (since we use CommonJS)
```

### 3. Add Test Script
Add the following script to `backend/package.json`:

```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch"
}
```

### 4. Separation of Concerns (Important)
To test your Express app without starting the server on a port every time, separate your app definition from the server listener.

**Update `index.js` (or `app.js`) to export the app:**
```javascript
// app.js
const express = require('express');
const app = express();
// ... routes ...
module.exports = app;
```

**Create `server.js` to listen:**
```javascript
// server.js
const app = require('./app');
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### 5. Example API Test
Create `backend/tests/auth.test.js`:

```javascript
const request = require('supertest');
const app = require('../app'); // Import the exported app

describe('GET /', () => {
  it('reviews an endpoint', async () => {
    const res = await request(app).get('/api/health'); // Adjust route
    expect(res.statusCode).toEqual(200);
  });
});
```

---

## 🎭 End-to-End Testing (Cypress)

1. **Install Cypress** in the `frontend` folder:
   ```bash
   cd frontend
   npm install -D cypress
   ```
2. **Open Cypress**:
   ```bash
   npx cypress open
   ```
3. Follow the UI to configure E2E testing. It will create a `cypress` folder with example specs.

---

## 🔄 CI/CD Example (GitHub Actions)

Create `.github/workflows/test.yml` to automate tests on push:

```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Frontend Tests
        working-directory: ./frontend
        run: |
          npm install
          npm test -- --run
          
      - name: Backend Tests
        working-directory: ./backend
        run: |
          npm install
          npm test
```
