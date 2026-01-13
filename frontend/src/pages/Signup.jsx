import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

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
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        email,
        password
      });

      // 3. Auto-Login upon success (Professional UX)
      localStorage.setItem('token', res.data.token);
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
        <h1>Create Account</h1>
        <p className="subtitle">Join LinguaAble today</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSignup}>
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="name@company.com"
              required 
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="Create a password"
              required 
            />
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input 
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

        <p style={{ marginTop: '20px', color: '#7f8c8d' }}>
          Already have an account? <Link to="/" style={{ color: '#3498db' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;