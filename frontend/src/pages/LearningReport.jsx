import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import {
    BarChart3,
    TrendingUp,
    Award,
    BookOpen,
    Flame,
    Calendar,
    Star,
    Zap,
    BrainCircuit,
    Languages,
    Clock,
    Target,
    ArrowLeft,
    ChevronRight,
    Sparkles,
    Trophy,
    Lock,
    CheckCircle2,
    CalendarDays,
    Gem,
    Medal,
    Activity
} from 'lucide-react';
import './LearningReport.css';

const LearningReport = () => {
    const { user, streak } = useUser();
    const navigate = useNavigate();

    // UI State: 'weekly' or 'overall'
    const [reportType, setReportType] = useState('weekly');
    const [weeklyData, setWeeklyData] = useState([]);

    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const startOfWeek = (d) => { const x = new Date(d), day = x.getDay(); x.setDate(x.getDate() - day + (day === 0 ? -6 : 1)); return x; };

    // Calculate Weekly Metrics
    useEffect(() => {
        const todayStr = fmt(new Date());
        const sow = startOfWeek(new Date());
        const ds = user?.dailyScores || [];

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
            const d = new Date(sow); d.setDate(sow.getDate() + i);
            const str = fmt(d);
            return { day, value: ds.find(e => e.date === str)?.score || 0, isToday: str === todayStr };
        });
        setWeeklyData(days);
    }, [user]);

    // Aggregate Analytics
    const analytics = useMemo(() => {
        const dailyScores = user?.dailyScores || [];
        const dailyLessonCounts = user?.dailyLessonCounts || [];
        const loginHistory = user?.loginHistory || [];
        const completedLessons = user?.completedLessons || [];

        // Overall
        const totalScore = dailyScores.reduce((acc, curr) => acc + (curr.score || 0), 0);
        const totalLessons = completedLessons.length;

        // This Week
        const sow = startOfWeek(new Date());
        const sowStr = fmt(sow);
        const thisWeekScores = dailyScores.filter(s => s.date >= sowStr);
        const weeklyPoints = thisWeekScores.reduce((acc, curr) => acc + curr.score, 0);

        const thisWeekLessons = dailyLessonCounts.filter(l => l.date >= sowStr);
        const weeklyLessonCount = thisWeekLessons.reduce((acc, curr) => acc + curr.count, 0);

        // Active Days
        const activeDaysSet = new Set();
        loginHistory.forEach(log => activeDaysSet.add(fmt(new Date(log.timestamp))));
        dailyScores.forEach(s => s.score > 0 && activeDaysSet.add(s.date));

        return {
            totalScore,
            totalLessons,
            weeklyPoints,
            weeklyLessonCount,
            activeSessions: activeDaysSet.size,
            streak: user?.streak || 0
        };
    }, [user]);

    const { totalScore, totalLessons, weeklyPoints, weeklyLessonCount, activeSessions } = analytics;
    const maxWeeklyVal = Math.max(...weeklyData.map(d => d.value), 20);

    // Skill Deduction (Mocked but consistent with data)
    const skillProgress = [
        { label: "Vocabulary", val: Math.min(100, (totalLessons * 5) + (activeSessions * 2)), color: "#38bdf8" },
        { label: "Grammar", val: Math.min(100, (totalLessons * 4) + (activeSessions * 1.5)), color: "#818cf8" },
        { label: "Pronunciation", val: Math.min(100, (totalLessons * 3) + (activeSessions * 1)), color: "#a855f7" },
        { label: "Consistency", val: Math.min(100, (streak * 10) + (activeSessions * 3)), color: "#34d399" }
    ];

    // Achievement List
    const milestones = [
        { id: 1, title: "Seed Sower", desc: "Complete 1st Lesson", icon: <Gem size={18} color="#fbbf24" />, unlocked: totalLessons >= 1 },
        { id: 2, title: "Quick Learner", desc: "Gain 100 Points Overall", icon: <Medal size={18} color="#38bdf8" />, unlocked: totalScore >= 100 },
        { id: 3, title: "Unstoppable", desc: "Maintain 7 Day Streak", icon: <Flame size={18} color="#ef4444" />, unlocked: streak >= 7 },
        { id: 4, title: "Linguist", desc: "Complete 10 Lessons", icon: <Trophy size={18} color="#a855f7" />, unlocked: totalLessons >= 10 }
    ];

    return (
        <div className="lr-root">
            {/* Header Navigation */}
            <div className="lr-header-nav">
                <button className="lr-back-btn" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>
                <div style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
                    LAST SYNCED: JUST NOW
                </div>
            </div>

            {/* Main Title */}
            <div className="lr-main-title">
                <h1>Performance Report</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '8px' }}>Tracking your journey to language mastery.</p>
            </div>

            {/* View Toggle */}
            <div className="lr-report-toggle">
                <button
                    className={`lr-toggle-btn ${reportType === 'weekly' ? 'active' : ''}`}
                    onClick={() => setReportType('weekly')}
                >
                    Weekly Snapshot
                </button>
                <button
                    className={`lr-toggle-btn ${reportType === 'overall' ? 'active' : ''}`}
                    onClick={() => setReportType('overall')}
                >
                    Overall Mastery
                </button>
            </div>

            {/* --- Section 1: Weekly Snapshot --- */}
            {reportType === 'weekly' && (
                <div className="lr-section">
                    <div className="lr-weekly-grid">
                        <div className="lr-chart-card">
                            <div className="lr-chart-header">
                                <h3 className="lr-chart-title"><Activity size={24} color="#38bdf8" /> Weekly Activity Velocity</h3>
                                <div className="lr-chart-summary">
                                    <div className="lr-summary-item">
                                        <span className="lr-summary-val">{weeklyPoints}</span>
                                        <span className="lr-summary-lbl">Points this week</span>
                                    </div>
                                    <div className="lr-summary-item">
                                        <span className="lr-summary-val" style={{ color: '#34d399' }}>{weeklyLessonCount}</span>
                                        <span className="lr-summary-lbl">Lessons done</span>
                                    </div>
                                </div>
                            </div>

                            <div className="lr-bar-container">
                                {weeklyData.map((d, i) => (
                                    <div key={i} className="lr-bar-wrapper">
                                        <div
                                            className={`lr-bar-fill ${d.isToday ? 'today' : ''}`}
                                            style={{ height: `${(d.value / maxWeeklyVal) * 100}%` }}
                                        >
                                            <span className="lr-bar-tip">{d.value > 0 ? d.value : ''}</span>
                                        </div>
                                        <span className="lr-day-name" style={{ color: d.isToday ? '#38bdf8' : '#64748b' }}>{d.day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lr-side-stats">
                            <div className="lr-mini-card">
                                <div className="lr-mini-icon" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
                                    <Target size={22} />
                                </div>
                                <span className="lr-mini-val">{Math.min(100, (weeklyPoints / 100 * 10)).toFixed(0)}%</span>
                                <span className="lr-mini-lbl">Goal Completed</span>
                            </div>
                            <div className="lr-mini-card">
                                <div className="lr-mini-icon" style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' }}>
                                    <Zap size={22} />
                                </div>
                                <span className="lr-mini-val">{weeklyLessonCount > 0 ? 'High' : 'Low'}</span>
                                <span className="lr-mini-lbl">Study Intensity</span>
                            </div>
                            <div className="lr-mini-card">
                                <div className="lr-mini-icon" style={{ background: 'rgba(129, 140, 248, 0.1)', color: '#818cf8' }}>
                                    <Clock size={22} />
                                </div>
                                <span className="lr-mini-val">{activeSessions}</span>
                                <span className="lr-mini-lbl">Lifetime Days Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Insights Block */}
                    <div style={{ marginTop: '2rem', background: 'rgba(56, 189, 248, 0.03)', border: '1px dashed #38bdf8', padding: '1.5rem', borderRadius: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#38bdf8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Weekly Recommendation</h4>
                            <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.95rem' }}>
                                {weeklyPoints > 50 ? "You're showing incredible momentum! Keep this pace and you'll hit your monthly target 3 days early." : "Consistency is key. Try to dedicate just 5 minutes today to keep your streak alive and build long-term memory."}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Section 2: Overall Mastery --- */}
            {reportType === 'overall' && (
                <div className="lr-section">
                    <div className="lr-overall-grid">
                        <div className="lr-glass-card">
                            <div className="lr-skill-header">
                                <h3 className="lr-chart-title"><Trophy size={24} color="#fbbf24" /> Skill Proficiency</h3>
                                <span style={{ padding: '4px 12px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '20px', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 800 }}>GLOBAL RANK: B1</span>
                            </div>
                            <div className="lr-skill-list">
                                {skillProgress.map((s, i) => (
                                    <div key={i} className="lr-skill-row">
                                        <div className="lr-skill-label">
                                            <span>{s.label}</span>
                                            <span style={{ color: s.color }}>{s.val}%</span>
                                        </div>
                                        <div className="lr-progress-track">
                                            <div className="lr-progress-bar" style={{ width: `${s.val}%`, background: s.color }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lr-glass-card">
                            <h3 className="lr-chart-title" style={{ marginBottom: '2rem' }}><Medal size={24} color="#34d399" /> Milestones & Unlocks</h3>
                            <div className="lr-milestone-list">
                                {milestones.map((m) => (
                                    <div key={m.id} className={`lr-milestone-item ${m.unlocked ? 'unlocked' : 'locked'}`}>
                                        <div className="lr-milestone-icon">
                                            {m.unlocked ? m.icon : <Lock size={16} color="#475569" />}
                                        </div>
                                        <div className="lr-milestone-info">
                                            <h4>{m.title}</h4>
                                            <p>{m.desc}</p>
                                        </div>
                                        {m.unlocked && <CheckCircle2 size={18} color="#34d399" style={{ marginLeft: 'auto' }} />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Overall Summary Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginTop: '2.5rem' }}>
                        <div className="lr-mini-card" style={{ textAlign: 'center' }}>
                            <span className="lr-mini-val" style={{ color: '#fbbf24' }}>{totalScore}</span>
                            <span className="lr-mini-lbl">Lifetime Points</span>
                        </div>
                        <div className="lr-mini-card" style={{ textAlign: 'center' }}>
                            <span className="lr-mini-val" style={{ color: '#38bdf8' }}>{totalLessons}</span>
                            <span className="lr-mini-lbl">Lessons Completed</span>
                        </div>
                        <div className="lr-mini-card" style={{ textAlign: 'center' }}>
                            <span className="lr-mini-val" style={{ color: '#a855f7' }}>{streak}</span>
                            <span className="lr-mini-lbl">Best Streak</span>
                        </div>
                        <div className="lr-mini-card" style={{ textAlign: 'center' }}>
                            <span className="lr-mini-val" style={{ color: '#34d399' }}>PRO</span>
                            <span className="lr-mini-lbl">Tier Status</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Space */}
            <div style={{ height: '6rem' }} />
        </div>
    );
};

export default LearningReport;
