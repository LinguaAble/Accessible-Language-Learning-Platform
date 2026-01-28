import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Lessons from './pages/Lessons';
import Practice from './pages/Practice';
import Leaderboard from './pages/Leaderboard';
import Settings from './pages/Settings';
import Layout from './components/Layout';
// Import other pages as needed

import './App.css'; // Make sure this exists, even if empty

function App() {
  // 1. Initialize Theme (Default to 'dark' to fix the white flash)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const navigate = useNavigate();
  const location = useLocation();

  // 2. Apply Theme to Body
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 3. Auto-Login Logic
  useEffect(() => {
    const token = localStorage.getItem('token');
    // If we have a token and are on the login page, go to dashboard
    if (token && location.pathname === '/') {
      navigate('/dashboard');
    }
  }, [navigate, location.pathname]);

  return (
    <div className="app-container">
      {/* Routes */}
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Protected Routes wrapped in Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Add your other routes like /lessons here later */}
      </Routes>
    </div>
  );
}

export default App;