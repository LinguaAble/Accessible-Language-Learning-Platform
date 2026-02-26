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
        fontSize: 'medium',
        dailyGoalMinutes: 5
    });

    // Track today's progress (minutes completed)
    const [todayProgress, setTodayProgress] = useState(() => {
        const saved = localStorage.getItem('todayProgress');
        const savedDate = localStorage.getItem('progressDate');
        const today = new Date().toDateString();
        if (!savedDate || savedDate !== today) {
            localStorage.setItem('progressDate', today);
            localStorage.setItem('todayProgress', '0');
            return 0;
        }
        return parseInt(saved) || 0;
    });

    // Track streak
    const [streak, setStreak] = useState(() => parseInt(localStorage.getItem('streak') || '0'));

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

        if (savedUser.preferences) {
            setPreferences(prev => ({ ...prev, ...savedUser.preferences }));
        }
        setUser(savedUser);

        // Background Sync: Fetch latest data from DB
        if (savedUser.email) {
            axios.post('http://localhost:5000/api/auth/get-user-data', { email: savedUser.email })
                .then(res => {
                    const freshData = res.data.user || res.data;

                    if (freshData) {
                        // Preserve local avatarUrl if server didn't return one
                        if (!freshData.avatarUrl && savedUser.avatarUrl) {
                            freshData.avatarUrl = savedUser.avatarUrl;
                        }
                        const updatedUser = { ...savedUser, ...freshData };
                        setUser(updatedUser);

                        // Sync todayProgress if date matches
                        const today = new Date().toDateString();
                        if (freshData.progressDate === today && freshData.todayProgress !== undefined) {
                            setTodayProgress(freshData.todayProgress);
                            localStorage.setItem('todayProgress', freshData.todayProgress.toString());
                            localStorage.setItem('progressDate', today);
                        }

                        // Sync streak
                        if (freshData.streak !== undefined) {
                            setStreak(freshData.streak);
                            localStorage.setItem('streak', freshData.streak.toString());
                        }

                        if (freshData.preferences) {
                            setPreferences(prev => ({ ...prev, ...freshData.preferences }));
                        }
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                    }
                })
                .catch(err => console.error("Failed to sync user data", err));
        }
    }, []);

    // Apply global side effects (theme, font size, motion)
    useEffect(() => {
        document.body.setAttribute('data-theme', preferences.theme === 'dark' ? 'dark' : 'light');
        document.documentElement.setAttribute('data-font-size', preferences.fontSize);

        if (preferences.animationReduced) {
            document.body.classList.add('reduce-motion');
        } else {
            document.body.classList.remove('reduce-motion');
        }

        localStorage.setItem('theme', preferences.theme === 'dark' ? 'dark' : 'light');
    }, [preferences]);

    const updatePreferences = (newPrefs) => {
        const updatedPrefs = { ...preferences, ...newPrefs };
        setPreferences(updatedPrefs);

        const updatedUser = { ...user, preferences: updatedPrefs };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        if (user.email) {
            axios.put('http://localhost:5000/api/auth/update-profile', {
                email: user.email,
                preferences: updatedPrefs
            }).catch(err => console.error("Failed to sync preferences", err));
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await axios.put('http://localhost:5000/api/auth/update-profile', {
                email: user.email,
                ...profileData
            });

            const updatedUser = { ...user, ...response.data.user };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            return response.data;
        } catch (error) {
            console.error('Profile update failed:', error);
            throw error;
        }
    };

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        if (userData.preferences) {
            setPreferences(userData.preferences);
            document.body.setAttribute('data-theme', userData.preferences.theme === 'dark' ? 'dark' : 'light');
        }

        // Sync streak
        if (userData.streak !== undefined) {
            setStreak(userData.streak);
            localStorage.setItem('streak', userData.streak.toString());
        }

        // Load progress from backend
        const today = new Date().toDateString();
        if (userData.progressDate === today && userData.todayProgress !== undefined) {
            setTodayProgress(userData.todayProgress);
            localStorage.setItem('todayProgress', userData.todayProgress.toString());
            localStorage.setItem('progressDate', today);
        } else {
            setTodayProgress(0);
            localStorage.setItem('todayProgress', '0');
            localStorage.setItem('progressDate', today);
        }
    };

    const updateProgress = (minutesToAdd) => {
        const newProgress = todayProgress + minutesToAdd;
        setTodayProgress(newProgress);
        localStorage.setItem('todayProgress', newProgress.toString());

        if (user.email) {
            axios.put('http://localhost:5000/api/auth/update-progress', {
                email: user.email,
                todayProgress: newProgress
            }).then(res => {
                // Sync streak back from backend
                if (res.data.streak !== undefined) {
                    setStreak(res.data.streak);
                    localStorage.setItem('streak', res.data.streak.toString());
                }
            }).catch(err => console.error("Failed to sync progress", err));
        }
    };

    const logout = () => {
        setUser({});
        setPreferences({
            theme: 'dark',
            soundEffects: false,
            animationReduced: false,
            fontSize: 'medium',
            dailyGoalMinutes: 5
        });
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('completedLessons');
    };

    return (
        <UserContext.Provider value={{ user, preferences, todayProgress, streak, updatePreferences, updateProfile, updateProgress, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};
