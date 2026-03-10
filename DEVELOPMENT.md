# Development Setup Guide

Complete guide for setting up your local development environment for the **Accessible Language Learning Platform**.

## 💻 System Requirements

### Required Software
| Software | Version | Purpose |
|----------|---------|---------|
| [Node.js](https://nodejs.org/) | 18.0.0+ | Runtime environment |
| [MongoDB](https://www.mongodb.com/) | 6.0+ | Database (or use MongoDB Atlas) |
| [Git](https://git-scm.com/) | 2.30+ | Version control |
| [VS Code](https://code.visualstudio.com/) | Latest | Recommended IDE |

### Optional (For Mobile Development)
| Software | Version | Purpose |
|----------|---------|---------|
| [Flutter SDK](https://flutter.dev/) | Latest | Mobile app development |
| [Android Studio](https://developer.android.com/studio) | Latest | Android emulator & tools |

---

## 🚀 Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/LinguaAble/Accessible-Language-Learning-Platform.git
cd Accessible-Language-Learning-Platform
```

### 2. Install Dependencies

You need to install dependencies for both the frontend and backend separately.

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

---

## 🔧 Environment Configuration

You must create `.env` files in both the `frontend` and `backend` directories.

### Frontend (`frontend/.env`)
```env
# Google OAuth - Client ID for Sign-In with Google
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Google Cloud Speech-to-Text API Key (for pronunciation practice)
VITE_GOOGLE_SPEECH_KEY=your_google_speech_api_key
```
> Note: The frontend auto-detects the backend URL. If you need to override it, add `VITE_API_URL=http://localhost:5000`.

### Backend (`backend/.env`)
```env
# Server Port
PORT=5000

# Database Connection
MONGO_URI=mongodb://localhost:27017/linguaable

# JWT Authentication Secret (any long random string)
JWT_SECRET=your_super_secret_key_change_me

# Email Service (Brevo SMTP for password reset OTPs)
BREVO_USER=your_brevo_email
BREVO_PASS=your_brevo_smtp_password

# AI Service (GROQ API for chatbot and daily study plans)
GROQ_API_KEY=your_groq_api_key
```

---

## 🏃 Running the Application

To run the full stack application, you need to open **two terminal windows**.

### Terminal 1: Backend Server
```bash
cd backend
npm run dev
# Server should start on http://localhost:5000
# You should see: ✅ MongoDB Connected (LinguaAble)
# And: 🚀 Server running on port 5000 (0.0.0.0)
```

### Terminal 2: Frontend Client
```bash
cd frontend
npm run dev
# Vite server should start on http://localhost:5173
```

### Optional: Mobile App
```bash
cd mobile
flutter pub get
flutter run
```

---

## 🗄️ Database Setup (MongoDB)

1. Ensure MongoDB is running locally or you have a connection string for MongoDB Atlas.
2. The application uses Mongoose, so collections will be created automatically upon the first data insertion.
3. Use **MongoDB Compass** to inspect your local database `linguaable`.

---

## 🧪 Running Tests

### Backend Tests (Jest + Supertest)
```bash
cd backend
npm test                        # Run all 141 tests
npm test -- auth.test.js        # Run specific test file
npm run test:watch              # Watch mode
npm test -- --coverage          # Coverage report
```

### Frontend Tests (Vitest + React Testing Library)
```bash
cd frontend
npm test                        # Run all ~200+ tests (watch mode)
npm test -- run                 # Run once
npm run test:ui                 # Interactive test browser UI
npm run test:coverage           # Coverage report
```

---

## 🧰 Development Tools

### Code Quality
- **ESLint**: Installed in frontend for code linting (`npm run lint`).
- **Prettier**: Recommended for consistent formatting.

### VS Code Extensions (Recommended)
- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **MongoDB for VS Code**
- **ESLint**

---

## 🔍 Troubleshooting

**Generic Issues:**
- **Port In Use**: Ensure ports `5000` (Backend) and `5173` (Frontend) are free.
- **MongoDB Connection Error**: Check if your local MongoDB service is running or your Atlas IP whitelist allows your connection.

**Frontend Issues:**
- If styles are missing or quirky, ensure you haven't deleted global CSS files (`App.css`, `index.css`, `Dashboard.css`, `Learning.css`, `LandingPage.css`).
- If Google Sign-In doesn't work, verify `VITE_GOOGLE_CLIENT_ID` in `frontend/.env`.

**Backend Issues:**
- `nodemon` not found? It's in `devDependencies`, so `npm run dev` should work. If not, install globally: `npm install -g nodemon`.
- GROQ API errors? Verify `GROQ_API_KEY` in `backend/.env`.
- Email sending fails? Verify `BREVO_USER` and `BREVO_PASS` in `backend/.env`.

**CORS Errors:**
- The backend allows any `localhost` port and `https://linguaable.vercel.app`. Check `backend/index.js` for CORS configuration.
