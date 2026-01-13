import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'; // Using your existing logo
import '../App.css'; // Importing your existing styles

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call for now (We will connect backend later)
    setTimeout(() => {
      setMessage(`Reset link sent to ${email}`);
      setLoading(false);
      console.log("Reset requested for:", email);
    }, 1500);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Logo Section - Matching Login.jsx */}
        <div className="logo-container">
          <img src={logo} alt="LinguaAble Zebra Mascot" className="app-logo" />
        </div>

        {/* Branding - Matching Login.jsx */}
        <h1 className="brand-title">
          <span className="text-brand-blue">Lingua</span>
          <span className="text-brand-red">Able</span>
        </h1>
        
        <h2 className="page-title">Reset Password</h2>
        <p className="subtitle">
          Enter your email and we'll send you a link to get back into your account.
        </p>

        {/* Success Message Area */}
        {message && (
          <div className="error-message" style={{ borderColor: '#2ecc71', color: '#27ae60', backgroundColor: '#e8f6f3' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="signup-text">
          Remembered your password? <Link to="/">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;