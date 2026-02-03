<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
=======
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; 
>>>>>>> 6320a95 (added dashboard)
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Lessons from './pages/Lessons';
<<<<<<< HEA
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
=======
import LearnGamefied from './pages/LearnGamefied';  
import Practice from './pages/Practice';
import Settings from './pages/Settings';
import './App.css';

function App() {
  // Apply saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
  }, []);

  // Protected route wrapper component
  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token ? children : <Navigate to="/" replace />;
  };

  return (
    <div className="App">
>>>>>>> 6320a95 (added dashboard)
      <Routes>
        {/* Public Routes - No authentication required */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

<<<<<<< HEAD
        {/* Protected Routes wrapped in Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Add your other routes like /lessons here later */}
=======
        {/* Protected Routes - Require authentication */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/lessons" 
          element={
            <ProtectedRoute>
              <Lessons />
            </ProtectedRoute>
          } 
        />

        {/* 🆕 NEW ROUTE - Gamified Learning Page */}
        <Route 
          path="/learn" 
          element={
            <ProtectedRoute>
              <LearnGamefied />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/practice" 
          element={
            <ProtectedRoute>
              <Practice />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />

        {/* Catch all route - Redirect unknown paths to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
>>>>>>> 6320a95 (added dashboard)
      </Routes>
    </div>
  );
}

export default App;