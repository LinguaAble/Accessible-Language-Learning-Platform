import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // We will style this next

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors (Story 2)

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      // Story 4: Stay Signed In (Save the ID card)
      localStorage.setItem('token', res.data.token);
      
      // Story 9: Redirect to last activity (or Dashboard for now)
      navigate('/dashboard');
      
    } catch (err) {
      // Story 2: Helpful Error Messages
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Something went wrong. Please check your connection.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Story 1: Minimal Layout */}
        <h1>Welcome Back</h1>
        <p className="subtitle">Sign in to continue learning</p>

        {/* Story 2: Clear Error Display */}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required 
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required 
            />
          </div>

          <button type="submit" className="login-btn">Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default Login;