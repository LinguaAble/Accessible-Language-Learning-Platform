import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Lessons from './pages/Lessons';
import Practice from './pages/Practice';
import Leaderboard from './pages/Leaderboard';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import LearningScreen from './pages/LearningScreen'; // <--- 1. Import Added

import './App.css';

function App() {
  // 1. Initialize Theme (Default to 'dark' to fix the white flash)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const navigate = useNavigate();
  const location = useLocation();

  // 2. Apply Theme & Motion to Body
  useEffect(() => {
    // Theme
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Motion & Sound (Load from user object)
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (savedUser.preferences?.animationReduced) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
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
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* --- 2. Learning Screen Added Here --- */}
        {/* We keep it OUTSIDE the <Layout> so it is full-screen (no sidebar) */}
        <Route path="/learn" element={<LearningScreen />} />

        {/* Protected Routes wrapped in Layout (Has Sidebar) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

      </Routes>
    </div>
  );
}

export default App;