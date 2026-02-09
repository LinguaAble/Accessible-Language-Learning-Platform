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

### 3. Start the App
Run the development servers. You'll need two terminal windows.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
# App opens at http://localhost:5173
```

---

## 🛑 Troubleshooting

### MongoDB Connection Error?
- Ensure you have a `.env` file in `backend/` with `MONGO_URI`.
- Ensure your local MongoDB is running OR your Atlas IP is whitelisted.
