import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import './App.css';

function App() {
  const [theme, setTheme] = useState('dark');
  const navigate = useNavigate(); // <--- Now we can use this!
  const location = useLocation();

  // --- LOGIC: Auto-Login on App Load ---
  useEffect(() => {
    // 1. Check if a token exists in either storage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    // 2. If token exists AND user is trying to access the Login page ('/'), send them to Dashboard
    if (token && location.pathname === '/') {
      navigate('/dashboard');
    }
  }, [navigate, location.pathname]);
  // -------------------------------------

  const toggleTheme = () => {
    setTheme((curr) => (curr === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="app-wrapper">
      <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Dark/Light Mode">
        {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </button>

      {/* Note: No <Router> here anymore, it is in main.jsx */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </div>
  );
}

export default App;