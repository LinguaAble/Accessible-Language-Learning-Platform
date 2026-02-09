# Team Member Setup Guide

## 👋 Welcome to LinguaAble!

This guide will help you set up your environment variables and get everything running smoothly.

---

## 🛠️ Environment Setup

You need to create **two** `.env` files. One for the frontend and one for the backend.

### 1. Backend Configuration
Create a file named `.env` in the `backend/` folder:

```env
# Server Port
PORT=5000

# Database Connection (Ask Team Lead for Atlas URI if needed)
MONGO_URI=mongodb://localhost:27017/linguaable

# Authentication Secret (Any long random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Email Service (Optional for local dev)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 2. Frontend Configuration
Create a file named `.env` in the `frontend/` folder:

```env
# API Base URL
VITE_API_URL=http://localhost:5000

# Google Auth (If working on Login features)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 🚀 Common Commands

| Command | Where to run | Description |
|---------|--------------|-------------|
| `npm install` | `frontend` & `backend` | Installs dependencies |
| `npm run dev` | `frontend` | Starts React + Vite server |
| `npm run dev` | `backend` | Starts Express server with Nodemon |
| `npm test` | `frontend` | Runs Vitest unit tests |

---

## ❓ FAQ

**Q: I see "Cors Error" in the console.**
A: Make sure your Backend is running on port 5000 and Frontend on 5173. Check `backend/index.js` for CORS configuration.

**Q: Verify email isn't sending.**
A: You need a valid `EMAIL_USER` and `EMAIL_PASS` (App Password) in `backend/.env`.
