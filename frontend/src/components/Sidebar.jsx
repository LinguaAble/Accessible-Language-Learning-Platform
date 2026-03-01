import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, BookOpen, Trophy, Settings, LogOut, ChevronLeft, ChevronRight, BarChart3
} from 'lucide-react';

import zebraMascot from '../assets/zebra-mascot.png';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // Default to collapsed (minimized)
    const [isCollapsed, setIsCollapsed] = useState(true);

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.clear(); // Clear all local storage (token, user, completedLessons)
        sessionStorage.clear(); // Clear session storage (in case token is there)
        navigate('/');
    };

    return (
        <aside
            className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
            onMouseEnter={() => setIsCollapsed(false)}
            onMouseLeave={() => setIsCollapsed(true)}
        >
            <div className="logo-section" style={{ position: 'relative' }}>
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
                    title="Dashboard"
                >
                    <LayoutDashboard size={20} /> <span>Dashboard</span>
                </button>

                <button
                    className={`nav-item ${location.pathname === '/lessons' ? 'active' : ''}`}
                    onClick={() => handleNavigation('/lessons')}
                    title="Lessons"
                >
                    <BookOpen size={20} /> <span>Lessons</span>
                </button>


                <button
                    className={`nav-item ${location.pathname === '/leaderboard' ? 'active' : ''}`}
                    onClick={() => handleNavigation('/leaderboard')}
                    title="Leaderboard"
                >
                    <Trophy size={20} /> <span>Leaderboard</span>
                </button>

                <button
                    className={`nav-item ${location.pathname === '/progress' ? 'active' : ''}`}
                    onClick={() => handleNavigation('/progress')}
                    title="Progress"
                >
                    <BarChart3 size={20} /> <span>Progress</span>
                </button>
            </nav>

            <div className="side-footer">
                <button
                    className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
                    onClick={() => handleNavigation('/settings')}
                    title="Settings"
                >
                    <Settings size={20} /> <span>Settings</span>
                </button>

                <button className="nav-item logout" onClick={handleLogout} title="Logout">
                    <LogOut size={20} /> <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
