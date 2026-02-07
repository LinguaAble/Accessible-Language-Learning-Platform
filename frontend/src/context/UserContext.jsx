import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [preferences, setPreferences] = useState({
        theme: 'dark',
        soundEffects: false,
        animationReduced: false,
        fontSize: 'medium', // 'small', 'medium', 'large'
        dailyGoalMinutes: 20 // Default daily goal in minutes
    });

    // Track today's progress (minutes completed)
    const [todayProgress, setTodayProgress] = useState(() => {
        const saved = localStorage.getItem('todayProgress');
        const savedDate = localStorage.getItem('progressDate');
        const today = new Date().toDateString();

        // Reset if it's a new day or no date is saved
        if (!savedDate || savedDate !== today) {
            localStorage.setItem('progressDate', today);
            localStorage.setItem('todayProgress', '0');
            return 0;
        }

        return 0; // Always start at 0
    });

    // Ensure progress resets daily
    useEffect(() => {
        const checkAndResetProgress = () => {
            const savedDate = localStorage.getItem('progressDate');
            const today = new Date().toDateString();

            if (!savedDate || savedDate !== today) {
                localStorage.setItem('progressDate', today);
                localStorage.setItem('todayProgress', '0');
                setTodayProgress(0);
            }
        };

        checkAndResetProgress();
    }, []);

    // Initialize state from user object or defaults
    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');

        // 1. Load from LocalStorage (Instant)
        if (savedUser.preferences) {
            setPreferences(prev => ({ ...prev, ...savedUser.preferences }));
        }
        setUser(savedUser);

        // 2. Background Sync: Fetch latest data from DB (Fixes cross-device sync)
        if (savedUser.email) {
            axios.post('http://localhost:5000/api/auth/get-user-data', { email: savedUser.email })
                .then(res => {
                    const freshData = res.data.user || res.data; // Handle both structures just in case

                    if (freshData) {
                        // Merge fresh data with existing (preserving token if it was in user obj, though usually token is separate)
                        const updatedUser = { ...savedUser, ...freshData };

                        // Update State
                        setUser(updatedUser);
                        if (freshData.preferences) {
                            setPreferences(prev => ({ ...prev, ...freshData.preferences }));
                        }

                        // Update LocalStorage
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        // console.log("User data synced from server:", freshData);
                    }
                })
                .catch(err => console.error("Failed to sync user data", err));
        }
    }, []);

    // Apply global side effects (theme, font size, motion)
    useEffect(() => {
        // Theme
        document.body.setAttribute('data-theme', preferences.theme === 'dark' ? 'dark' : 'light');

        // Font Size
        document.documentElement.setAttribute('data-font-size', preferences.fontSize);

        // Motion
        if (preferences.animationReduced) {
            document.body.classList.add('reduce-motion');
        } else {
            document.body.classList.remove('reduce-motion');
        }

        // Persist to localStorage (simplified)
        localStorage.setItem('theme', preferences.theme === 'dark' ? 'dark' : 'light');

    }, [preferences]);

    const updatePreferences = (newPrefs) => {
        const updatedPrefs = { ...preferences, ...newPrefs };
        setPreferences(updatedPrefs);

        const updatedUser = { ...user, preferences: updatedPrefs };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        if (user.email) {
            axios.put('http://localhost:5000/api/auth/update-settings', {
                email: user.email,
                preferences: updatedPrefs
            }).catch(err => console.error("Failed to save settings", err));
        }
    };

    const updateProfile = (profileData) => {
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Make API call to update user profile if backend supports it
        if (user.email) {
            axios.put('http://localhost:5000/api/auth/update-profile', {
                email: user.email,
                ...profileData
            }).catch(err => {
                console.error("Failed to save profile", err);
            });
        }
    };

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        if (userData.preferences) {
            setPreferences(userData.preferences);
            // Ensure theme is applied immediately
            document.body.setAttribute('data-theme', userData.preferences.theme === 'dark' ? 'dark' : 'light');
        }
    };

    const updateProgress = (minutesToAdd) => {
        const newProgress = todayProgress + minutesToAdd;
        setTodayProgress(newProgress);
        localStorage.setItem('todayProgress', newProgress.toString());

        // Optionally sync with backend
        if (user.email) {
            axios.put('http://localhost:5000/api/auth/update-progress', {
                email: user.email,
                todayProgress: newProgress
            }).catch(err => console.error("Failed to sync progress", err));
        }
    };

    const logout = () => {
        setUser({});
        setPreferences({
            theme: 'dark',
            soundEffects: false,
            animationReduced: false,
            fontSize: 'medium'
        });
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('completedLessons');
    };

    return (
        <UserContext.Provider value={{ user, preferences, todayProgress, updatePreferences, updateProfile, updateProgress, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};
