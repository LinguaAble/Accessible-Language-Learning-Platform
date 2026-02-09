# Architecture Documentation

Technical architecture overview for the **Accessible Language Learning Platform** (LinguaAble).

## 📋 Table of Contents
- [System Overview](#%EF%B8%8F-system-overview)
- [Technology Stack](#%EF%B8%8F-technology-stack)
- [Architecture Diagram](#-architecture-diagram)
- [Component Architecture](#-component-architecture)
- [Data Flow](#-data-flow)
- [Database Design](#%EF%B8%8F-database-design-mongodb)

---

## 🏗️ System Overview

LinguaAble follows a classic **MERN** (MongoDB, Express, React, Node.js) architecture. It is designed as a Single Page Application (SPA) that communicates with a RESTful backend API.

### High-Level Architecture
```mermaid
graph LR
    User[User] -->|HTTPS| Client[Frontend (React + Vite)]
    Client -->|REST API| Server[Backend (Express + Node.js)]
    Server -->|Mongoose| DB[(MongoDB)]
    Server -->|SMTP| Email[Email Service (Nodemailer)]
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI Library |
| **Vite** | Build Tool & Dev Server |
| **Context API** | State Management (Auth, Theme) |
| **Axios** | HTTP Client |
| **CSS Modules** | Component-level Styling |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime Environment |
| **Express.js** | Web Framework |
| **Mongoose** | ODM for MongoDB |
| **JWT** | Stateless Authentication |
| **Nodemailer** | Email Notifications |

### Infrastructure
| Service | Purpose |
|---------|---------|
| **MongoDB Atlas** | Cloud Database (or Local MongoDB) |
| **Vercel/Netlify** | Frontend Hosting (Recommended) |
| **Render/Heroku** | Backend Hosting (Recommended) |

---

## 📐 Architecture Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                         Client Layer                           │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  React Application (Port 5173)                         │  │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │  │
│  │  │Dashboard│  │ Learning │  │ AuthPages│  │Settings│ │  │
│  │  └─────────┘  └──────────┘  └──────────┘  └────────┘ │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │     Context API (AuthContext, ThemeContext)     │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
                            │
                            │ REST API (JSON)
                            │
┌───────────────────────────────────────────────────────────────┐
│                      Application Layer                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Express Server (Port 5000)                            │  │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │  │
│  │  │ Routes  │  │Middleware│  │Controllers│  │ Models │ │  │
│  │  └─────────┘  └──────────┘  └──────────┘  └────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
                            │
                            │ Mongoose Connection
                            │
┌───────────────────────────────────────────────────────────────┐
│                         Data Layer                             │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  MongoDB Database                                      │  │
│  │   - Users Collection                                   │  │
│  │   - Lessons Collection                                 │  │
│  │   - Progress Collection                                │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

---

## 🧩 Component Architecture

### Frontend Hierarchy
```
App
├── AuthProvider
│   ├── PrivateRoute
│   │   ├── Dashboard
│   │   ├── LearningScreen
│   │   └── ProfileSettings
│   │
│   ├── PublicRoute
│   │   ├── Login
│   │   ├── Signup
│   │   └── LandingPage
│   │
│   └── Navbar / Sidebar
```

### Key Components
- **AuthContext**: Manages user session state (JWT storage, login/logout functions).
- **PrivateRoute**: Higher Order Component (HOC) that protects routes requiring authentication.
- **LearningScreen**: The core interactive component for lessons, handling speech synthesis (TTS) and input validation.

---

## 🔄 Data Flow

### Authentication Flow (JWT)
1. **User Login**: User submits email/password.
2. **Verification**: Backend validates credentials via `bcryptjs`.
3. **Token Issue**: Server signs a JWT and sends it back.
4. **Storage**: Client stores JWT in `localStorage`.
5. **Access**: Client attaches `Authorization: Bearer <token>` to subsequent requests.

### Lesson Completion Flow
1. **Interaction**: User answers a question in `LearningScreen`.
2. **Validation**: Frontend checks the answer (or sends to backend if complex).
3. **Update**: Frontend sends `POST /api/progress/update` with results.
4. **Persistence**: Backend updates the `Progress` document for the user in MongoDB.
5. **Feedback**: Backend returns new XP/Level; Frontend updates the UI.

---

## 🗄️ Database Design (MongoDB)

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String, // Hashed
  xp: Number,
  level: Number,
  createdAt: Date
}
```

### Lessons Collection
```javascript
{
  _id: ObjectId,
  title: String,
  difficulty: "beginner" | "intermediate",
  content: [
    {
      type: "mcq" | "text_input",
      question: String,
      correctAnswer: String
    }
  ]
}
```

### Progress Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to Users
  lessonId: ObjectId, // Reference to Lessons
  status: "completed" | "in-progress",
  score: Number,
  lastAccessed: Date
}
```
