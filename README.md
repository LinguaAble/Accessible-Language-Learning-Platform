# Accessible Language Learning Platform

> A full-stack accessible language learning platform determined to make education available to everyone — including users with learning disabilities like dyslexia, ADHD, and autism.

[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-19.2.0-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/vite-7.2.4-purple)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/mongodb-Atlas-green)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/express-5.2.1-white)](https://expressjs.com/)
[![Flutter](https://img.shields.io/badge/flutter-mobile-02569B)](https://flutter.dev/)

---

## 📖 Table of Contents
- [Overview](#-overview)
- [Features](#-features)
- [Design & Architecture Diagrams](#-design--architecture-diagrams-staruml)
- [Project Structure](#-project-structure)
- [Technology Stack](#️-technology-stack)
- [Getting Started](#-getting-started)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)


---

## 📚 Project Documentation

### For Contributors

| Document | Description |
|----------|-------------|
| [**CONTRIBUTING.md**](CONTRIBUTING.md) | 📝 Complete guide to contributing code |
| [**DEVELOPMENT.md**](DEVELOPMENT.md) | 🛠️ Development environment setup |
| [**ARCHITECTURE.md**](ARCHITECTURE.md) | 🏛️ System architecture and design |
| [**TESTING.md**](TESTING.md) | 🧪 Testing strategies and CI/CD |

### For Users

| Document | Description |
|----------|-------------|
| [**QUICK_START.md**](QUICK_START.md) | ⚡ Fast setup guide |
| [**TEAM_SETUP_GUIDE.md**](TEAM_SETUP_GUIDE.md) | 👥 Team onboarding |

### Technical Documentation

| Document | Description |
|----------|-------------|
| [**frontend/README.md**](frontend/README.md) | Frontend-specific documentation |
| [**API.md**](API.md) | Backend API documentation |
| [**backend/TEST_GUIDE.md**](backend/TEST_GUIDE.md) | Backend testing guide |
| [**frontend/TEST_GUIDE.md**](frontend/TEST_GUIDE.md) | Frontend testing guide |
| [**SECURITY_CHECKLIST.md**](SECURITY_CHECKLIST.md) | 🔒 Security guidelines |

---

## 🌟 Overview
**Accessible Language Learning Platform** (LinguaAble) is designed to provide an inclusive learning environment for all users. Ideally suited for diverse learning needs, it combines modern web technologies with accessibility-first design principles.

Key goals:
- **Inclusivity**: Tailored for users with different abilities including dyslexia, ADHD, and autism.
- **Engagement**: Gamified elements like leaderboards, streaks, daily goals, and AI-powered recommendations.
- **Simplicity**: Clean, distraction-free interface with accessibility features like bionic reading, color overlays, and dyslexia-friendly fonts.
- **Multi-Platform**: Available on Web (React + Vite), Mobile (Flutter), with a shared REST API backend.

---

## 🧩 Design & Architecture Diagrams (StarUML)

The following diagrams were created using StarUML and related design tools to represent the architecture, behavior, and data structure of the Accessible Language Learning Platform.  
These diagrams help contributors and reviewers clearly understand the system design, interactions, and database structure.

---

### 🏛️ Architecture Diagram

Illustrates the high-level system architecture, showing how the frontend (React), backend (Node.js + Express), database (MongoDB), and external services (GROQ AI, Brevo Email, Google Cloud STT) interact.

![Architecture Diagram](https://github.com/LinguaAble/Accessible-Language-Learning-Platform/blob/main/ARCHITECTURE%20DIAGRAM.jpeg)

---

### 📊 Activity Diagram

Illustrates the overall workflow of the platform, from user authentication to lesson access, practice sessions, and progress tracking.

![Activity Diagram](https://github.com/LinguaAble/Accessible-Language-Learning-Platform/blob/main/ActivityDiagram.jpg)

---

### 🧱 Class Diagram

Represents the static structure of the system, including core classes, their attributes, methods, and relationships used across backend models and frontend components.

![Class Diagram](https://github.com/LinguaAble/Accessible-Language-Learning-Platform/blob/main/CLASSDIAGRAM.jpg)

---

### 🗄️ Schema Diagram

Shows the database schema design, detailing collections, attributes, and relationships between entities such as users, lessons, progress, and leaderboard data.

![Schema Diagram](https://github.com/LinguaAble/Accessible-Language-Learning-Platform/blob/main/SCHEME_PK_FK.png)

---

### 👤 Use Case Diagram

Depicts the interactions between different user roles (Learner, Admin) and the system, highlighting key functionalities such as authentication, lesson management, and progress monitoring.

![Use Case Diagram](https://github.com/LinguaAble/Accessible-Language-Learning-Platform/blob/main/UseCaseDiagram.jpg)

---

### 🔁 Sequence Diagram

Shows the sequence of interactions between the frontend, backend, and database during key operations such as login, lesson retrieval, and leaderboard updates.

![Sequence Diagram](https://github.com/LinguaAble/Accessible-Language-Learning-Platform/blob/main/SequenceDiagram.jpg)



## ✨ Features

### 🎨 User Experience
- **Interactive Dashboard**: A central hub to track progress, streaks, daily goals, weekly charts, and quick actions.
- **Accessible Design**: Bionic reading mode, dyslexia-friendly fonts, color overlays, reduce-motion support, and adjustable font sizes.
- **Responsive Layout**: Optimized for various devices and screen sizes.
- **Sound Effects**: Optional click and navigation sounds for enhanced engagement.
- **Smart Notifications**: Inactivity reminders, break reminders, goal check-ins, and milestone alerts with quiet hours and throttling.

### 📚 Learning & Gamification
- **Structured Lessons**: 45 lessons across 3 chapters — Script (vowels, consonants, pronunciation), Vocabulary (numbers, family, colors, food), and Grammar (pronouns, verbs, sentences, adjectives).
- **NLP-Powered Pronunciation Evaluation**: Backend NLP engine using Double Metaphone, Levenshtein distance, Dice/Bigram similarity, and Hindi transliteration for intelligent speech evaluation.
- **Speech Recognition**: Google Cloud Speech-to-Text integration for real-time pronunciation practice.
- **AI Study Coach**: GROQ-powered LinguaBot chatbot for personalized learning guidance, recommendations, and Hindi language questions.
- **AI Daily Study Plan**: Intelligent daily lesson recommendations based on scores, streaks, and completion data.
- **Learning Reports**: Per-lesson score reports with detailed breakdowns after each lesson.
- **Progress Reports**: Comprehensive progress tracking with weekly charts and statistics.
- **Leaderboard**: Weekly score-based competitive leaderboard (top 50 users).
- **Streak System**: Consecutive daily goal tracking with automatic reset logic.
- **Daily Goals**: Configurable daily study time goals with progress rings.

### 🤝 Social & Community
- **Community Page**: Friend requests, friend list, and social features.
- **Friend System**: Send, accept, and reject friend requests with mutual auto-accept.
- **User Search**: Find users by username, full name, or email.
- **Public Profiles**: View other users' profiles with relationship-aware data visibility.

### 🔐 Authentication & Security
- **Secure Login/Signup**: JWT-based authentication with 7-day token expiry.
- **OAuth Support**: Google Sign-In integration.
- **Password Management**: Forgot/Reset password functionality via OTP email (Brevo SMTP).
- **Protected Routes**: JWT middleware protecting all sensitive API endpoints.
- **Login History**: Track the last 10 login timestamps and devices.

### 📱 Mobile App
- **Flutter**: Cross-platform mobile application with Android, iOS, Web, Windows, Linux, and macOS support.
- **Shared Backend**: Uses the same REST API as the web frontend.

---

## 📁 Project Structure

```bash
Accessible-Language-Learning-Platform/
├── backend/                    # Node.js + Express Backend
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT protect middleware
│   ├── models/
│   │   └── User.js             # Mongoose User model (profile, progress, friends, scores)
│   ├── routes/
│   │   ├── authRoutes.js       # Auth, profile, progress, leaderboard, friends, community
│   │   ├── aiRoutes.js         # AI daily plan + LinguaBot chatbot (GROQ API)
│   │   └── nlpEvalRoutes.js    # NLP pronunciation evaluation engine
│   ├── tests/                  # 6 Jest + Supertest test files (141 tests)
│   │   ├── auth.test.js
│   │   ├── middleware.test.js
│   │   ├── profile.test.js
│   │   ├── progress.test.js
│   │   ├── settings.test.js
│   │   ├── userData.test.js
│   │   └── setup.js
│   ├── .env                    # Environment variables
│   ├── createAdmin.js          # Admin creation script
│   ├── index.js                # Entry point
│   ├── jest.config.js          # Jest test configuration
│   └── TEST_GUIDE.md           # Backend testing guide
├── frontend/                   # React (Vite) Frontend Application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── assets/             # Images and icons
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Layout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── AccessibilityWidget.jsx
│   │   │   ├── ChatBot.jsx       # AI LinguaBot chatbot
│   │   │   ├── DailyStudyPlan.jsx # AI daily recommendations
│   │   │   ├── NotificationBell.jsx
│   │   │   └── NotificationToast.jsx
│   │   ├── context/
│   │   │   ├── UserContext.jsx    # Auth, preferences, progress, streak state
│   │   │   └── NotificationContext.jsx # Notification system (inactivity, breaks, goals, milestones)
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Lessons.jsx
│   │   │   ├── LearningScreen.jsx  # Core interactive lesson screen (speech, NLP, scoring)
│   │   │   ├── LearningReport.jsx  # Per-lesson score report
│   │   │   ├── ProgressReport.jsx  # Overall progress analytics
│   │   │   ├── Leaderboard.jsx     # Weekly score leaderboard
│   │   │   ├── Community.jsx       # Friends & social
│   │   │   ├── UserProfile.jsx     # Public user profiles
│   │   │   ├── Settings.jsx        # Profile editing & preferences
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── ResetPassword.jsx
│   │   ├── utils/
│   │   │   ├── googleSpeechService.js  # Google Cloud STT API integration
│   │   │   ├── nlpEvalService.js       # NLP evaluation API client
│   │   │   └── soundUtils.js           # Sound effects utilities
│   │   ├── tests/              # 13 Vitest + RTL test files (~200+ tests)
│   │   ├── App.jsx             # Main App component with routing
│   │   ├── App.css / index.css / Dashboard.css / LandingPage.css / Learning.css
│   │   └── main.jsx            # App entry point
│   ├── .env                    # Environment variables
│   ├── eslint.config.js        # ESLint configuration
│   ├── vitest.config.js        # Vitest test configuration
│   ├── vercel.json             # Vercel deployment configuration
│   ├── index.html              # HTML entry point
│   ├── vite.config.js          # Vite configuration
│   └── TEST_GUIDE.md           # Frontend testing guide
├── mobile/                     # Flutter Mobile Application
│   ├── lib/                    # Dart source code
│   ├── android/                # Android platform files
│   ├── ios/                    # iOS platform files
│   ├── web/                    # Web platform files
│   ├── windows/                # Windows platform files
│   ├── linux/                  # Linux platform files
│   ├── macos/                  # macOS platform files
│   ├── pubspec.yaml            # Flutter dependencies
│   └── test/                   # Flutter tests
├── API.md                      # API Documentation
├── ARCHITECTURE.md             # System Architecture
├── CONTRIBUTING.md             # Contribution Guidelines
├── DEVELOPMENT.md              # Development Setup Guide
├── QUICK_START.md              # Quick Start Guide
├── SECURITY_CHECKLIST.md       # Security Checklist
├── TEAM_SETUP_GUIDE.md         # Team Onboarding Guide
├── TESTING.md                  # Testing Strategy
├── Dashboard_unit_testing.md   # Dashboard Component Test Documentation
└── README.md                   # Project Documentation
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19.2 (via Vite 7.x)
- **Styling**: Vanilla CSS with CSS variables for theming
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router DOM v7
- **Auth**: Google OAuth (@react-oauth/google), JWT (jwt-decode)
- **State Management**: React Context API (UserContext, NotificationContext)
- **Testing**: Vitest 4.x, React Testing Library 16.x, jsdom 28.x

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: MongoDB (Mongoose 9.x)
- **Authentication**: JWT (jsonwebtoken), Google OAuth, Bcryptjs
- **Email Service**: Nodemailer via Brevo SMTP
- **AI Integration**: GROQ API (Llama 3.3-70B) for chatbot and daily study plans
- **NLP Engine**: natural (Double Metaphone, Levenshtein distance), string-similarity (Dice/Bigram)
- **Validation**: validator.js
- **Testing**: Jest 30.x, Supertest 7.x, MongoDB Memory Server

### Mobile
- **Framework**: Flutter (Dart)
- **Platforms**: Android, iOS, Web, Windows, Linux, macOS

### Infrastructure
| Service | Purpose |
|---------|---------|
| **MongoDB Atlas** | Cloud Database |
| **Vercel** | Frontend Hosting |
| **GROQ Cloud** | AI/LLM API |
| **Brevo SMTP** | Transactional Email |
| **Google Cloud** | Speech-to-Text API, OAuth |

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

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Create a .env file with:
   # PORT=5000
   # MONGO_URI=your_mongodb_connection_string
   # JWT_SECRET=your_jwt_secret
   # BREVO_USER=your_brevo_email
   # BREVO_PASS=your_brevo_smtp_password
   # GROQ_API_KEY=your_groq_api_key
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   # Create a .env file with:
   # VITE_GOOGLE_CLIENT_ID=your_google_client_id
   # VITE_GOOGLE_SPEECH_KEY=your_google_speech_api_key
   npm run dev
   ```

4. **Access the App**
   - Frontend: `http://localhost:5173` (default Vite port)
   - Backend: `http://localhost:5000`

---

## 🧪 Testing

### Backend Tests (Jest + Supertest)
```bash
cd backend
npm test                        # Run all 141 tests
npm test -- auth.test.js        # Run specific file
npm test -- --coverage          # Run with coverage
```

### Frontend Tests (Vitest + React Testing Library)
```bash
cd frontend
npm test                        # Run all ~200+ tests
npm run test:ui                 # Interactive test UI
npm run test:coverage           # Run with coverage
```

See [TESTING.md](TESTING.md) for the full testing strategy.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full contribution guidelines.

---

## 📄 License

No license is currently specified for this project.
