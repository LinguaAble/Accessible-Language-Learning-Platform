# Quick Start - Local Development

## ⚡ Zero to Hero in 2 Minutes

### 1. Clone the Repository
```bash
git clone https://github.com/LinguaAble/Accessible-Language-Learning-Platform.git
cd Accessible-Language-Learning-Platform
```

### 2. Install Dependencies
You need to install packages for both the frontend and backend.

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 3. Configure Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
BREVO_USER=your_brevo_email
BREVO_PASS=your_brevo_smtp_password
GROQ_API_KEY=your_groq_api_key
```

**Frontend (`frontend/.env`):**
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_SPEECH_KEY=your_google_speech_api_key
```

### 4. Start the App
Run the development servers. You'll need two terminal windows.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
# ✅ MongoDB Connected (LinguaAble)
# 🚀 Server running on port 5000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
# App opens at http://localhost:5173
```

### 5. Run Tests (Optional)
```bash
# Backend: 141 tests (Jest + Supertest)
cd backend && npm test

# Frontend: ~200+ tests (Vitest + React Testing Library)
cd frontend && npm test
```

---

## 🛑 Troubleshooting

### MongoDB Connection Error?
- Ensure you have a `.env` file in `backend/` with a valid `MONGO_URI`.
- Ensure your local MongoDB is running OR your Atlas IP is whitelisted.

### Google Sign-In Not Working?
- Ensure `VITE_GOOGLE_CLIENT_ID` is set in `frontend/.env`.

### AI Features Not Working?
- Ensure `GROQ_API_KEY` is set in `backend/.env`.

### CORS Errors?
- Make sure Backend is running on port 5000 and Frontend on 5173.
