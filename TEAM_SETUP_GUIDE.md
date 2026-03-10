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

# Authentication Secret (Any long random string, min 32 chars)
JWT_SECRET=your_super_secret_jwt_key_here

# Email Service — Brevo SMTP (for password reset OTPs)
BREVO_USER=your_brevo_email
BREVO_PASS=your_brevo_smtp_password

# AI Service — GROQ API (for chatbot and daily study plans)
GROQ_API_KEY=your_groq_api_key
```

### 2. Frontend Configuration
Create a file named `.env` in the `frontend/` folder:

```env
# Google OAuth (for Sign-In with Google)
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Google Cloud Speech-to-Text API (for pronunciation practice)
VITE_GOOGLE_SPEECH_KEY=your_google_speech_api_key
```

> **Note:** Contact the Team Lead for shared API keys if needed.

---

## 🚀 Common Commands

| Command | Where to run | Description |
|---------|--------------|-------------|
| `npm install` | `frontend` & `backend` | Installs dependencies |
| `npm run dev` | `frontend` | Starts React + Vite server (port 5173) |
| `npm run dev` | `backend` | Starts Express server with Nodemon (port 5000) |
| `npm test` | `backend` | Runs 141 Jest tests |
| `npm test` | `frontend` | Runs ~200+ Vitest tests |
| `npm run test:ui` | `frontend` | Opens interactive test browser UI |
| `npm run test:coverage` | `frontend` | Runs tests with coverage report |
| `npm run lint` | `frontend` | Runs ESLint |

---

## ❓ FAQ

**Q: I see "CORS Error" in the console.**  
A: Make sure your Backend is running on port 5000 and Frontend on 5173. The backend allows any `localhost` port. Check `backend/index.js` for CORS configuration.

**Q: Password reset email isn't sending.**  
A: You need valid `BREVO_USER` and `BREVO_PASS` in `backend/.env`. These are Brevo SMTP credentials (not Gmail).

**Q: AI chatbot / Daily Study Plan isn't working.**  
A: You need a valid `GROQ_API_KEY` in `backend/.env`. Get one from [console.groq.com](https://console.groq.com/).

**Q: Google Sign-In doesn't work.**  
A: Ensure `VITE_GOOGLE_CLIENT_ID` is set in `frontend/.env` and the authorized origins include `http://localhost:5173`.

**Q: Speech recognition doesn't work in lessons.**  
A: Ensure `VITE_GOOGLE_SPEECH_KEY` is set in `frontend/.env`. Also, speech recognition requires `https` in production or `localhost` in development.
