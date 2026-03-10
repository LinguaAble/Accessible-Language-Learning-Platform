# Contributing to LinguaAble - Accessible Language Learning Platform

Welcome! This guide will help you contribute to our mission of making language learning accessible to everyone.

## 📋 Table of Contents
- [Getting Started](#-getting-started)
- [Development Workflow](#-development-workflow)
- [Code Standards](#-code-standards)
- [Running Tests](#-running-tests)
- [Commit Guidelines](#-commit-guidelines)
- [Pull Request Process](#-pull-request-process)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.0.0 or higher
- **MongoDB** (Local or Atlas)
- **Git**

### First-Time Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/LinguaAble/Accessible-Language-Learning-Platform.git
   cd Accessible-Language-Learning-Platform
   ```

2. **Install Dependencies**
   
   **Frontend:**
   ```bash
   cd frontend
   npm install
   ```

   **Backend:**
   ```bash
   cd ../backend
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in both `frontend` and `backend` directories.
   
   **Frontend (.env):**
   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_GOOGLE_SPEECH_KEY=your_google_speech_api_key
   ```

   **Backend (.env):**
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   BREVO_USER=your_brevo_email
   BREVO_PASS=your_brevo_smtp_password
   GROQ_API_KEY=your_groq_api_key
   ```

---

## 💻 Development Workflow

To start the development servers:

**Frontend (React + Vite):**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

**Backend (Node + Express):**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

---

## 📝 Code Standards

### Frontend (React)
- Use **Functional Components** with Hooks.
- Use **Context API** for global state (UserContext, NotificationContext).
- Follow **ESLint** rules (`npm run lint`).
- Maintain clean and modular component structure.
- Ensure **Accessibility (a11y)** standards — ARIA labels, keyboard navigation, dyslexia-friendly design.
- Use **Vanilla CSS** with CSS variables for theming (no Tailwind).
- Use **Lucide React** for icons.

### Backend (Node.js)
- Use **Async/Await** for asynchronous operations.
- Follow RESTful API design principles.
- Use **Mongoose** for database interactions.
- Use **validator.js** for input validation on models.
- Mock external services (Nodemailer, GROQ API) in tests.

---

## 🧪 Running Tests

### Backend (Jest + Supertest)
```bash
cd backend
npm test                        # Run all 141 tests
npm test -- auth.test.js        # Run specific file
npm run test:watch              # Watch mode
npm test -- --coverage          # Coverage report
```

### Frontend (Vitest + React Testing Library)
```bash
cd frontend
npm test                        # Run all ~200+ tests
npm test -- run                 # Run once (no watch)
npm run test:ui                 # Interactive test UI
npm run test:coverage           # Coverage report
```

> See [TESTING.md](TESTING.md) for the full testing strategy and [backend/TEST_GUIDE.md](backend/TEST_GUIDE.md) + [frontend/TEST_GUIDE.md](frontend/TEST_GUIDE.md) for detailed test guides.

---

## 📋 Commit Guidelines

We follow the **Conventional Commits** specification:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Build process changes, dependency updates, configuration

**Example:**
```
feat: add user profile page
fix: resolve login authentication error
feat(mobile): add AI widgets and API services
chore(backend): update user model for mobile compatibility
test: add dashboard unit tests
```

---

## 🔄 Pull Request Process

1. **Fork the repository** and create your branch from `main`.
2. **Title your PR** clearly (e.g., `feat: Add new dashboard widget`).
3. **Describe your changes** in detail in the PR description.
4. **Ensure all checks pass** — run `npm test` in both `frontend` and `backend`.
5. **Run linting**: `cd frontend && npm run lint`.
6. **Request a review** from a maintainer.

Thank you for contributing! 🚀
