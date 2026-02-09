# Contributing to LinguaAble - Accessible Language Learning Platform

Welcome! This guide will help you contribute to our mission of making language learning accessible to everyone.

## 📋 Table of Contents
- [Getting Started](#-getting-started)
- [Development Workflow](#-development-workflow)
- [Code Standards](#-code-standards)
- [Commit Guidelines](#-commit-guidelines)
- [Pull Request Process](#-pull-request-process)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.0.0 or higher
- **MongoDB** (Local or Atlas)
- **Git**
- **Vite** (optional, but recommended)

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
   VITE_API_URL=http://localhost:5000
   ```

   **Backend (.env):**
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
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
- Follow **ESLint** rules.
- Maintain clean and modular component structure.
- Ensure **Accessibility (a11y)** standards (ARIA labels, keyboard navigation).

### Backend (Node.js)
- Use **Async/Await** for asynchronous operations.
- Follow RESTful API design principles.
- Use **Mongoose** for database interactions.

---

## 📋 Commit Guidelines

We follow the **Conventional Commits** specification:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests

**Example:**
```
feat: add user profile page
fix: resolve login authentication error
```

---

## 🔄 Pull Request Process

1. **Fork the repository** and create your branch from `main`.
2. **Title your PR** clearly (e.g., `feat: Add new dashboard widget`).
3. **Describe your changes** in detail in the PR description.
4. **Ensure all checks pass** (linting, tests if available).
5. **Request a review** from a maintainer.

Thank you for contributing! 🚀
