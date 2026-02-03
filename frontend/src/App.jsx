import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; 
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Lessons from './pages/Lessons';
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
      <Routes>
        {/* Public Routes - No authentication required */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

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
       6320a95 (added dashboard)
      </Routes>
    </div>
  );
}

export default App;