import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';
import logo from '../assets/logo.png';
import { Eye, EyeOff } from 'lucide-react';

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

  const navigate = useNavigate();

  const { email, password, confirmPassword } = formData;

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
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        email,
        password
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (res.data.user.completedLessons) {
        localStorage.setItem('completedLessons', JSON.stringify(res.data.user.completedLessons));
      }
      navigate('/dashboard');

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

  return (
    <div className="login-container">
      <div className="login-box">
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
              autoFocus
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>

            {/* Wrapper: Increased marginBottom to 30px for more space */}
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

              {/* --- FIX: Absolute Positioned Warning --- */}
              {/* Adjusted bottom to -25px to fit nicely in the larger gap */}
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
              {/* -------------------------------------- */}
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
        </form>

        <p className="signup-text">
          Already have an account? <Link to="/">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;