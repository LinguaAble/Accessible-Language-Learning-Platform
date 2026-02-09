import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
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
import LearningScreen from './pages/LearningScreen';
import { UserProvider, useUser } from './context/UserContext';
import './App.css';
import { playClickSound, playNavigationSound } from './utils/soundUtils';

function AppContent() {
  const { preferences } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // 3. Auto-Login Logic
  useEffect(() => {
    const token = localStorage.getItem('token');
    // If we have a token and are on the landing/login page, go to dashboard
    if (token && (location.pathname === '/' || location.pathname === '/login')) {
      navigate('/dashboard');
    }
  }, [navigate, location.pathname]);

  // 4. Global Sound Effects (Navigation & Clicks)
  useEffect(() => {
    if (preferences.soundEffects) {
      playNavigationSound();
    }
  }, [location.pathname, preferences.soundEffects]);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      // Determine if the clicked element is interactive
      const target = e.target;
      const interactiveTag = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName);
      const isRole = target.getAttribute('role') === 'button' || target.getAttribute('role') === 'link';
      const isClass = target.className && typeof target.className === 'string' && (target.className.includes('btn') || target.className.includes('button'));
      const closestInteractive = target.closest('button, a, [role="button"], [role="link"]');

      if (interactiveTag || isRole || isClass || closestInteractive) {
        if (preferences.soundEffects) {
          playClickSound();
        }
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [preferences.soundEffects]);

  return (
    <div className="app-container">
      {/* Routes */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
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

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;