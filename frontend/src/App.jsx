import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup'; // <--- IMPORT THIS
import Dashboard from './pages/Dashboard';
import './App.css';

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  // Theme State: Default to 'dark' as per user interest, or check local storage
  const [theme, setTheme] = useState('dark');

  // Toggle Function
  const toggleTheme = () => {
    setTheme((curr) => (curr === 'light' ? 'dark' : 'light'));
  };

  // Apply Theme to Body/HTML
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <Router>
      <div className="app-wrapper">
        {/* Floating Theme Toggle Button */}
        <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Dark/Light Mode">
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;