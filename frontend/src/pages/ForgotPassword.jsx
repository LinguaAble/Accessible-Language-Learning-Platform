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
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New secure password"
                required
              />
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Type password again"
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Change Password'}
            </button>
            
            <div style={{textAlign: 'center', marginTop: '15px'}}>
               <button 
                 type="button" 
                 onClick={() => setStep(1)} 
                 style={{background:'none', border:'none', color:'#7f8c8d', cursor:'pointer', textDecoration:'underline'}}>
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