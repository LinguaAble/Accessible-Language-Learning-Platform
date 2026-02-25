import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Trophy, Crown, Medal, RefreshCw, Star, Flame } from 'lucide-react';
import { useUser } from '../context/UserContext';
import '../Dashboard.css';

// ─── helpers ────────────────────────────────────────────────────────────────

function getWeekResetInfo() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0);
    const msLeft = nextMonday - now;
    const daysLeft = Math.floor(msLeft / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { daysLeft, hoursLeft };
}

function getAvatarUrl(entry) {
    if (entry.avatarUrl) return entry.avatarUrl;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(entry.username)}`;
}

function getRankColor(rank) {
    if (rank === 1) return '#FFD700';  // gold
    if (rank === 2) return '#C0C0C0';  // silver
    if (rank === 3) return '#CD7F32';  // bronze
    return 'var(--accent-color)';
}

// ─── sub-components ─────────────────────────────────────────────────────────

const PodiumCard = ({ entry, isCurrentUser }) => {
    const height = entry.rank === 1 ? 180 : entry.rank === 2 ? 140 : 110;
    const color = getRankColor(entry.rank);
    const icon = entry.rank === 1 ? <Crown size={22} /> : entry.rank === 2 ? <Medal size={20} /> : <Star size={18} />;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: entry.rank === 1 ? 1.2 : 1,
            gap: 10,
            order: entry.rank === 2 ? 0 : entry.rank === 1 ? 1 : 2,
        }}>
            {/* Crown / medal */}
            <div style={{ color, fontSize: 22 }}>{icon}</div>

            {/* Avatar */}
            <div style={{
                position: 'relative',
                width: entry.rank === 1 ? 80 : 64,
                height: entry.rank === 1 ? 80 : 64,
                borderRadius: '50%',
                border: `3px solid ${color}`,
                boxShadow: `0 0 ${entry.rank === 1 ? 24 : 12}px ${color}66`,
                overflow: 'hidden',
                flexShrink: 0,
            }}>
                <img src={getAvatarUrl(entry)} alt={entry.username} style={{ width: '100%', height: '100%' }} />
            </div>

            {/* Name + score */}
            <div style={{ textAlign: 'center' }}>
                <p style={{
                    margin: 0,
                    fontWeight: 700,
                    fontSize: entry.rank === 1 ? '1rem' : '0.875rem',
                    color: isCurrentUser ? color : 'var(--text-main)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 100,
                }}>
                    {entry.username}{isCurrentUser ? ' (You)' : ''}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {entry.weeklyScore > 0 ? entry.weeklyScore.toLocaleString() + ' pts' : '—'}
                </p>
            </div>

            {/* Pedestal */}
            <div style={{
                width: '100%',
                height,
                background: `linear-gradient(180deg, ${color}33, ${color}11)`,
                border: `1px solid ${color}44`,
                borderRadius: '12px 12px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: entry.rank === 1 ? '2.5rem' : '1.75rem',
                color,
            }}>
                #{entry.rank}
            </div>
        </div>
    );
};

const LeaderRow = ({ entry, isCurrentUser }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '14px 20px',
        background: isCurrentUser ? 'rgba(230, 126, 34, 0.12)' : 'transparent',
        border: isCurrentUser ? '1px solid rgba(230, 126, 34, 0.5)' : '1px solid transparent',
        borderRadius: 14,
        transition: 'background 0.2s',
        cursor: 'default',
    }}
        onMouseEnter={e => { if (!isCurrentUser) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
        onMouseLeave={e => { if (!isCurrentUser) e.currentTarget.style.background = 'transparent'; }}
    >
        {/* Rank */}
        <span style={{
            minWidth: 32,
            fontWeight: 800,
            fontSize: '1rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
        }}>
            {entry.rank}
        </span>

        {/* Avatar */}
        <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: `2px solid ${isCurrentUser ? 'var(--accent-color)' : 'var(--border-color)'}`,
            overflow: 'hidden', flexShrink: 0,
        }}>
            <img src={getAvatarUrl(entry)} alt={entry.username} style={{ width: '100%', height: '100%' }} />
        </div>

        {/* Name */}
        <span style={{
            flex: 1,
            fontWeight: 600,
            color: isCurrentUser ? 'var(--accent-color)' : 'var(--text-main)',
            fontSize: '0.9375rem',
        }}>
            {entry.username}{isCurrentUser ? ' (You)' : ''}
        </span>

        {/* Lessons */}
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 70, textAlign: 'right' }}>
            {entry.completedLessons} lessons
        </span>

        {/* Score */}
        <span style={{
            minWidth: 80,
            textAlign: 'right',
            fontWeight: 800,
            fontSize: '1rem',
            color: entry.weeklyScore > 0 ? 'var(--text-main)' : 'var(--text-muted)',
        }}>
            {entry.weeklyScore > 0 ? entry.weeklyScore.toLocaleString() : '—'}
        </span>
    </div>
);

// ─── main component ──────────────────────────────────────────────────────────

const Leaderboard = () => {
    const { user } = useUser();
    const [entries, setEntries] = useState([]);
    const [weekInfo, setWeekInfo] = useState({ weekStart: '', weekEnd: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { daysLeft, hoursLeft } = getWeekResetInfo();

    const fetchLeaderboard = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get('http://localhost:5000/api/auth/leaderboard');
            if (res.data.success) {
                setEntries(res.data.leaderboard);
                setWeekInfo({ weekStart: res.data.weekStart, weekEnd: res.data.weekEnd });
            }
        } catch (err) {
            setError('Could not load the leaderboard. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

    const isCurrentUser = (entry) =>
        entry.email === user.email || entry.username === user.username;

    const top3 = entries.slice(0, 3);
    const rest = entries.slice(3);
    const myEntry = entries.find(isCurrentUser);

    // ─── render ───────────────────────────────────────────────────────────────

    return (
        <div>
            {/* ── Header ────────────────────────────────────────────── */}
            <header className="content-header">
                <div className="greeting">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Trophy size={28} color="var(--accent-color)" />
                        Leaderboard
                    </h2>
                    <p>Weekly rankings — resets every Monday</p>
                </div>
                <div className="header-stats">
                    {/* Reset countdown pill */}
                    <div className="stat-pill streak" title="Time until weekly scores reset">
                        <Flame size={16} fill="currentColor" />
                        Resets in {daysLeft}d {hoursLeft}h
                    </div>
                    {/* Refresh button */}
                    <button
                        className="notif-btn"
                        onClick={fetchLeaderboard}
                        title="Refresh leaderboard"
                        style={{ cursor: 'pointer' }}
                    >
                        <RefreshCw size={20} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                    </button>
                    {/* Current user avatar */}
                    <div className="profile-avatar">
                        <img
                            src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.username || 'user')}`}
                            alt="You"
                        />
                    </div>
                </div>
            </header>

            {/* ── Body ──────────────────────────────────────────────── */}
            <div style={{ maxWidth: 720, margin: '0 auto' }}>

                {/* Week label */}
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: 32, fontWeight: 600 }}>
                    📅 {weekInfo.weekStart} → {weekInfo.weekEnd}
                </p>

                {/* ── Loading ── */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                        <div style={{
                            width: 40, height: 40, border: '4px solid var(--border-color)',
                            borderTopColor: 'var(--accent-color)', borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
                        }} />
                        <p style={{ fontWeight: 600 }}>Loading rankings…</p>
                    </div>
                )}

                {/* ── Error ── */}
                {!loading && error && (
                    <div style={{
                        textAlign: 'center', padding: '60px 20px',
                        background: 'var(--card-bg)', borderRadius: 20, border: '1px solid var(--border-color)',
                    }}>
                        <p style={{ color: '#e74c3c', fontWeight: 700, marginBottom: 16 }}>{error}</p>
                        <button
                            onClick={fetchLeaderboard}
                            style={{
                                padding: '10px 24px', background: 'var(--accent-color)', color: '#fff',
                                border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer',
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* ── Leaderboard content ── */}
                {!loading && !error && entries.length > 0 && (
                    <>
                        {/* ── Your Rank banner (if not top 3) ── */}
                        {myEntry && myEntry.rank > 3 && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                background: 'rgba(230, 126, 34, 0.08)',
                                border: '1px solid rgba(230, 126, 34, 0.4)',
                                borderRadius: 16, padding: '14px 20px', marginBottom: 28,
                            }}>
                                <Trophy size={20} color="var(--accent-color)" />
                                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                                    Your rank: <span style={{ color: 'var(--accent-color)' }}>#{myEntry.rank}</span>
                                </span>
                                <span style={{ marginLeft: 'auto', fontWeight: 800, color: 'var(--text-main)' }}>
                                    {myEntry.weeklyScore > 0 ? `${myEntry.weeklyScore.toLocaleString()} pts this week` : 'No score yet'}
                                </span>
                            </div>
                        )}

                        {/* ── Top 3 Podium ── */}
                        {top3.length > 0 && (
                            <div style={{
                                background: 'var(--card-bg)', borderRadius: 24,
                                border: '1px solid var(--border-color)',
                                padding: '32px 24px 0', marginBottom: 24,
                                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                            }}>
                                <h3 style={{
                                    textAlign: 'center', margin: '0 0 28px',
                                    color: 'var(--text-muted)', fontSize: '0.75rem',
                                    fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                                }}>
                                    Top Performers
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                                    {top3.map(entry => (
                                        <PodiumCard key={entry.email} entry={entry} isCurrentUser={isCurrentUser(entry)} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Ranked List (4th+) ── */}
                        {rest.length > 0 && (
                            <div style={{
                                background: 'var(--card-bg)', borderRadius: 20,
                                border: '1px solid var(--border-color)',
                                padding: '8px 8px',
                                boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
                            }}>
                                {/* Header row */}
                                <div style={{
                                    display: 'flex', gap: 16, padding: '10px 20px',
                                    borderBottom: '1px solid var(--border-color)', marginBottom: 4,
                                }}>
                                    <span style={{ minWidth: 32, fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center' }}>#</span>
                                    <span style={{ width: 40 }} />
                                    <span style={{ flex: 1, fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>PLAYER</span>
                                    <span style={{ minWidth: 70, fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'right' }}>LESSONS</span>
                                    <span style={{ minWidth: 80, fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'right' }}>SCORE</span>
                                </div>
                                {rest.map(entry => (
                                    <LeaderRow key={entry.email} entry={entry} isCurrentUser={isCurrentUser(entry)} />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ── Empty state ── */}
                {!loading && !error && entries.length === 0 && (
                    <div style={{
                        textAlign: 'center', padding: '80px 20px',
                        background: 'var(--card-bg)', borderRadius: 20,
                        border: '1px solid var(--border-color)',
                    }}>
                        <Trophy size={56} color="var(--border-color)" style={{ marginBottom: 16 }} />
                        <h3 style={{ color: 'var(--text-main)', marginBottom: 8 }}>No players yet!</h3>
                        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                            Complete a lesson to appear on the leaderboard.
                        </p>
                    </div>
                )}
            </div>

            {/* Spin keyframe */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default Leaderboard;
