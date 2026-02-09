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
VITE_API_URL=http://localhost:5000
```
> Note: If you use Firebase or Google Auth, add those keys here as well (e.g., `VITE_GOOGLE_CLIENT_ID`).

### Backend (`backend/.env`)
```env
port=5000
MONGO_URI=mongodb://localhost:27017/linguaable
JWT_SECRET=your_super_secret_key_change_me
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

## 🏃 Running the Application

To run the full stack application, you need to open **two terminal windows**.

### Terminal 1: Backend Server
```bash
cd backend
npm run dev
# Server should start on http://localhost:5000
```

### Terminal 2: Frontend Client
```bash
cd frontend
npm run dev
# Vite server should start on http://localhost:5173
```

---

## 🗄️ Database Setup (MongoDB)

1. Ensure MongoDB is running locally or you have a connection string for MongoDB Atlas.
2. The application uses Mongoose, so collections will be created automatically upon the first data insertion.
3. Use **MongoDB Compass** to inspect your local database `linguaable`.

---

## 🧰 Development Tools

### Code Quality
- **ESLint**: Installed in frontend for code linting.
- **Prettier**: Recommended for consistent formatting.

### VS Code Extensions (Recommended)
- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **MongoDB for VS Code**

---

## 🔍 Troubleshooting

**Generic Issues:**
- **Port In Use**: Ensure ports `5000` (Backend) and `5173` (Frontend) are free.
- **MongoDB Connection Error**: Check if your local MongoDB service is running or your Atlas IP whitelist allows your connection.

**Frontend Issues:**
- If styles are missing or quirky, ensure you haven't deleted strictly required global CSS files.

**Backend Issues:**
- `nodemon` not found? Install it globally (`npm install -g nodemon`) or ensure it's in `devDependencies`.
