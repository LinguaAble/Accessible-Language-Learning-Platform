import { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../App.css';
import { Eye, EyeOff } from 'lucide-react'; 

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const { token } = useParams();
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      const res = await axios.put(`http://localhost:5000/api/auth/reset-password/${token}`, {
        password
      });

      setMessage("Password Updated! Redirecting to login...");
      
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired token");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-container">
          <img src={logo} alt="LinguaAble Zebra" className="app-logo" />
        </div>

        <h1 className="brand-title">LinguaAble</h1>
        <h2 className="page-title">Set New Password</h2>

        {message && (
          <div className="error-message" style={{ borderColor: '#2ecc71', color: '#27ae60', backgroundColor: '#e8f6f3' }}>
            {message}
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleReset}>
          <div className="input-group">
            <label>New Password</label>
            {/* Wrapper takes the margin instead of input */}
            <div style={{ position: 'relative', marginBottom: '15px' }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                autoFocus
                // Force margin 0 so 'center' is calculated correctly
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
            </div>
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            {/* Wrapper takes the margin instead of input */}
            <div style={{ position: 'relative', marginBottom: '15px' }}>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                // Force margin 0 so 'center' is calculated correctly
                style={{ paddingRight: '40px', marginBottom: 0 }}
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

          <button type="submit" className="login-btn">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;