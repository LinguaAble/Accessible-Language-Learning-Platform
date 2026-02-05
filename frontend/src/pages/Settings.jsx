

import React, { useState, useEffect } from 'react';
import { Flame, Bell, Moon, Sun, Volume2, VolumeX, Eye, EyeOff, Shield, Clock } from 'lucide-react';
import axios from 'axios';
import '../Dashboard.css';

const Settings = () => {
    const [preferences, setPreferences] = useState({
        theme: 'minimalist',
        soundEffects: false,
        animationReduced: true
    });
    const [loginHistory, setLoginHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Fetch Settings & History
    useEffect(() => {
        if (user.email) {
            axios.post('http://localhost:5000/api/auth/get-user-data', { email: user.email })
                .then(res => {
                    const fetchedPrefs = res.data.preferences;
                    setPreferences(fetchedPrefs);
                    setLoginHistory(res.data.loginHistory);
                    setLoading(false);

                    // Sync to localStorage
                    const updatedUser = { ...user, preferences: fetchedPrefs };
                    localStorage.setItem('user', JSON.stringify(updatedUser)); // Update full user object
                    localStorage.setItem('theme', fetchedPrefs.theme === 'dark' ? 'dark' : 'light'); // Keep simple key for App.jsx

                    // Apply initial theme
                    const initialTheme = fetchedPrefs.theme === 'dark' ? 'dark' : 'light';
                    document.body.setAttribute('data-theme', initialTheme);

                    // Apply initial motion
                    if (fetchedPrefs.animationReduced) {
                        document.body.classList.add('reduce-motion');
                    } else {
                        document.body.classList.remove('reduce-motion');
                    }
                })
                .catch(err => console.error(err));
        } else {
            setLoading(false);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = preferences.theme === 'dark' ? 'minimalist' : 'dark';
        updatePreference('theme', newTheme);

        const themeAttr = newTheme === 'dark' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', themeAttr);
    };

    const toggleSound = () => {
        updatePreference('soundEffects', !preferences.soundEffects);
    };

    const toggleAnimation = () => {
        const newValue = !preferences.animationReduced;
        updatePreference('animationReduced', newValue);

        if (newValue) {
            document.body.classList.add('reduce-motion');
        } else {
            document.body.classList.remove('reduce-motion');
        }
    };

    const updatePreference = (key, value) => {
        const newPrefs = { ...preferences, [key]: value };
        setPreferences(newPrefs);

        // Update localStorage strictly
        const updatedUser = { ...user, preferences: newPrefs };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        if (user.email) {
            axios.put('http://localhost:5000/api/auth/update-settings', {
                email: user.email,
                preferences: newPrefs
            }).catch(err => console.error("Failed to save settings", err));
        }
    };

    return (
        <div>
            <header className="content-header">
                <div className="greeting">
                    <h2>Settings</h2>
                    <p>Manage your experience and security.</p>
                </div>
            </header>

            <div className="dashboard-grid">
                {/* --- DISPLAY SETTINGS --- */}
                <div className="stat-card" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <Eye size={24} color="#3498db" />
                        <h3>Display & Accessibility</h3>
                    </div>

                    <div className="settings-row">
                        <div className="setting-info">
                            <span className="setting-label">Dark Mode</span>
                            <span className="setting-desc">Switch between light and dark themes.</span>
                        </div>
                        <button className={`toggle-btn ${preferences.theme === 'dark' ? 'active' : ''}`} onClick={toggleTheme}>
                            {preferences.theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                        </button>
                    </div>

                    <div className="settings-row">
                        <div className="setting-info">
                            <span className="setting-label">Sound Effects</span>
                            <span className="setting-desc">Play sounds for correct/incorrect answers.</span>
                        </div>
                        <button className={`toggle-btn ${preferences.soundEffects ? 'active' : ''}`} onClick={toggleSound}>
                            {preferences.soundEffects ? <Volume2 size={16} /> : <VolumeX size={16} />}
                        </button>
                    </div>

                    <div className="settings-row">
                        <div className="setting-info">
                            <span className="setting-label">Reduce Motion</span>
                            <span className="setting-desc">Minimize animations for better focus.</span>
                        </div>
                        <button className={`toggle-btn ${preferences.animationReduced ? 'active' : ''}`} onClick={toggleAnimation}>
                            {preferences.animationReduced ? 'ON' : 'OFF'}
                        </button>
                    </div>
                </div>

                {/* --- LOGIN HISTORY --- */}
                <div className="stat-card" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <Shield size={24} color="#2ecc71" />
                        <h3>Login History (Recent 10)</h3>
                    </div>

                    <div className="history-list">
                        {loginHistory.slice().reverse().map((entry, idx) => (
                            <div key={idx} className="history-item">
                                <Clock size={16} color="#95a5a6" />
                                <span className="history-time">{new Date(entry.timestamp).toLocaleString()}</span>
                                <span className="history-device">{entry.device}</span>
                            </div>
                        ))}
                        {loginHistory.length === 0 && <p style={{ opacity: 0.6 }}>No history available.</p>}
                    </div>
                </div>
            </div>

            <style>{`
                .settings-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 0;
                    border-bottom: 1px solid var(--border-color);
                }
                .setting-info {
                    display: flex;
                    flex-direction: column;
                }
                .setting-label {
                    font-weight: 600;
                    font-size: 16px;
                    color: var(--text-main);
                }
                .setting-desc {
                    font-size: 13px;
                    opacity: 0.7;
                    color: var(--text-muted);
                }
                .toggle-btn {
                    padding: 8px 16px;
                    border-radius: 20px;
                    border: 2px solid var(--border-color);
                    background: var(--card-bg);
                    color: var(--text-main);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    transition: all 0.3s ease;
                }
                .toggle-btn.active {
                    background: #2ecc71;
                    border-color: #27ae60;
                    color: white;
                }
                .history-item {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 10px;
                    background: var(--bg-color);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    margin-bottom: 8px;
                    color: var(--text-main);
                }
                .history-time {
                    font-weight: 500;
                    flex: 1;
                }
                .history-device {
                    font-size: 0.85rem;
                    opacity: 0.7;
                    background: var(--card-bg);
                    padding: 2px 8px;
                    border-radius: 4px;
                    border: 1px solid var(--border-color);
                }
            `}</style>
        </div>
    );
};

export default Settings;
