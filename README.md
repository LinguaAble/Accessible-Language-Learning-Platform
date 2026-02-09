# Accessible Language Learning Platform

> A full-stack accessible language learning platform determined to make education available to everyone.

[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-19.0.0-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/vite-6.0.0-purple)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/mongodb-6.0.0-green)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/express-4.18.2-white)](https://expressjs.com/)

---

## 📖 Table of Contents
- [Overview](#-overview)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview
**Accessible Language Learning Platform** (LinguaAble) is designed to provide an inclusive learning environment for all users. Ideally suited for diverse learning needs, it combines modern web technologies with accessibility-first design principles.

Key goals:
- **Inclusivity**: Tailored for users with different abilities.
- **Engagement**: Gamified elements like leaderboards and interactive lessons.
- **Simplicity**: Clean, distraction-free interface.

---

## ✨ Features

### 🎨 User Experience
- **Interactive Dashboard**: A central hub to track progress and access lessons.
- **Accessible Design**: Features like "Reduce Motion" support and clear typography.
- **Responsive Layout**: Optimized for various devices and screen sizes.

### 📚 Learning & Gamification
- **Structured Lessons**: Step-by-step language modules (`Lessons.jsx`, `LearningScreen.jsx`).
- **Practice Mode**: Reinforce learning with dedicated practice sessions.
- **Leaderboard**: Compete with others and track your ranking.

### 🔐 Authentication & Security
- **Secure Login/Signup**: JWT-based authentication.
- **OAuth Support**: Google Sign-In integration.
- **Password Management**: Forgot/Reset password functionality via email (Nodemailer).

---

## 📁 Project Structure

```bash
Accessible-Language-Learning-Platform/
├── frontend/                # React (Vite) Frontend Application
│   ├── src/
│   │   ├── pages/          # Application pages (Login, Dashboard, Lessons, etc.)
│   │   ├── components/     # Reusable UI components
│   │   └── context/        # State management (AuthToken, etc.)
│   └── public/             # Static assets
├── backend/                 # Node.js + Express Backend
│   ├── models/             # Mongoose Database Models
│   ├── routes/             # API Routes
│   └── index.js            # Entry point
└── README.md               # Project Documentation
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 (via Vite)
- **Styling**: Vanilla CSS / CSS Modules
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router DOM

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT, Google OAuth, Bcryptjs
- **Email Service**: Nodemailer

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/LinguaAble/Accessible-Language-Learning-Platform.git
   cd Accessible-Language-Learning-Platform
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   # Create a .env file if required (e.g., VITE_API_URL, Google Client IDs)
   npm run dev
   ```

3. **Setup Backend**
   ```bash
   cd ../backend
   npm install
   # Create a .env file with:
   # PORT=5000
   # MONGO_URI=your_mongodb_connection_string
   # JWT_SECRET=your_jwt_secret
   # EMAIL_USER=... (for Nodemailer)
   npm run dev
   ```

4. **Access the App**
   - Frontend: `http://localhost:5173` (default Vite port)
   - Backend: `http://localhost:5000`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

No license is currently specified for this project.

