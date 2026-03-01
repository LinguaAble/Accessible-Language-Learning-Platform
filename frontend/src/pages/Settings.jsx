import React, { useState, useRef } from 'react';
import { Flame, Bell, Moon, Sun, Volume2, VolumeX, Eye, Shield, Clock, Type, User, Calendar, Users, Target, BookOpen, Layers, AlarmClock, Coffee } from 'lucide-react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useNotifications } from '../context/NotificationContext';
import '../Dashboard.css';

const Settings = () => {
    const { user, preferences, todayProgress, updatePreferences, updateProfile } = useUser();
    const { notifPrefs, updateNotifPrefs } = useNotifications();

    // Local state for profile inputs
    const [profileData, setProfileData] = useState({
        username: user.username || '',
        fullName: user.fullName || '',
        age: user.age || '',
        gender: user.gender || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || ''
    });
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // null | 'success' | 'error'
    const fileInputRef = useRef(null);

    // Update local input when user context changes
    React.useEffect(() => {
        setProfileData({
            username: user.username || '',
            fullName: user.fullName || '',
            age: user.age || '',
            gender: user.gender || '',
            bio: user.bio || '',
            avatarUrl: user.avatarUrl || ''
        });
    }, [user]);

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

    const toggleDyslexiaFont = () => {
        updatePreferences({ dyslexiaFont: !preferences.dyslexiaFont });
    };

    const changeColorOverlay = (overlay) => {
        updatePreferences({ colorOverlay: overlay });
    };

    const changeFontSize = (size) => {
        updatePreferences({ fontSize: size });
    };

    const handleProfileChange = (field, value) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        setSaveStatus(null);
        try {
            await updateProfile(profileData);
            setSaveStatus('success');
            setTimeout(() => {
                setIsEditingProfile(false);
                setSaveStatus(null);
            }, 1500);
        } catch (error) {
            console.error("Failed to update profile", error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <User size={24} color="#e67e22" />
                            <h3>Profile Information</h3>
                        </div>
                        <button
                            className={`toggle-btn ${isEditingProfile ? 'active' : ''}`}
                            onClick={() => setIsEditingProfile(!isEditingProfile)}
                            style={{ padding: '8px 16px' }}
                        >
                            {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>

                    {!isEditingProfile ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '15px 0' }}>
                            <img
                                src={profileData.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || 'default'}`}
                                alt="Profile avatar"
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    border: '3px solid var(--accent-color)',
                                    objectFit: 'cover'
                                }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-main)' }}>
                                    {profileData.fullName || profileData.username || 'No name set'}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                    @{profileData.username || user.email?.split('@')[0]}
                                </div>
                                {profileData.bio && (
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
                                        "{profileData.bio}"
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '15px', marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {profileData.age && <span>📅 {profileData.age} years old</span>}
                                    {profileData.gender && <span>👤 {profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1)}</span>}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="settings-row" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '15px' }}>
                            {/* Avatar Selection */}
                            <div style={{ width: '100%' }}>
                                <div className="setting-info" style={{ marginBottom: '12px' }}>
                                    <span className="setting-label">Profile Avatar</span>
                                    <span className="setting-desc">Choose a preset avatar or upload your own image.</span>
                                </div>

                                {/* Current Avatar Preview */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                    <img
                                        src={profileData.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || 'default'}`}
                                        alt="Current avatar"
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '50%',
                                            border: '3px solid var(--accent-color)',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>Current Avatar</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {profileData.avatarUrl?.startsWith('data:') ? 'Custom Upload' : 'Preset Avatar'}
                                        </div>
                                    </div>
                                </div>

                                {/* Preset Avatars */}
                                <div style={{ marginBottom: '15px' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px', color: 'var(--text-main)' }}>
                                        Preset Avatars
                                    </div>

                                    {/* Male Avatars Row */}
                                    <div style={{ marginBottom: '15px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(3, ${preferences.fontSize === 'small' ? '80px' : preferences.fontSize === 'large' ? '120px' : '100px'})`, gap: '20px', justifyContent: 'start' }}>
                                            {[
                                                'https://api.dicebear.com/7.x/avataaars/svg?seed=John&backgroundColor=b6e3f4',
                                                'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert&backgroundColor=c0aede',
                                                'https://api.dicebear.com/7.x/avataaars/svg?seed=James&backgroundColor=d1d4f9'
                                            ].map((url, index) => (
                                                <div
                                                    key={`male-${index}`}
                                                    onClick={() => handleProfileChange('avatarUrl', url)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        border: profileData.avatarUrl === url
                                                            ? '3px solid var(--accent-color)'
                                                            : '2px solid var(--border-color)',
                                                        borderRadius: '50%',
                                                        padding: '3px',
                                                        transition: 'all 0.2s',
                                                        background: 'var(--card-bg)',
                                                        width: preferences.fontSize === 'small' ? '80px' : preferences.fontSize === 'large' ? '120px' : '100px',
                                                        height: preferences.fontSize === 'small' ? '80px' : preferences.fontSize === 'large' ? '120px' : '100px'
                                                    }}
                                                >
                                                    <img
                                                        src={url}
                                                        alt={`Male avatar ${index + 1}`}
                                                        style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Female Avatars Row */}
                                    <div>
                                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(3, ${preferences.fontSize === 'small' ? '80px' : preferences.fontSize === 'large' ? '120px' : '100px'})`, gap: '20px', justifyContent: 'start' }}>
                                            {[
                                                'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=ffd5dc',
                                                'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica&backgroundColor=ffdfbf',
                                                'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily&backgroundColor=e4c1f9'
                                            ].map((url, index) => (
                                                <div
                                                    key={`female-${index}`}
                                                    onClick={() => handleProfileChange('avatarUrl', url)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        border: profileData.avatarUrl === url
                                                            ? '3px solid var(--accent-color)'
                                                            : '2px solid var(--border-color)',
                                                        borderRadius: '50%',
                                                        padding: '3px',
                                                        transition: 'all 0.2s',
                                                        background: 'var(--card-bg)',
                                                        width: preferences.fontSize === 'small' ? '80px' : preferences.fontSize === 'large' ? '120px' : '100px',
                                                        height: preferences.fontSize === 'small' ? '80px' : preferences.fontSize === 'large' ? '120px' : '100px'
                                                    }}
                                                >
                                                    <img
                                                        src={url}
                                                        alt={`Female avatar ${index + 1}`}
                                                        style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Custom Upload */}
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px', color: 'var(--text-main)' }}>
                                        Upload from Device
                                    </div>
                                    {/* Hidden file input */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                if (file.size > 2 * 1024 * 1024) {
                                                    alert('File size must be less than 2MB');
                                                    return;
                                                }
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    handleProfileChange('avatarUrl', reader.result);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    {/* Styled upload button */}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '12px 20px',
                                            borderRadius: '10px',
                                            border: '2px dashed var(--border-color)',
                                            background: 'var(--bg-color)',
                                            color: 'var(--text-main)',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                            width: '100%',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-color)'; e.currentTarget.style.color = 'var(--accent-color)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                                    >
                                        📁 Choose Photo from Device
                                    </button>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                                        Max 2MB · JPG, PNG, GIF, WEBP
                                    </div>
                                    {/* Show selected file name if custom upload is active */}
                                    {profileData.avatarUrl?.startsWith('data:') && (
                                        <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#27ae60', fontWeight: 600 }}>
                                            ✓ Custom image selected
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Display Name */}
                            <div style={{ width: '100%' }}>
                                <div className="setting-info" style={{ marginBottom: '8px' }}>
                                    <span className="setting-label">Display Name</span>
                                    <span className="setting-desc">This name will be displayed on your dashboard.</span>
                                </div>
                                <input
                                    type="text"
                                    value={profileData.username}
                                    onChange={(e) => handleProfileChange('username', e.target.value)}
                                    placeholder="Enter your display name"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
                                />
                            </div>

                            {/* Full Name */}
                            <div style={{ width: '100%' }}>
                                <div className="setting-info" style={{ marginBottom: '8px' }}>
                                    <span className="setting-label">Full Name</span>
                                    <span className="setting-desc">Your complete name.</span>
                                </div>
                                <input
                                    type="text"
                                    value={profileData.fullName}
                                    onChange={(e) => handleProfileChange('fullName', e.target.value)}
                                    placeholder="Enter your full name"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
                                />
                            </div>

                            {/* Age and Gender Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', width: '100%' }}>
                                {/* Age */}
                                <div>
                                    <div className="setting-info" style={{ marginBottom: '8px' }}>
                                        <span className="setting-label">Age</span>
                                        <span className="setting-desc">Your age in years.</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={profileData.age}
                                        onChange={(e) => handleProfileChange('age', e.target.value)}
                                        placeholder="Age"
                                        min="1"
                                        max="120"
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                {/* Gender */}
                                <div>
                                    <div className="setting-info" style={{ marginBottom: '8px' }}>
                                        <span className="setting-label">Gender</span>
                                        <span className="setting-desc">Select your gender.</span>
                                    </div>
                                    <select
                                        value={profileData.gender}
                                        onChange={(e) => handleProfileChange('gender', e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
                                    >
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                        <option value="prefer-not-to-say">Prefer not to say</option>
                                    </select>
                                </div>
                            </div>

                            {/* Bio */}
                            <div style={{ width: '100%' }}>
                                <div className="setting-info" style={{ marginBottom: '8px' }}>
                                    <span className="setting-label">Bio</span>
                                    <span className="setting-desc">Tell us a bit about yourself (max 500 characters).</span>
                                </div>
                                <textarea
                                    value={profileData.bio}
                                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                                    placeholder="Write something about yourself..."
                                    maxLength="500"
                                    rows="4"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)', resize: 'vertical', fontFamily: 'inherit' }}
                                />
                                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    {profileData.bio.length}/500
                                </div>
                            </div>

                            {/* Save Button */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', alignSelf: 'flex-start' }}>
                                <button
                                    className="toggle-btn active"
                                    onClick={handleSaveProfile}
                                    disabled={isSavingProfile}
                                    style={{ padding: '12px 30px' }}
                                >
                                    {isSavingProfile ? 'Saving...' : 'Save Profile'}
                                </button>
                                {saveStatus === 'success' && (
                                    <span style={{ color: '#27ae60', fontWeight: 600, fontSize: '0.9rem' }}>✓ Profile saved!</span>
                                )}
                                {saveStatus === 'error' && (
                                    <span style={{ color: '#e74c3c', fontWeight: 600, fontSize: '0.9rem' }}>✗ Save failed. Please try again.</span>
                                )}
                            </div>
                        </div>
                    )}
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

                    {/* DYSLEXIA FONT */}
                    <div className="settings-row">
                        <div className="setting-info">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BookOpen size={18} />
                                <span className="setting-label">Dyslexia-Friendly Font</span>
                            </div>
                            <span className="setting-desc">Switches to OpenDyslexic font to reduce letter confusion.</span>
                            {preferences.dyslexiaFont && (
                                <span style={{
                                    marginTop: '6px',
                                    fontSize: '0.75rem',
                                    fontFamily: '"OpenDyslexic", sans-serif',
                                    color: 'var(--text-muted)',
                                    display: 'block'
                                }}>
                                    Preview: The quick brown fox jumps over the lazy dog.
                                </span>
                            )}
                        </div>
                        <button
                            className={`toggle-btn ${preferences.dyslexiaFont ? 'active' : ''}`}
                            onClick={toggleDyslexiaFont}
                            style={{ minWidth: '64px' }}
                        >
                            {preferences.dyslexiaFont ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    {/* COLOR OVERLAY */}
                    <div className="settings-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
                        <div className="setting-info" style={{ minWidth: '200px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Layers size={18} />
                                <span className="setting-label">Reading Color Overlay</span>
                            </div>
                            <span className="setting-desc">Adds a tinted overlay to reduce visual stress.</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {[
                                { value: 'none', label: '✕ None', color: 'var(--border-color)', textColor: 'var(--text-main)' },
                                { value: 'yellow', label: '🟡 Yellow', color: '#fbbf24', textColor: '#1a1a1a' },
                                { value: 'blue', label: '🔵 Blue', color: '#60a5fa', textColor: '#fff' },
                                { value: 'green', label: '🟢 Green', color: '#34d399', textColor: '#1a1a1a' },
                                { value: 'rose', label: '🌸 Rose', color: '#f472b6', textColor: '#fff' },
                            ].map(({ value, label, color, textColor }) => (
                                <button
                                    key={value}
                                    onClick={() => changeColorOverlay(value)}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        border: preferences.colorOverlay === value
                                            ? '2px solid var(--accent-color)'
                                            : '2px solid var(--border-color)',
                                        background: preferences.colorOverlay === value ? color : 'var(--card-bg)',
                                        color: preferences.colorOverlay === value ? textColor : 'var(--text-main)',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        transition: 'all 0.2s',
                                        boxShadow: preferences.colorOverlay === value ? `0 2px 8px ${color}66` : 'none'
                                    }}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- LEARNING GOALS --- */}
                <div className="stat-card" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <Target size={24} color="#e67e22" />
                        <h3>Learning Goals</h3>
                    </div>

                    <div className="settings-row" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ width: '100%' }}>
                            <div className="setting-info" style={{ marginBottom: '8px' }}>
                                <span className="setting-label">Daily Goal (Minutes)</span>
                                <span className="setting-desc">Set how many minutes you want to learn each day.</span>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                {[3, 5, 10, 15].map((minutes) => (
                                    <button
                                        key={minutes}
                                        className={`toggle-btn ${preferences.dailyGoalMinutes === minutes ? 'active' : ''}`}
                                        onClick={() => updatePreferences({ dailyGoalMinutes: minutes })}
                                        style={{
                                            flex: 1,
                                            padding: '12px 20px',
                                            fontSize: '1rem',
                                            fontWeight: 600
                                        }}
                                    >
                                        {minutes} min
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- NOTIFICATION SETTINGS (US1–US10) --- */}
                <div className="stat-card" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <Bell size={24} color="#e67e22" />
                        <div>
                            <h3 style={{ margin: 0 }}>Notification Preferences</h3>
                            <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                Control when and how you get reminders.
                            </p>
                        </div>
                    </div>

                    {/* US1 – Inactivity reminders */}
                    <div className="settings-row">
                        <div className="setting-info">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlarmClock size={18} />
                                <span className="setting-label">Inactivity Reminders</span>
                            </div>
                            <span className="setting-desc">Gentle nudge when you haven't opened a lesson for a while.</span>
                            {notifPrefs.inactivityReminders && (
                                <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {[15, 30, 60].map(min => (
                                        <button key={min}
                                            className={`toggle-btn ${notifPrefs.inactivityMinutes === min ? 'active' : ''}`}
                                            onClick={() => updateNotifPrefs({ inactivityMinutes: min })}
                                            style={{ padding: '4px 12px', fontSize: '0.82rem' }}
                                        >After {min}m</button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button className={`toggle-btn ${notifPrefs.inactivityReminders ? 'active' : ''}`}
                            onClick={() => updateNotifPrefs({ inactivityReminders: !notifPrefs.inactivityReminders })}
                            style={{ minWidth: '64px' }}>
                            {notifPrefs.inactivityReminders ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    {/* US4 – Break reminders */}
                    <div className="settings-row">
                        <div className="setting-info">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Coffee size={18} />
                                <span className="setting-label">Break Reminders</span>
                            </div>
                            <span className="setting-desc">Remind me to rest during long study sessions.</span>
                            {notifPrefs.breakReminders && (
                                <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {[15, 20, 30].map(min => (
                                        <button key={min}
                                            className={`toggle-btn ${notifPrefs.breakIntervalMinutes === min ? 'active' : ''}`}
                                            onClick={() => updateNotifPrefs({ breakIntervalMinutes: min })}
                                            style={{ padding: '4px 12px', fontSize: '0.82rem' }}
                                        >Every {min}m</button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button className={`toggle-btn ${notifPrefs.breakReminders ? 'active' : ''}`}
                            onClick={() => updateNotifPrefs({ breakReminders: !notifPrefs.breakReminders })}
                            style={{ minWidth: '64px' }}>
                            {notifPrefs.breakReminders ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    {/* US3 – Goal reminders */}
                    <div className="settings-row">
                        <div className="setting-info">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Target size={18} />
                                <span className="setting-label">Daily Goal Reminders</span>
                            </div>
                            <span className="setting-desc">Show me how close I am to my daily learning goal.</span>
                        </div>
                        <button className={`toggle-btn ${notifPrefs.goalReminders ? 'active' : ''}`}
                            onClick={() => updateNotifPrefs({ goalReminders: !notifPrefs.goalReminders })}
                            style={{ minWidth: '64px' }}>
                            {notifPrefs.goalReminders ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    {/* US5 – Milestone / encouragement */}
                    <div className="settings-row">
                        <div className="setting-info">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Bell size={18} />
                                <span className="setting-label">Achievement Alerts</span>
                            </div>
                            <span className="setting-desc">Celebrate when I finish a lesson or hit a milestone.</span>
                        </div>
                        <button className={`toggle-btn ${notifPrefs.milestoneAlerts ? 'active' : ''}`}
                            onClick={() => updateNotifPrefs({ milestoneAlerts: !notifPrefs.milestoneAlerts })}
                            style={{ minWidth: '64px' }}>
                            {notifPrefs.milestoneAlerts ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    {/* US6 – Quiet hours */}
                    <div className="settings-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
                        <div className="setting-info" style={{ minWidth: '220px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Moon size={18} />
                                <span className="setting-label">Quiet Hours</span>
                            </div>
                            <span className="setting-desc">No notifications will appear during these hours. (US6)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>From</label>
                                <select value={notifPrefs.quietHoursStart}
                                    onChange={e => updateNotifPrefs({ quietHoursStart: parseInt(e.target.value) })}
                                    style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)', fontSize: '0.85rem' }}>
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <option key={i} value={i}>{i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>To</label>
                                <select value={notifPrefs.quietHoursEnd}
                                    onChange={e => updateNotifPrefs({ quietHoursEnd: parseInt(e.target.value) })}
                                    style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)', fontSize: '0.85rem' }}>
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <option key={i} value={i}>{i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}</option>
                                    ))}
                                </select>
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                {(() => {
                                    const h = new Date().getHours();
                                    const { quietHoursStart: s, quietHoursEnd: e } = notifPrefs;
                                    const inQH = s > e ? (h >= s || h < e) : (h >= s && h < e);
                                    return inQH ? '🌙 Quiet hours active' : '🔔 Notifications allowed';
                                })()}
                            </span>
                        </div>
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
                        {(!user.loginHistory || user.loginHistory.length === 0) && (
                            <div style={{ padding: '20px', textAlign: 'center', opacity: 0.7 }}>
                                <p style={{ marginBottom: '8px', fontSize: '0.95rem' }}>No login history available yet.</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Login history is recorded each time you sign in. Try logging out and logging back in to see your history here.
                                </p>
                            </div>
                        )}
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




/*

1. Profile Viewing & Editing

What it does

Shows user name, age, gender, bio, avatar

Allows editing when Edit Profile is clicked

Frontend (React – key idea)
const [isEditingProfile, setIsEditingProfile] = useState(false);
const [profileData, setProfileData] = useState({...});

{!isEditingProfile ? (
  <ProfileView data={profileData} />
) : (
  <ProfileEditForm data={profileData} />
)}

Backend (Express)
router.put('/update-profile', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  user.username = req.body.username;
  user.bio = req.body.bio;
  await user.save();
  res.json({ message: 'Profile updated' });
});


Toggle UI → update state → send data → MongoDB updated






2. Avatar Selection (Preset + Upload)

What it does

Choose preset avatar (DiceBear)

Upload custom image (Base64)

Frontend
onClick={() => handleProfileChange('avatarUrl', url)}

const reader = new FileReader();
reader.onloadend = () => setProfileData({ avatarUrl: reader.result });

Backend
if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;



Avatar URL/Base64 stored directly in user document








3. Display & Accessibility Settings

What it does

Font size

Dark mode

Sound effects

Reduce motion

Frontend
updatePreferences({ theme: 'dark' });
updatePreferences({ fontSize: 'large' });

Backend
router.put('/update-settings', async (req, res) => {
  user.preferences = { ...user.preferences, ...req.body.preferences };
  await user.save();
});


UI button → preferences object → merged & saved







4. Learning Goals (Daily Minutes)

What it does

User sets daily learning goal (3 / 5 / 10 / 15 min)

Frontend
<button onClick={() =>
  updatePreferences({ dailyGoalMinutes: 10 })
}>
  10 min
</button>

Backend
user.preferences.dailyGoalMinutes = preferences.dailyGoalMinutes;



Simple number saved → used for progress tracking







5. Login History (Security Feature)

What it does

Stores last 10 logins with time + device

Displays them in Settings

Backend (LOGIN)
user.loginHistory.push({
  timestamp: new Date(),
  device: 'Web Browser'
});
if (user.loginHistory.length > 10) user.loginHistory.shift();
await user.save();

Frontend
user.loginHistory.map(entry => (
  <span>{new Date(entry.timestamp).toLocaleString()}</span>
))

*/