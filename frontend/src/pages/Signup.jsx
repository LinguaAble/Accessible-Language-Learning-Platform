import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';
import logo from '../assets/logo.png'; // Use the same logo

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const { email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Client-Side Validation (Instant Feedback)
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setLoading(true);
      // 2. Call the Backend
      // Story 8: Default settings are applied in backend (authRoutes.js)
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        email,
        password
      });

      // 3. Auto-Login upon success (Professional UX)
      localStorage.setItem('token', res.data.token);

      // Story 10: Guided Onboarding (Future Step: Redirect to /onboarding instead of /dashboard)
      navigate('/dashboard');

    } catch (err) {
      // Handle Backend Errors (e.g., "User already exists")
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Same Logo & Branding as Login Page */}
        <div className="logo-container">
          <img src={logo} alt="LinguaAble Zebra Mascot" className="app-logo" />
        </div>

        <h1 className="brand-title">LinguaAble</h1>
        <h2 className="page-title">Create Account</h2>

        {error && <div className="error-message" role="alert">{error}</div>}

        <form onSubmit={handleSignup}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="name@company.com"
              required
              autoFocus // Focus here first
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="signup-text">
          Already have an account? <Link to="/">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;