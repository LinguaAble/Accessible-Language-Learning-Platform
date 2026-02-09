# API Documentation

Base URL: `http://localhost:5000/api`

## 🔐 Authentication

### Register User
Create a new user account.
`POST /auth/register`

**Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

### Login
Authenticate an existing user.
`POST /auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "username": "johndoe" }
}
```

---

## 📚 Lessons

### Get All Lessons
Retrieve a list of available lessons.
`GET /lessons`

### Get Lesson by ID
Retrieve details for a specific lesson.
`GET /lessons/:id`

---

## 📈 Progress

### Update Progress
Save user progress for a specific lesson.
`POST /progress/update`

**Header:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "lessonId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "score": 85,
  "completed": true
}
```

### Get User Progress
Retrieve progress statistics for the authenticated user.
`GET /progress/me`

**Header:** `Authorization: Bearer <token>`
