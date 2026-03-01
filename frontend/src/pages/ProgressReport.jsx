import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Flame, Bell, Star, Calendar, BarChart3, TrendingUp, ChevronRight, Lock, CheckCircle, CircleDashed } from 'lucide-react';
import '../Dashboard.css'; // Re-use Dashboard styling for consistency
import './ProgressReport.css'; // Progress-Specific calm additions

const ProgressReport = () => {
    const { user, streak } = useUser();
    const navigate = useNavigate();

    const [showProfileTooltip, setShowProfileTooltip] = useState(false);
    const [showNotificationTooltip, setShowNotificationTooltip] = useState(false);
    const [weeklyData, setWeeklyData] = useState([]);

    const name = user?.username || (user?.email ? user.email.split('@')[0].replace(/^./, c => c.toUpperCase()) : 'Learner');

    // Format Helper
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const startOfWeek = (d) => { const x = new Date(d), day = x.getDay(); x.setDate(x.getDate() - day + (day === 0 ? -6 : 1)); return x; };

    // Generate Weekly Data for Bar Chart
    useEffect(() => {
        const todayStr = fmt(new Date());
        const sow = startOfWeek(new Date());
        const ds = user?.dailyScores || [];

        setWeeklyData(['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
            const d = new Date(sow); d.setDate(sow.getDate() + i);
            const str = fmt(d);
            return { day, value: ds.find(e => e.date === str)?.score || 0, isToday: str === todayStr };
        }));
    }, [user]);

    // Aggregate performance data across sessions
    const performanceData = useMemo(() => {
        const dailyScores = user.dailyScores || [];
        const totalScore = dailyScores.reduce((acc, curr) => acc + (curr.score || 0), 0);

        const completedLessons = user.completedLessons || [];
        let storedLessons = [];
        try {
            storedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
        } catch (e) { }

        const allCompletedKeys = new Set([...completedLessons, ...storedLessons]);
        const totalLessons = allCompletedKeys.size;
        const completedArray = Array.from(allCompletedKeys).sort((a, b) => a - b);
        const maxLessonCompleted = completedArray.length > 0 ? completedArray[completedArray.length - 1] : 0;
        const currentLesson = maxLessonCompleted + 1;

        const dailyLessonCounts = user.dailyLessonCounts || [];
        const loginHistory = user.loginHistory || [];

        const activeDaysSet = new Set();

        // Add days where user logged in
        loginHistory.forEach(log => {
            if (log.timestamp) {
                const dateObj = new Date(log.timestamp);
                const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
                activeDaysSet.add(dateStr);
            }
        });

        // Add days where user scored or did lessons
        dailyScores.forEach(s => s.score > 0 && activeDaysSet.add(s.date));
        dailyLessonCounts.forEach(c => c.count > 0 && activeDaysSet.add(c.date));

        const activeSessions = activeDaysSet.size;

        return {
            totalScore,
            totalLessons,
            activeSessions,
            maxLessonCompleted,
            currentLesson
        };
    }, [user]);

    const { totalScore, totalLessons, activeSessions, maxLessonCompleted, currentLesson } = performanceData;
    const maxVal = Math.max(...weeklyData.map(d => d.value), 1);

    // Since the backend doesn't explicitly store skill breakdown, deduce it smoothly using activeSessions, lessons, & streaks
    const baseProgress = activeSessions * 10;
    const skills = [
        { label: "Vocabulary", percentage: Math.min(100, Math.max(10, baseProgress + (totalLessons * 4))), color: "#e67e22" },
        { label: "Grammar", percentage: Math.min(100, Math.max(5, baseProgress + (totalLessons * 3))), color: "#3498db" },
        { label: "Pronunciation", percentage: Math.min(100, Math.max(5, baseProgress + (totalLessons * 2))), color: "#9b59b6" },
        { label: "Consistency", percentage: Math.min(100, Math.max(5, (streak * 15) + (activeSessions * 5))), color: "#2ecc71" }
    ];

    // Calm language based on progress
    let encouragementMessage = "Every step you take is a beautiful beginning. You're doing wonderful.";
    if (totalLessons > 0) {
        encouragementMessage = "You're making steady and amazing progress. Learning is a journey, not a race. Take it at your own gentle pace.";
    }
    if (streak > 2) {
        encouragementMessage = `Wow, ${streak} days in a row! You're building a wonderful habit. Take pride in your dedication, and don't forget to rest when needed.`;
    }

    return (
        <div className="main-content db-root">

            {/* Header aligned w/ Dashboard UI */}
            <header className="db-header">
                <div>
                    <div className="db-namaste">Learning Insights,</div>
                    <h1 className="db-name">Your Progress 🌱</h1>
                    <p className="db-subtitle">A calm reflection of your growing knowledge.</p>
                </div>
                <div className="db-header-right">
                    <div className="db-streak">
                        <Flame size={15} fill="currentColor" />
                        {streak} Day{streak !== 1 ? 's' : ''} Streak
                    </div>
                    <div className="notification-container" onMouseEnter={() => setShowNotificationTooltip(true)} onMouseLeave={() => setShowNotificationTooltip(false)}>
                        <button className="db-icon-btn" aria-label="Notifications" onClick={() => navigate('/settings')}><Bell size={18} /></button>
                        {showNotificationTooltip && <div className="notification-tooltip"><div className="notification-tooltip-content"><Bell size={20} style={{ color: 'var(--text-muted)', opacity: 0.5 }} /><p>No notifications</p></div></div>}
                    </div>
                    <div className="profile-avatar-container" onMouseEnter={() => setShowProfileTooltip(true)} onMouseLeave={() => setShowProfileTooltip(false)}>
                        <div className="profile-avatar" onClick={() => navigate('/settings')} style={{ cursor: 'pointer' }}>
                            <img src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        </div>
                        {showProfileTooltip && <div className="profile-tooltip">
                            <div className="tooltip-header">
                                <img src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt="avatar" className="tooltip-avatar" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%' }} />
                                <div className="tooltip-user-info"><h4>{name}</h4><p>{user?.email || 'No email'}</p></div>
                            </div>
                            <div className="tooltip-divider" />
                            <button className="tooltip-settings-btn" onClick={() => navigate('/settings')}>View Profile Settings</button>
                        </div>}
                    </div>
                </div>
            </header>

            {/* Stats Quick Cards */}
            <div className="report-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '20px' }}>
                <div className="db-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ background: 'rgba(159, 172, 230, 0.1)', color: '#9face6', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}><Star size={28} /></div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.2rem', color: 'var(--text-main)' }}>{totalScore}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>Total Gained Points</div>
                </div>
                <div className="db-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ background: 'rgba(116, 235, 213, 0.1)', color: '#74ebd5', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}><BookOpen size={28} /></div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.2rem', color: 'var(--text-main)' }}>{totalLessons}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>Lessons Explored</div>
                </div>
                <div className="db-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ background: 'rgba(255, 183, 178, 0.1)', color: '#ffb7b2', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}><Calendar size={28} /></div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.2rem', color: 'var(--text-main)' }}>{activeSessions}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>Active Learning Days</div>
                </div>
                <div className="db-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ background: 'rgba(255, 210, 127, 0.1)', color: '#ffd27f', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}><Flame size={28} /></div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.2rem', color: 'var(--text-main)' }}>{streak}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>Current Streak</div>
                </div>
            </div>

            <div className="dashboard-grid" style={{ marginTop: '20px' }}>
                {/* Weekly Chart */}
                <div className="db-card" style={{ flex: 1 }}>
                    <div className="db-card-row" style={{ marginBottom: '16px' }}>
                        <h3 className="db-card-title">Weekly Activity & Study Session</h3>
                        <BarChart3 size={16} color="var(--text-muted)" />
                    </div>
                    <div className="weekly-chart">
                        {weeklyData.map((item, i) => (
                            <div key={i} className="bar-wrapper">
                                <div className={`bar${item.isToday ? ' bar-today' : ''}`}
                                    style={{ height: `${Math.min(85, (item.value / Math.max(maxVal, 5)) * 85)}%`, opacity: item.value === 0 ? 0.3 : 1 }}
                                    title={`Score: ${item.value}`}>
                                    {item.value > 0 && <span className="bar-score-label" style={{ fontSize: '10px' }}>{item.value}</span>}
                                </div>
                                <span className="day-label" style={{
                                    fontWeight: item.isToday ? 800 : 600,
                                    color: item.isToday ? 'var(--accent-color)' : 'var(--text-muted)'
                                }}>{item.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skill Chart */}
                <div className="db-card" style={{ flex: 1 }}>
                    <div className="db-card-row" style={{ marginBottom: '16px' }}>
                        <h3 className="db-card-title">Skill Strengths (Simple View)</h3>
                        <TrendingUp size={16} color="var(--text-muted)" />
                    </div>
                    <div className="skills-container">
                        {skills.map((skill, i) => (
                            <div key={i} className="skill-row" style={{ marginBottom: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '5px', fontWeight: '600' }}>
                                    <span>{skill.label}</span>
                                    <span style={{ color: "var(--text-muted)" }}>{Math.round(skill.percentage)}%</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${skill.percentage}%`, height: '100%', background: skill.color, borderRadius: '4px', transition: 'width 1s ease-in-out' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Lesson Path Progression (Done, Current, Locked) */}
            <div className="db-card" style={{ marginTop: '30px' }}>
                <div className="db-card-row" style={{ marginBottom: '16px' }}>
                    <h3 className="db-card-title">Learning Path Status</h3>
                    <BookOpen size={16} color="var(--text-muted)" />
                </div>
                <div className="path-container" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>

                    {/* Previous Lesson (Done) */}
                    {maxLessonCompleted > 0 && (
                        <div className="path-node done" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#2ecc71', opacity: 0.8 }}>
                            <CheckCircle size={32} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '8px' }}>Lesson {maxLessonCompleted}</span>
                            <span style={{ fontSize: '0.7rem' }}>Done</span>
                        </div>
                    )}

                    {maxLessonCompleted > 0 && <ChevronRight size={24} color="var(--border-color)" />}

                    {/* Current Lesson */}
                    <div className="path-node current" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--accent-color)', transform: 'scale(1.15)', cursor: 'pointer' }} onClick={() => navigate('/lessons')} title="Continue Learning">
                        <CircleDashed size={40} className="pulse-icon" />
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, marginTop: '10px' }}>Lesson {currentLesson}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Current (Up Next)</span>
                    </div>

                    <ChevronRight size={24} color="var(--border-color)" />

                    {/* Next Lesson (Locked) */}
                    <div className="path-node locked" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)', opacity: 0.5 }}>
                        <Lock size={32} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '8px' }}>Lesson {currentLesson + 1}</span>
                        <span style={{ fontSize: '0.7rem' }}>Locked</span>
                    </div>

                </div>
            </div>

            {/* Calm Encouragement */}
            <div className="encouragement-section" style={{ marginTop: '30px', textAlign: 'center', padding: '40px 20px', background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                <p className="encouragement-text" style={{ fontSize: '1.2rem', fontWeight: 500, lineHeight: 1.6, maxWidth: '600px', margin: '0 auto', color: 'var(--text-main)' }}>
                    {encouragementMessage}
                </p>
            </div>

        </div>
    );
};

export default ProgressReport;
