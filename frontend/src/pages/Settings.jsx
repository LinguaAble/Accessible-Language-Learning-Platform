import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Volume2, Moon, Sun, Save } from 'lucide-react';
import '../App.css'; // Reuse main styles or create Settings.css

const Settings = () => {
    const navigate = useNavigate();
    const [preferences, setPreferences] = useState({
        theme: 'dark', // default
        notifications: true,
        soundEffects: false,
        reduceMotion: false
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Load settings from localStorage or Backend
        // For POC, using localStorage primarily, syncing with logic in App.jsx
        const storedTheme = localStorage.getItem('theme') || 'dark';
        const storedNotif = localStorage.getItem('notifications') === 'true';
        setPreferences(prev => ({
            ...prev,
            theme: storedTheme,
            notifications: storedNotif
        }));
    }, []);

    const handleChange = (key, value) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
        setSaved(false);
    };

    const handleSave = () => {
        // Save to LocalStorage
        localStorage.setItem('theme', preferences.theme);
        localStorage.setItem('notifications', preferences.notifications);

        // Apply Theme Immediately
        document.body.setAttribute('data-theme', preferences.theme);

        // Ideally save to backend here using axios.put('/api/auth/preferences', ...) 

        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="logo-section">
                    <div className="logo-circle">L</div>
                    <h1 className="brand-name">Linguable</h1>
                </div>
                <button
                    className="nav-item"
                    onClick={() => navigate('/dashboard')}
                >
                    <ArrowLeft size={20} /> <span>Back to Dashboard</span>
                </button>
            </aside>

            <main className="main-content">
                <header className="content-header">
                    <h2>Settings</h2>
                    <p>Customize your learning experience.</p>
                </header>

                <div className="settings-container" style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--card-bg)', padding: '30px', borderRadius: '16px' }}>

                    {/* Appearance */}
                    <section className="setting-section" style={{ marginBottom: '30px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            {preferences.theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />} Appearance
                        </h3>
                        <div className="setting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <label>Theme Mode</label>
                            <div className="toggle-group" style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '4px' }}>
                                <button
                                    onClick={() => handleChange('theme', 'light')}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '16px',
                                        border: 'none',
                                        background: preferences.theme === 'light' ? 'white' : 'transparent',
                                        color: preferences.theme === 'light' ? 'black' : 'var(--text-secondary)',
                                        cursor: 'pointer'
                                    }}
                                >Light</button>
                                <button
                                    onClick={() => handleChange('theme', 'dark')}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '16px',
                                        border: 'none',
                                        background: preferences.theme === 'dark' ? '#333' : 'transparent',
                                        color: preferences.theme === 'dark' ? 'white' : 'var(--text-secondary)',
                                        cursor: 'pointer'
                                    }}
                                >Dark</button>
                            </div>
                        </div>
                    </section>

                    <hr style={{ borderColor: 'var(--border-color)', opacity: 0.3 }} />

                    {/* Notifications */}
                    <section className="setting-section" style={{ margin: '30px 0' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <Bell size={20} /> Notifications & Focus
                        </h3>
                        <div className="setting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <div>
                                <label style={{ display: 'block' }}>Allow Notifications</label>
                                <small style={{ color: 'var(--text-secondary)' }}>Get reminders for goals and streaks.</small>
                            </div>
                            <input
                                type="checkbox"
                                checked={preferences.notifications}
                                onChange={(e) => handleChange('notifications', e.target.checked)}
                                style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                            />
                        </div>

                        <div className="setting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <label style={{ display: 'block' }}>Reduce Motion</label>
                                <small style={{ color: 'var(--text-secondary)' }}>Minimize animations for better focus.</small>
                            </div>
                            <input
                                type="checkbox"
                                checked={preferences.reduceMotion}
                                onChange={(e) => handleChange('reduceMotion', e.target.checked)}
                                style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                            />
                        </div>
                    </section>

                    <hr style={{ borderColor: 'var(--border-color)', opacity: 0.3 }} />

                    {/* Sound */}
                    <section className="setting-section" style={{ margin: '30px 0' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <Volume2 size={20} /> Sound Effects
                        </h3>
                        <div className="setting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>Play sounds on correct/incorrect answers</label>
                            <input
                                type="checkbox"
                                checked={preferences.soundEffects}
                                onChange={(e) => handleChange('soundEffects', e.target.checked)}
                                style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                            />
                        </div>
                    </section>

                    <button
                        onClick={handleSave}
                        className="save-btn"
                        style={{
                            width: '100%',
                            padding: '15px',
                            background: saved ? '#2ecc71' : 'var(--brand-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        {saved ? <><Check size={20} /> Saved</> : <><Save size={20} /> Save Changes</>}
                    </button>

                </div>
            </main>

        </div>
    );
};


// Simple check icon for the save state
const Check = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);


export default Settings;
