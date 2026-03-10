import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../App.css';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { Eye, EyeOff } from 'lucide-react';
import { useUser } from '../context/UserContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useUser();

  // --- MFA State ---
  const [step, setStep] = useState(1); // 1 = credentials, 2 = OTP
  const [otp, setOtp] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${API}/api/auth/login`, {
        email,
        password,
        rememberMe
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
        setError('Unable to sign in. Please check your internet connection.');
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

      if (rememberMe) {
        localStorage.setItem('token', res.data.token);
      } else {
        sessionStorage.setItem('token', res.data.token);
      }

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

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log("Logged in with Google:", decoded);

      localStorage.setItem('token', credentialResponse.credential);

      const googleUser = {
        email: decoded.email,
        username: decoded.email.split('@')[0],
        fullName: decoded.name,
        avatarUrl: decoded.picture,
        device: 'Web Browser'
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
    console.log('Login Failed');
    setError("Google Sign In Failed");
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
        <p className="subtitle">
          Built Around Learners, Not Limitations!
        </p>

        {step === 2 && (
          <h2 className="page-title">Verify Your Identity</h2>
        )}

        {message && (
          <div className="error-message" style={{ borderColor: '#2ecc71', color: '#27ae60', backgroundColor: '#e8f6f3' }}>
            {message}
          </div>
        )}

        {error && <div className="error-message" role="alert">{error}</div>}

        {/* STEP 1: Credentials */}
        {step === 1 && (
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
                <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{ paddingRight: '40px' }}
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
                    display: 'flex',
                    alignItems: 'center',
                    zIndex: 10
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
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

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
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
                text="signin_with"
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
              {loading ? 'Verifying...' : 'Verify & Sign In'}
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
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}

        {step === 1 && (
          <p className="signup-text">
            New here? <Link to="/signup">Create an Account</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;