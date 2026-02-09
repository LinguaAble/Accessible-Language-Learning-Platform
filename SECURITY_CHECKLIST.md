# Security Checklist 🔒

Before deploying your LinguaAble application, ensure you have checked off the following items to keep your users and data safe.

## ✅ Implementation Checklist

### 1. Environment Variables
- [ ] **Never commit `.env` files.** Ensure `.env` is in your `.gitignore`.
- [ ] Use strong, random strings for `JWT_SECRET` (at least 32 chars).
- [ ] Store API keys (Google, Firebase, etc.) in environment variables, not in code.

### 2. Database Security
- [ ] Whitelist only trusted IP addresses in MongoDB Atlas.
- [ ] Create a dedicated database user with limited privileges (read/write only), do not use the admin user.

### 3. Authentication & Authorization
- [ ] Ensure passwords are hashed using `bcryptjs` before storage.
- [ ] Verify JWT tokens on all protected routes using middleware.
- [ ] Set strict expiration times for JWTs (e.g., 1 hour for access tokens).

### 4. API Security
- [ ] Implement Rate Limiting (e.g., `express-rate-limit`) to prevent abuse.
- [ ] Use `helmet` middleware to set secure HTTP headers.
- [ ] Validate all incoming data (e.g., `express-validator` or Joi) before processing.

### 5. Frontend Security
- [ ] Ensure no sensitive keys (like `JWT_SECRET` or Database URI) are bundled in the frontend build.
- [ ] Sanitize user input to prevent XSS (React does this by default, but be careful with `dangerouslySetInnerHTML`).

## 🚨 Incident Response
If you suspect a breach:
1. Revoke all active tokens (if using a blacklist mechanism).
2. Rotate your `JWT_SECRET` immediately.
3. Change database passwords.
