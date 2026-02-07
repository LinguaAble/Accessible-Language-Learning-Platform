
import React, { useState } from 'react';
import { Flame, Bell, Moon, Sun, Volume2, VolumeX, Eye, Shield, Clock, Type, User } from 'lucide-react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import '../Dashboard.css';

const Settings = () => {
    const { user, preferences, updatePreferences, updateProfile } = useUser();

    // Local state for username input to allow typing before saving
    const [usernameInput, setUsernameInput] = useState(user.username || '');
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Update local input when user context changes (e.g. initial load)
    React.useEffect(() => {
        if (user.username) {
            setUsernameInput(user.username);
        }
    }, [user.username]);

    const toggleTheme = () => {
        const newTheme = preferences.theme === 'dark' ? 'minimalist' : 'dark';
        updatePreferences({ theme: newTheme });
    };

    const toggleSound = () => {
        updatePreferences({ soundEffects: !preferences.soundEffects });
    };

    const toggleAnimation = () => {
        updatePreferences({ animationReduced: !preferences.animationReduced });
    };

    const changeFontSize = (size) => {
        updatePreferences({ fontSize: size });
    };

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        try {
            await updateProfile({ username: usernameInput });
            // Optional: Show success toast
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setIsSavingProfile(false);
        }
    };

    return (
        <div>
            <header className="content-header">
                <div className="greeting">
                    <h2>Settings</h2>
                    <p>Manage your experience, profile, and preferences.</p>
                </div>
            </header>

            <div className="dashboard-grid">

                {/* --- PROFILE SETTINGS --- */}
                <div className="stat-card" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <User size={24} color="#e67e22" />
                        <h3>Profile</h3>
                    </div>

                    <div className="settings-row" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '15px' }}>
                        <div className="setting-info" style={{ width: '100%' }}>
                            <span className="setting-label">Display Name</span>
                            <span className="setting-desc">This name will be displayed on your dashboard.</span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                            <input
                                type="text"
                                value={usernameInput}
                                onChange={(e) => setUsernameInput(e.target.value)}
                                placeholder="Enter your display name"
                                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
                            />
                            <button
                                className="toggle-btn active"
                                onClick={handleSaveProfile}
                                disabled={isSavingProfile}
                                style={{ padding: '10px 20px' }}
                            >
                                {isSavingProfile ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- DISPLAY SETTINGS --- */}
                <div className="stat-card" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <Eye size={24} color="#3498db" />
                        <h3>Display & Accessibility</h3>
                    </div>

                    {/* FONT SIZE */}
                    <div className="settings-row">
                        <div className="setting-info">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Type size={18} />
                                <span className="setting-label">Font Size</span>
                            </div>
                            <span className="setting-desc">Adjust the text size for better readability.</span>
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                                className={`toggle-btn ${preferences.fontSize === 'small' ? 'active' : ''}`}
                                onClick={() => changeFontSize('small')}
                                style={{ fontSize: '0.8rem', padding: '5px 10px' }}
                            >
                                A
                            </button>
                            <button
                                className={`toggle-btn ${preferences.fontSize === 'medium' ? 'active' : ''}`}
                                onClick={() => changeFontSize('medium')}
                                style={{ fontSize: '1rem', padding: '5px 12px' }}
                            >
                                A
                            </button>
                            <button
                                className={`toggle-btn ${preferences.fontSize === 'large' ? 'active' : ''}`}
                                onClick={() => changeFontSize('large')}
                                style={{ fontSize: '1.2rem', padding: '5px 14px' }}
                            >
                                A
                            </button>
                        </div>
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
                        {(user.loginHistory || []).slice().reverse().map((entry, idx) => (
                            <div key={idx} className="history-item">
                                <Clock size={16} color="#95a5a6" />
                                <span className="history-time">{new Date(entry.timestamp).toLocaleString()}</span>
                                <span className="history-device">{entry.device}</span>
                            </div>
                        ))}
                        {(!user.loginHistory || user.loginHistory.length === 0) && <p style={{ opacity: 0.6 }}>No history available.</p>}
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
                    font-size: 1rem;
                    color: var(--text-main);
                }
                .setting-desc {
                    font-size: 0.8125rem;
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
