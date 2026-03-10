import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';
import logo from '../assets/logo.png';
import { Eye, EyeOff } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- MFA State ---
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [message, setMessage] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate();
  const { login } = useUser();

  const { email, password, confirmPassword } = formData;

  // OTP countdown timer
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

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      localStorage.setItem('token', credentialResponse.credential);

      const googleUser = {
        email: decoded.email,
        username: decoded.email.split('@')[0],
        fullName: decoded.name,
        avatarUrl: decoded.picture
      };

      setLoading(true);
      const res = await axios.post(`${API}/api/auth/google-login`, googleUser);

      localStorage.setItem('token', res.data.token);
      login(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError("Failed to register Google account with our database.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign Up failed. Please try again.');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      return setError('Password is too short');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API}/api/auth/register`, {
        email,
        password
      });

      if (res.data.pendingMFA) {
        setMfaEmail(res.data.email);
        setStep(2);
        setTimer(60);
        setCanResend(false);
        setMessage(`Verification code sent to ${res.data.email}`);
      }
    } catch (err) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${API}/api/auth/verify-mfa`, {
        email: mfaEmail,
        otp
      });

      localStorage.setItem('token', res.data.token);
      login(res.data.user);

      if (res.data.user.completedLessons) {
        localStorage.setItem('completedLessons', JSON.stringify(res.data.user.completedLessons));
      }

      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await axios.post(`${API}/api/auth/resend-mfa`, { email: mfaEmail });
      setMessage('New verification code sent!');
      setTimer(60);
      setCanResend(false);
      setOtp('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-container">
          <img src={logo} alt="LinguaAble Zebra Mascot" className="app-logo" />
        </div>

        <h2 className="welcome-text">Welcome to</h2>
        <h1 className="brand-title">
          <span className="text-brand-blue">Lingua</span>
          <span className="text-brand-red">Able</span>
        </h1>
        <p className="subtitle">Built Around Learners, Not Limitations!</p>
        
        {step === 1 && <h2 className="page-title">Create Account</h2>}
        {step === 2 && <h2 className="page-title">Verify Your Email</h2>}

        {message && (
          <div className="error-message" style={{ borderColor: '#2ecc71', color: '#27ae60', backgroundColor: '#e8f6f3' }}>
            {message}
          </div>
        )}

        {error && <div className="error-message" role="alert">{error}</div>}

        {/* STEP 1: Registration Form */}
        {step === 1 && (
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
                autoFocus
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>

              <div style={{ position: 'relative', marginBottom: '30px' }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  style={{ paddingRight: '40px', marginBottom: 0 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>

                {password.length > 0 && password.length < 6 && (
                  <p style={{
                    position: 'absolute',
                    bottom: '-25px',
                    left: '0',
                    color: '#e74c3c',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    margin: 0
                  }}>
                    ⚠️ Password must be at least 6 characters
                  </p>
                )}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>

              <div style={{ position: 'relative' }}>
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>

            <div style={{ margin: '20px 0', textAlign: 'center', color: '#6b7280', fontSize: '0.9rem' }}>
              OR
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_blue"
                shape="pill"
                text="signup_with"
                width="250"
              />
            </div>
          </form>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className="input-group">
              <label>Enter 6-Digit Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                required
                autoFocus
                maxLength="6"
                style={{ letterSpacing: '2px', fontWeight: 'bold', textAlign: 'center', fontSize: '1.2rem' }}
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Complete'}
            </button>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px',
              marginTop: '20px'
            }}>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={!canResend || loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: canResend ? '#e67e22' : '#9ca3af',
                  cursor: canResend ? 'pointer' : 'not-allowed',
                  textDecoration: 'underline',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                {canResend ? "Resend Code" : `Resend Code in ${timer}s`}
              </button>

              <button
                type="button"
                onClick={() => { setStep(1); setOtp(''); setError(''); setMessage(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#7f8c8d',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}>
                ← Back to Email Setup
              </button>
            </div>
          </form>
        )}

        {step === 1 && (
          <p className="signup-text">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Signup;