import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../App.css'; 
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); 
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
        rememberMe 
      });

      // Story 4: Stay Signed In
      if (rememberMe) {
        localStorage.setItem('token', res.data.token);
      } else {
        sessionStorage.setItem('token', res.data.token); 
      }

      navigate('/dashboard');

    } catch (err) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Unable to sign in. Please check your internet connection.');
      }
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log("Logged in with Google:", decoded);

    // TODO: Connect this to backend later. 
    // For now, we simulate login by saving the Google token.
    localStorage.setItem('token', credentialResponse.credential);
    navigate('/dashboard');
  };

  const handleGoogleError = () => {
    console.log('Login Failed');
    setError("Google Sign In Failed");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Logo Section */}
        <div className="logo-container">
          <img src={logo} alt="LinguaAble Zebra Mascot" className="app-logo" />
        </div>

        <h2 className="welcome-text">Welcome to</h2>
        <h1 className="brand-title">
          <span className="text-brand-blue">Lingua</span>
          <span className="text-brand-red">Able</span>
        </h1>
        <p className="subtitle">
          Built Around Learners, Not Limitations!
        </p>

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
              autoFocus 
            />
          </div>

          <div className="input-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
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

          {/* --- NEW: Google Sign In Section --- */}
          <div style={{ margin: '20px 0', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
            OR
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_blue"
              shape="pill"
              text="signin_with"
              width="250" 
            />
          </div>
          {/* ----------------------------------- */}

        </form>

        <p className="signup-text">
          New here? <Link to="/signup">Create an Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;