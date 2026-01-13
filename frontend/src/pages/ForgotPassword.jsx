import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../App.css';

const ForgotPassword = () => {
  // Steps: 1 = Enter Email, 2 = Enter OTP & New Password
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // STEP 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(`OTP sent to ${email}. Check your inbox!`);
      setStep(2); // Move to next step
    } catch (err) {
      setError(err.response?.data?.message || "User not found");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP and Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setLoading(false);
      return setError("Passwords do not match");
    }

    try {
      // We send the OTP as the 'token' in the URL
      await axios.put(`http://localhost:5000/api/auth/reset-password/${otp}`, {
        password: newPassword
      });

      setMessage("Password Changed Successfully! Redirecting...");

      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP or Expired");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-container">
          <img src={logo} alt="LinguaAble Zebra" className="app-logo" />
        </div>

        <h1 className="brand-title">
          <span className="text-brand-blue">Lingua</span>
          <span className="text-brand-red">Able</span>
        </h1>

        {/* Dynamic Title based on Step */}
        <h2 className="page-title">
          {step === 1 ? "Forgot Password?" : "Enter OTP Code"}
        </h2>

        {message && (
          <div className="error-message" style={{ borderColor: '#2ecc71', color: '#27ae60', backgroundColor: '#e8f6f3' }}>
            {message}
          </div>
        )}

        {error && <div className="error-message" role="alert">{error}</div>}

        {/* FORM STEP 1: ASK FOR EMAIL */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
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
              {loading ? 'Sending...' : 'Send OTP Code'}
            </button>
          </form>
        )}

        {/* FORM STEP 2: ASK FOR OTP + NEW PASSWORD */}
        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <div className="input-group">
              <label>Enter 6-Digit OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                required
                autoFocus
                maxLength="6"
                style={{ letterSpacing: '2px', fontWeight: 'bold' }}
              />
            </div>

            <div className="input-group">
              <label>New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New secure password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Type password again"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Change Password'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: '#7f8c8d', cursor: 'pointer', textDecoration: 'underline' }}>
                Wrong email? Go back
              </button>
            </div>
          </form>
        )}

        <p className="signup-text">
          Remembered your password? <Link to="/">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;