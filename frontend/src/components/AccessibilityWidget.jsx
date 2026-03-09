import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Type, BookOpen, Layers, X, Sun, Moon } from 'lucide-react';
import './AccessibilityWidget.css';

const AccessibilityWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { preferences, updatePreferences } = useUser();
    const widgetRef = useRef(null);
    const location = useLocation();

    // Close menu when clicking outside
    // NOTE: This useEffect MUST stay before any early returns to comply
    // with React's Rules of Hooks (hooks cannot be called conditionally).
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (widgetRef.current && !widgetRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Hide while taking lessons — MUST be AFTER all hooks
    if (location.pathname === '/learn') {
        return null;
    }

    const changeFontSize = (size) => updatePreferences({ fontSize: size });
    const toggleDyslexiaFont = () => updatePreferences({ dyslexiaFont: !preferences.dyslexiaFont });
    const changeColorOverlay = (overlay) => updatePreferences({ colorOverlay: overlay });
    const changeTheme = (themeStr) => updatePreferences({ theme: themeStr });

    return (
        <div className={`accessibility-widget ${isOpen ? 'open' : ''}`} ref={widgetRef}>
            {isOpen && (
                <div className="accessibility-menu">
                    <div className="accessibility-header">
                        <h3>Accessibility Tools</h3>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="accessibility-content">
                        {/* Font Size */}
                        <div className="accessibility-section">
                            <div className="section-title">
                                <Type size={16} /> Font Size
                            </div>
                            <div className="button-group">
                                <button
                                    className={`tool-btn ${preferences.fontSize === 'small' ? 'active' : ''}`}
                                    onClick={() => changeFontSize('small')}
                                >A</button>
                                <button
                                    className={`tool-btn ${preferences.fontSize === 'medium' ? 'active' : ''}`}
                                    onClick={() => changeFontSize('medium')}
                                >A</button>
                                <button
                                    className={`tool-btn ${preferences.fontSize === 'large' ? 'active' : ''}`}
                                    onClick={() => changeFontSize('large')}
                                >A</button>
                            </div>
                        </div>

                        {/* Theme Options */}
                        <div className="accessibility-section">
                            <div className="section-title">
                                {preferences.theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />} Theme Design
                            </div>
                            <div className="button-group">
                                <button
                                    className={`tool-btn ${preferences.theme !== 'dark' ? 'active' : ''}`}
                                    onClick={() => changeTheme('light')}
                                >
                                    <Sun size={14} style={{ marginBottom: '-2px', marginRight: '6px' }} /> Light
                                </button>
                                <button
                                    className={`tool-btn ${preferences.theme === 'dark' ? 'active' : ''}`}
                                    onClick={() => changeTheme('dark')}
                                >
                                    <Moon size={14} style={{ marginBottom: '-2px', marginRight: '6px' }} /> Dark
                                </button>
                            </div>
                        </div>

                        {/* Dyslexia Font */}
                        <div className="accessibility-section">
                            <div className="section-title">
                                <BookOpen size={16} /> Dyslexia Friendly Font
                            </div>
                            <div className="button-group">
                                <button
                                    className={`tool-btn ${preferences.dyslexiaFont ? 'active' : ''}`}
                                    onClick={toggleDyslexiaFont}
                                >{preferences.dyslexiaFont ? 'ON' : 'OFF'}</button>
                            </div>
                        </div>

                        {/* Color Overlay */}
                        <div className="accessibility-section">
                            <div className="section-title">
                                <Layers size={16} /> Reading Color Overlay
                            </div>
                            <div className="color-options">
                                {[
                                    { value: 'none', label: '✕', title: 'None' },
                                    { value: 'yellow', label: '🟡', title: 'Yellow' },
                                    { value: 'blue', label: '🔵', title: 'Blue' },
                                    { value: 'green', label: '🟢', title: 'Green' },
                                    { value: 'rose', label: '🌸', title: 'Rose' },
                                ].map(({ value, label, title }) => (
                                    <button
                                        key={value}
                                        className={`color-btn ${preferences.colorOverlay === value ? 'active' : ''}`}
                                        onClick={() => changeColorOverlay(value)}
                                        title={title}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <button
                className="accessibility-fab"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Accessibility Options"
                title="Accessibility Tools"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                    <path d="M20.5 6c-2.61.7-5.67 1-8.5 1s-5.89-.3-8.5-1L3 8c1.86.5 4 .83 6 1v13h2v-6h2v6h2V9c2-.17 4.14-.5 6-1l-.5-2zM12 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                </svg>
            </button>
        </div>
    );
};

export default AccessibilityWidget;
