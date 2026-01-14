import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../App.css'; 
import { Eye, EyeOff } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOtp = async (e) => {
    if(e) e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(`OTP sent to ${email}. Check your inbox!`);
      setStep(2);
      setTimer(60);
      setCanResend(false); 
    } catch (err) {
      setError(err.response?.data?.message || "User not found");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword.length < 6) {
      setLoading(false);
      return setError("Password is too short");
    }
    if (newPassword !== confirmPassword) {
      setLoading(false);
      return setError("Passwords do not match");
    }

    try {
      await axios.put(`http://localhost:5000/api/auth/reset-password/${otp}`, {
        password: newPassword
      });

      setMessage("Password Changed Successfully! Redirecting...");
      setTimeout(() => navigate('/'), 2000);

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

        <h2 className="page-title">
          {step === 1 ? "Forgot Password?" : "Enter the OTP"}
        </h2>

        {message && (
          <div className="error-message" style={{ borderColor: '#2ecc71', color: '#27ae60', backgroundColor: '#e8f6f3' }}>
            {message}
          </div>
        )}

        {error && <div className="error-message" role="alert">{error}</div>}

        {/* STEP 1 FORM */}
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
            
             <p className="signup-text">
                Remembered your password? <Link to="/">Sign In</Link>
             </p>
          </form>
        )}

        {/* STEP 2 FORM */}
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
              <div style={{ position: 'relative', marginBottom: '30px' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New secure password"
                  required
                  style={{ paddingRight: '40px', marginBottom: 0 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {newPassword.length > 0 && newPassword.length < 6 && (
                  <p style={{ position: 'absolute', bottom: '-25px', left: '0', color: '#e74c3c', fontSize: '0.8rem', fontWeight: '500', margin: 0 }}>
                    ⚠️ Password must be at least 6 characters
                  </p>
                )}
              </div>
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Type password again"
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0 }}
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Change Password'}
            </button>

            {/* --- FIXED: Spacing and Colors --- */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '15px', 
              marginTop: '20px' 
            }}>
              
              {/* 1. Resend OTP - Now Orange */}
              <button
                type="button"
                onClick={() => handleSendOtp()}
                disabled={!canResend || loading}
                style={{
                  background: 'none',
                  border: 'none',
                  // Changed from Blue (#2563eb) to Orange (#e67e22) to match theme
                  color: canResend ? '#e67e22' : '#9ca3af', 
                  cursor: canResend ? 'pointer' : 'not-allowed',
                  textDecoration: 'underline',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                {canResend ? "Resend OTP" : `Resend OTP in ${timer}s`}
              </button>
              
              {/* 2. Go Back & Sign In - Grouped neatly */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  style={{
                    background:'none', 
                    border:'none', 
                    color:'#7f8c8d', 
                    cursor:'pointer', 
                    fontSize: '0.9rem'
                  }}>
                  Wrong email? <span style={{textDecoration: 'underline'}}>Go back</span>
                </button>

                <p className="signup-text" style={{margin: 0, fontSize: '0.9rem'}}>
                  Remembered Your Password? <Link to="/" style={{color: '#e67e22', fontWeight: 'bold'}}>Sign In</Link>
                </p>
              </div>

            </div>
            {/* -------------------------------- */}
            
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;