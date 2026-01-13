import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // We will style this next
import { Link } from 'react-router-dom';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); // Story 4
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { 
        email, 
        password,
        rememberMe // Send preference to backend if needed, or handle locally
      });
      
      // Story 4: Stay Signed In
      if (rememberMe) {
        localStorage.setItem('token', res.data.token);
      } else {
        sessionStorage.setItem('token', res.data.token); // Clears on close
      }
      
      // Story 9: Redirect to last activity
      navigate('/dashboard');
      
    } catch (err) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Unable to sign in. Please check your internet connection.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Story 1: Minimal Layout - High Contrast Header */}
        <h1 className="brand-title">LinguaAble</h1>
        <h2 className="page-title">Welcome Back</h2>
        
        {error && <div className="error-message" role="alert">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required 
              autoFocus // Story 6: Reduce steps
            />
          </div>

          <div className="input-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              {/* Story 3: Account Recovery */}
              <Link to="/forgot-password" class="forgot-link">Forgot Password?</Link>
            </div>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required 
            />
          </div>

          {/* Story 4: Stay Signed In */}
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe">Stay signed in</label>
          </div>

          <button type="submit" className="login-btn">Sign In</button>
        </form>

        <p className="signup-text">
          New here? <Link to="/signup">Create an Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;