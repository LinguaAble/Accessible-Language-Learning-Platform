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

        // This Week — use strict Mon→Sun window to avoid data bleed
        const sow = startOfWeek(new Date());
        const sowStr = fmt(sow);
        const eow = new Date(sow); eow.setDate(sow.getDate() + 6);
        const eowStr = fmt(eow);

        const thisWeekScores = dailyScores.filter(s => s.date >= sowStr && s.date <= eowStr);
        const weeklyPoints = thisWeekScores.reduce((acc, curr) => acc + curr.score, 0);

        const thisWeekLessons = dailyLessonCounts.filter(l => l.date >= sowStr && l.date <= eowStr);
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
    const maxWeeklyVal = Math.max(20, Math.max(...weeklyData.map(d => d.value)) * 1.2);

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
                <div style={{ padding: '6px 14px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    LAST SYNCED: JUST NOW
                </div>
            </div>

            {/* Main Title */}
            <div className="lr-main-title">
                <h1>Performance Report</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '8px' }}>Tracking your journey to language mastery.</p>
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

                            <div style={{ position: 'relative', height: '240px', width: '100%', marginTop: '20px' }}>
                                {/* SVG Line */}
                                <svg style={{ position: 'absolute', top: '40px', left: '5%', width: '90%', height: '140px', overflow: 'visible' }}>
                                    <defs>
                                        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#38bdf8" />
                                            <stop offset="50%" stopColor="#818cf8" />
                                            <stop offset="100%" stopColor="#a855f7" />
                                        </linearGradient>
                                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                            <feGaussianBlur stdDeviation="4" result="blur" />
                                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                        </filter>
                                    </defs>
                                    {weeklyData.map((d, i) => {
                                        if (i === 0) return null;
                                        const prev = weeklyData[i - 1];
                                        return (
                                            <line
                                                key={`line-${i}`}
                                                x1={`${((i - 1) / 6) * 100}%`}
                                                y1={`${100 - (prev.value / maxWeeklyVal * 100)}%`}
                                                x2={`${(i / 6) * 100}%`}
                                                y2={`${100 - (d.value / maxWeeklyVal * 100)}%`}
                                                stroke="url(#lineGrad)"
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                                filter="url(#glow)"
                                            />
                                        );
                                    })}
                                </svg>

                                {/* Labels & Dots Overlay */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'absolute', top: 0, left: '5%', width: '90%', height: '100%', pointerEvents: 'none' }}>
                                    {weeklyData.map((d, i) => (
                                        <div key={`col-${i}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 0, position: 'relative' }}>

                                            {/* Tip / Value */}
                                            <div style={{
                                                position: 'absolute',
                                                top: `calc(40px + ${140 * (1 - (d.value / maxWeeklyVal))}px - 32px)`,
                                                fontSize: '0.8rem',
                                                fontWeight: 800,
                                                color: d.isToday ? '#38bdf8' : 'var(--text-main)',
                                                opacity: d.value > 0 || d.isToday ? 1 : 0
                                            }}>
                                                {d.value}
                                            </div>

                                            {/* Dot */}
                                            <div style={{
                                                position: 'absolute',
                                                top: `calc(40px + ${140 * (1 - (d.value / maxWeeklyVal))}px - 6px)`,
                                                width: '12px', height: '12px',
                                                borderRadius: '50%',
                                                background: d.isToday ? '#38bdf8' : 'var(--card-bg)',
                                                border: `3px solid ${d.isToday ? '#fff' : '#818cf8'}`,
                                                boxShadow: d.isToday ? '0 0 12px rgba(56, 189, 248, 0.8)' : 'none',
                                                zIndex: 2,
                                                transform: d.isToday ? 'scale(1.2)' : 'scale(1)'
                                            }} />

                                            {/* Day Name */}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '10px',
                                                fontSize: '0.85rem',
                                                fontWeight: 700,
                                                color: d.isToday ? '#38bdf8' : 'var(--text-muted)'
                                            }}>
                                                {d.day}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lr-side-stats">
                            <div className="lr-mini-card">
                                <div className="lr-mini-icon" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
                                    <Target size={22} />
                                </div>
                                <span className="lr-mini-val">{Math.min(100, Math.round((Math.max(user?.todayProgress || 0, parseInt(localStorage.getItem('todayProgress'), 10) || 0) / (user?.preferences?.dailyGoalMinutes || 5)) * 100))}%</span>
                                <span className="lr-mini-lbl">Goal Completed</span>
                            </div>
                            <div className="lr-mini-card">
                                <div className="lr-mini-icon" style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' }}>
                                    <Zap size={22} />
                                </div>
                                <span className="lr-mini-val">{weeklyLessonCount > 0 ? 'High' : 'Low'}</span>
                                <span className="lr-mini-lbl">Study Intensity</span>
                            </div>
                        </div>
                    </div>

                    {/* Insights Block */}
                    <div style={{ marginTop: '2rem', background: 'var(--card-bg)', border: '1px dashed var(--accent-color)', padding: '1.5rem', borderRadius: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--accent-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>Weekly Recommendation</h4>
                            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '2.5rem' }}>
                        <div className="lr-mini-card" style={{ textAlign: 'center' }}>
                            <span className="lr-mini-val" style={{ color: '#fbbf24' }}>{weeklyPoints}</span>
                            <span className="lr-mini-lbl">Points This Week</span>
                        </div>
                        <div className="lr-mini-card" style={{ textAlign: 'center' }}>
                            <span className="lr-mini-val" style={{ color: '#38bdf8' }}>{totalLessons}</span>
                            <span className="lr-mini-lbl">Lessons Completed</span>
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
