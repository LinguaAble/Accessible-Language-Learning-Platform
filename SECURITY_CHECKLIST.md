# Security Checklist 🔒

Before deploying your LinguaAble application, ensure you have checked off the following items to keep your users and data safe.

## ✅ Implementation Checklist

### 1. Environment Variables
- [ ] **Never commit `.env` files.** Ensure `.env` is in your `.gitignore`.
- [ ] Use strong, random strings for `JWT_SECRET` (at least 32 chars).
- [ ] Store all API keys in environment variables, not in code:
  - `MONGO_URI` — Database connection string
  - `JWT_SECRET` — Authentication token signing
  - `BREVO_USER` / `BREVO_PASS` — Email SMTP credentials
  - `GROQ_API_KEY` — AI/LLM API key
  - `VITE_GOOGLE_CLIENT_ID` — Google OAuth Client ID
  - `VITE_GOOGLE_SPEECH_KEY` — Google Cloud STT API key

### 2. Database Security
- [ ] Whitelist only trusted IP addresses in MongoDB Atlas.
- [ ] Create a dedicated database user with limited privileges (read/write only), do not use the admin user.
- [ ] Ensure password reset tokens (`resetPasswordToken`) are hashed (SHA-256) before storage.
- [ ] OTP tokens expire after 1 minute (`resetPasswordExpire`).

### 3. Authentication & Authorization
- [ ] Ensure passwords are hashed using `bcryptjs` (salt rounds: 10) before storage.
- [ ] Verify JWT tokens on all protected routes using `authMiddleware.js`.
- [ ] Set appropriate expiration times for JWTs (currently 7 days).
- [ ] Validate email format using `validator.isEmail` at the model level.
- [ ] Enforce minimum password length (6 characters) at the model level.
- [ ] Cap login history to 10 entries to prevent unbounded document growth.

### 4. API Security
- [ ] Implement CORS restrictions — only allow `localhost` ports and production URL (`linguaable.vercel.app`).
- [ ] Set request body size limits (`express.json({ limit: '10mb' })`).
- [ ] Validate all incoming data before processing (email required for user operations).
- [ ] Implement Rate Limiting (e.g., `express-rate-limit`) to prevent abuse — *Recommended*.
- [ ] Use `helmet` middleware to set secure HTTP headers — *Recommended*.

### 5. Frontend Security
- [ ] Ensure no sensitive keys (like `JWT_SECRET`, `MONGO_URI`, `GROQ_API_KEY`) are bundled in the frontend build. Only `VITE_` prefixed variables are exposed.
- [ ] Sanitize user input to prevent XSS (React does this by default, but be careful with `dangerouslySetInnerHTML`).
- [ ] Store JWT in `localStorage` — consider `httpOnly` cookies for enhanced security in production.
- [ ] Validate bio length (max 500 chars) and gender enum on both frontend and backend.

### 6. External Service Security
- [ ] Rotate `GROQ_API_KEY` periodically.
- [ ] Monitor GROQ API usage to prevent unexpected charges.
- [ ] Ensure Brevo SMTP credentials are app-specific passwords, not primary account passwords.
- [ ] Restrict Google Cloud Speech API key to specific domains/IPs.
- [ ] Restrict Google OAuth Client ID to authorized origins.

## 🚨 Incident Response
If you suspect a breach:
1. Revoke all active tokens by rotating your `JWT_SECRET` immediately.
2. Change database passwords and update `MONGO_URI`.
3. Rotate all API keys (`GROQ_API_KEY`, `BREVO_PASS`, `VITE_GOOGLE_SPEECH_KEY`).
4. Review login history for suspicious activity.
5. Notify affected users if data was compromised.
