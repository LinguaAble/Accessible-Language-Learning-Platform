import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, BookOpen, Trophy, Settings, LogOut, MessageSquare
} from 'lucide-react';

import zebraMascot from '../assets/zebra-mascot.png';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <aside className="sidebar">
            <div className="logo-section">
                <img src={zebraMascot} alt="LinguaAble Logo" className="logo-image" />
                <div className="branding-container">
                    <h1 className="brand-name">Lingua<span className="highlight-text">Able</span></h1>
                    <span className="slogan-text">Built Around Learners, Not Limitations!</span>
                </div>
            </div>

            <nav className="side-nav">
                <button
                    className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
                    onClick={() => handleNavigation('/dashboard')}
                >
                    <LayoutDashboard size={20} /> <span>Dashboard</span>
                </button>

                <button
                    className={`nav-item ${location.pathname === '/lessons' ? 'active' : ''}`}
                    onClick={() => handleNavigation('/lessons')}
                >
                    <BookOpen size={20} /> <span>Lessons</span>
                </button>

                <button
                    className={`nav-item ${location.pathname === '/practice' ? 'active' : ''}`}
                    onClick={() => handleNavigation('/practice')}
                >
                    <MessageSquare size={20} /> <span>Practice</span>
                </button>

                <button
                    className={`nav-item ${location.pathname === '/leaderboard' ? 'active' : ''}`}
                    onClick={() => handleNavigation('/leaderboard')}
                >
                    <Trophy size={20} /> <span>Leaderboard</span>
                </button>
            </nav>

            <div className="side-footer">
                <button
                    className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
                    onClick={() => handleNavigation('/settings')}
                >
                    <Settings size={20} /> <span>Settings</span>
                </button>

                <button className="nav-item logout" onClick={handleLogout}>
                    <LogOut size={20} /> <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
