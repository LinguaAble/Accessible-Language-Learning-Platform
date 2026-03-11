import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ChevronLeft, Flame, BookOpen, Star, UserPlus, Check,
    Clock, ShieldCheck, Users, Zap, ArrowRight, X
} from 'lucide-react';
import { useUser } from '../context/UserContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ── helpers ─────────────────────────────────────────────── */
const fmt = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const startOfWeek = (d) => {
    const x = new Date(d);
    const day = x.getDay();
    x.setDate(x.getDate() - day + (day === 0 ? -6 : 1));
    return x;
};

const getWeeklyPoints = (dailyScores = []) => {
    const sow = startOfWeek(new Date());
    const sowStr = fmt(sow);
    const eow = new Date(sow); eow.setDate(sow.getDate() + 6);
    const eowStr = fmt(eow);
    return dailyScores
        .filter(s => s.date >= sowStr && s.date <= eowStr)
        .reduce((acc, s) => acc + (s.score || 0), 0);
};

/* ── component ───────────────────────────────────────────── */
const UserProfile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [showFriends, setShowFriends] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const query = user?.email ? `?requesterEmail=${user.email}` : '';
                const res = await axios.get(`${API}/api/auth/profile/${username}${query}`);
                setProfile(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Could not find user.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username, user]);

    const handleFriendAction = async (action) => {
        setActionLoading(true);
        try {
            await axios.post(`${API}/api/auth/friend-request/${action}`, {
                requesterEmail: user.email,
                currentEmail: user.email,
                targetUsername: username,
                targetId: profile._id
            });
            setProfile(prev => {
                let newRel = prev.relationship;
                if (action === 'send') newRel = 'pending_sent';
                if (action === 'accept') newRel = 'friends';
                return { ...prev, relationship: newRel };
            });
            if (action === 'accept') {
                const query = user?.email ? `?requesterEmail=${user.email}` : '';
                const res = await axios.get(`${API}/api/auth/profile/${username}${query}`);
                setProfile(res.data);
            }
        } catch (err) {
            console.error(`Failed to ${action} friend request:`, err);
        } finally {
            setActionLoading(false);
        }
    };

    const isFriendOrSelf = profile?.relationship === 'friends' || profile?.relationship === 'self';
    const weeklyPoints = useMemo(() =>
        isFriendOrSelf ? getWeeklyPoints(profile?.dailyScores || []) : 0,
        [profile, isFriendOrSelf]
    );

    /* ── loading ─── */
    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
            <div style={{ width: 40, height: 40, border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Loading {username}'s profile…</span>
        </div>
    );

    /* ── error ─── */
    if (error || !profile) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
            <ShieldCheck size={48} color="var(--border-color)" />
            <h3 style={{ color: 'var(--text-main)', margin: 0 }}>User Not Found</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>{error}</p>
            <button onClick={() => navigate('/community')} style={{ marginTop: 8, padding: '10px 24px', background: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}>
                Back to Community
            </button>
        </div>
    );

    const avatarSrc = profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`;
    const friends = profile.friends || [];

    return (
        <>
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .up-profile-root {
                    max-width: 780px;
                    margin: 0 auto;
                    padding: 24px 20px 60px;
                    animation: fadeUp 0.4s ease both;
                }
                /* Back button */
                .up-back-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    color: var(--text-muted);
                    padding: 8px 16px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 600;
                    transition: all 0.2s;
                    margin-bottom: 28px;
                }
                .up-back-btn:hover {
                    color: var(--accent-color);
                    border-color: var(--accent-color);
                }
                /* Hero card */
                .up-hero {
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 24px;
                    padding: 32px;
                    display: flex;
                    align-items: flex-start;
                    gap: 28px;
                    margin-bottom: 20px;
                    position: relative;
                    overflow: hidden;
                }
                .up-hero::before {
                    content: '';
                    position: absolute;
                    top: -60px; right: -60px;
                    width: 220px; height: 220px;
                    background: radial-gradient(circle, rgba(230,126,34,0.12) 0%, transparent 70%);
                    pointer-events: none;
                }
                .up-avatar {
                    width: 96px;
                    height: 96px;
                    border-radius: 50%;
                    border: 3px solid var(--accent-color);
                    object-fit: cover;
                    flex-shrink: 0;
                    box-shadow: 0 0 0 6px rgba(230,126,34,0.12);
                }
                .up-hero-info {
                    flex: 1;
                    min-width: 0;
                }
                .up-hero-name {
                    font-size: 1.6rem;
                    font-weight: 800;
                    color: var(--text-main);
                    margin: 0 0 4px 0;
                    line-height: 1.2;
                }
                .up-hero-handle {
                    color: var(--text-muted);
                    font-size: 0.95rem;
                    margin-bottom: 10px;
                }
                .up-hero-bio {
                    color: var(--text-main);
                    font-size: 0.9rem;
                    line-height: 1.6;
                    opacity: 0.8;
                    font-style: italic;
                    margin: 0;
                    max-width: 420px;
                }
                .up-hero-actions {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 10px;
                    flex-shrink: 0;
                }
                .up-action-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    border-radius: 12px;
                    font-size: 0.9rem;
                    font-weight: 700;
                    cursor: pointer;
                    border: none;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .up-action-btn.primary {
                    background: var(--accent-color);
                    color: #fff;
                }
                .up-action-btn.primary:hover:not(:disabled) {
                    background: var(--accent-hover);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 18px rgba(230,126,34,0.35);
                }
                .up-action-btn.outline {
                    background: transparent;
                    border: 1.5px solid var(--border-color);
                    color: var(--text-muted);
                }
                .up-action-btn.success {
                    background: rgba(46,204,113,0.12);
                    border: 1.5px solid #2ecc71;
                    color: #2ecc71;
                }
                .up-action-btn.friends-btn {
                    background: rgba(52,152,219,0.12);
                    border: 1.5px solid #3498db;
                    color: #3498db;
                }
                .up-action-btn.friends-btn:hover:not(:disabled) {
                    background: rgba(52,152,219,0.2);
                    transform: translateY(-1px);
                }
                .up-action-btn:disabled {
                    opacity: 0.65;
                    cursor: default;
                }
                /* Stats grid */
                .up-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    margin-bottom: 20px;
                }
                .up-stat-card {
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 18px;
                    padding: 22px 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    gap: 8px;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .up-stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                }
                .up-stat-icon {
                    width: 44px; height: 44px;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    margin-bottom: 4px;
                }
                .up-stat-value {
                    font-size: 1.8rem;
                    font-weight: 800;
                    color: var(--text-main);
                    line-height: 1;
                }
                .up-stat-label {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                /* Private card */
                .up-private-card {
                    background: var(--card-bg);
                    border: 1px dashed var(--border-color);
                    border-radius: 20px;
                    padding: 48px 24px;
                    text-align: center;
                    margin-bottom: 20px;
                }
                /* Friends panel */
                .up-friends-panel {
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 20px;
                    overflow: hidden;
                    animation: fadeUp 0.3s ease both;
                }
                .up-friends-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 18px 24px;
                    border-bottom: 1px solid var(--border-color);
                }
                .up-friends-title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--text-main);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .up-close-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                }
                .up-close-btn:hover { color: var(--text-main); }
                .up-friends-list {
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    max-height: 320px;
                    overflow-y: auto;
                }
                .up-friend-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 14px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .up-friend-row:hover {
                    background: rgba(230,126,34,0.07);
                }
                .up-friend-avatar {
                    width: 36px; height: 36px;
                    border-radius: 50%;
                    border: 2px solid var(--border-color);
                    object-fit: cover;
                    flex-shrink: 0;
                }
                .up-friend-name {
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: var(--text-main);
                }
                .up-friend-handle {
                    font-size: 0.78rem;
                    color: var(--text-muted);
                }
                .up-friend-arrow {
                    margin-left: auto;
                    color: var(--text-muted);
                    opacity: 0;
                    transition: opacity 0.15s;
                }
                .up-friend-row:hover .up-friend-arrow { opacity: 1; }
                .up-empty-friends {
                    text-align: center;
                    padding: 40px 24px;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }
                /* Mobile */
                @media (max-width: 600px) {
                    .up-hero { flex-direction: column; }
                    .up-hero-actions { flex-direction: row; align-items: flex-start; }
                    .up-stats-grid { grid-template-columns: 1fr 1fr; }
                }
            `}</style>

            <div className="up-profile-root">

                {/* Back */}
                <button className="up-back-btn" onClick={() => navigate('/community')}>
                    <ChevronLeft size={16} /> Back to Community
                </button>

                {/* Hero card */}
                <div className="up-hero">
                    <img src={avatarSrc} alt={profile.username} className="up-avatar" />

                    <div className="up-hero-info">
                        <h1 className="up-hero-name">{profile.fullName || profile.username}</h1>
                        <p className="up-hero-handle">@{profile.username}</p>
                        {profile.bio && <p className="up-hero-bio">"{profile.bio}"</p>}
                        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Users size={14} color="var(--text-muted)" />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.83rem', fontWeight: 600 }}>
                                {profile.friendCount ?? friends.length} friend{(profile.friendCount ?? friends.length) !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    <div className="up-hero-actions">
                        {/* Friend action */}
                        {profile.relationship !== 'self' && (
                            <>
                                {profile.relationship === 'none' && (
                                    <button className="up-action-btn primary" onClick={() => handleFriendAction('send')} disabled={actionLoading}>
                                        <UserPlus size={16} /> Add Friend
                                    </button>
                                )}
                                {profile.relationship === 'pending_sent' && (
                                    <button className="up-action-btn outline" disabled>
                                        <Clock size={16} /> Request Sent
                                    </button>
                                )}
                                {profile.relationship === 'pending_received' && (
                                    <button className="up-action-btn success" onClick={() => handleFriendAction('accept')} disabled={actionLoading}>
                                        <Check size={16} /> Accept Request
                                    </button>
                                )}
                                {profile.relationship === 'friends' && (
                                    <button className="up-action-btn outline" disabled>
                                        <ShieldCheck size={16} /> Friends
                                    </button>
                                )}
                            </>
                        )}

                        {/* View Friends toggle */}
                        <button
                            className="up-action-btn friends-btn"
                            onClick={() => setShowFriends(f => !f)}
                        >
                            <Users size={16} /> {showFriends ? 'Hide' : 'View'} Friends
                        </button>
                    </div>
                </div>

                {/* Stats */}
                {isFriendOrSelf ? (
                    <div className="up-stats-grid">
                        <div className="up-stat-card">
                            <div className="up-stat-icon" style={{ background: 'rgba(231,76,60,0.12)', color: '#e74c3c' }}>
                                <Flame size={22} />
                            </div>
                            <div className="up-stat-value">{profile.streak || 0}</div>
                            <div className="up-stat-label">Day Streak</div>
                        </div>

                        <div className="up-stat-card">
                            <div className="up-stat-icon" style={{ background: 'rgba(52,152,219,0.12)', color: '#3498db' }}>
                                <BookOpen size={22} />
                            </div>
                            <div className="up-stat-value">{profile.completedLessons || 0}</div>
                            <div className="up-stat-label">Lessons Done</div>
                        </div>

                        <div className="up-stat-card">
                            <div className="up-stat-icon" style={{ background: 'rgba(241,196,15,0.12)', color: '#f1c40f' }}>
                                <Zap size={22} />
                            </div>
                            <div className="up-stat-value" style={{ color: '#f1c40f' }}>{weeklyPoints}</div>
                            <div className="up-stat-label">Points This Week</div>
                        </div>
                    </div>
                ) : (
                    <div className="up-private-card">
                        <ShieldCheck size={44} color="var(--border-color)" style={{ marginBottom: 14 }} />
                        <h3 style={{ color: 'var(--text-main)', margin: '0 0 8px', fontSize: '1.2rem' }}>Private Progress</h3>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem', maxWidth: 360, marginInline: 'auto' }}>
                            Add @{profile.username} as a friend to see their streak, lessons, and weekly points.
                        </p>
                    </div>
                )}

                {/* Friends panel */}
                {showFriends && (
                    <div className="up-friends-panel">
                        <div className="up-friends-header">
                            <span className="up-friends-title">
                                <Users size={18} color="var(--accent-color)" />
                                {profile.username}'s Friends ({friends.length})
                            </span>
                            <button className="up-close-btn" onClick={() => setShowFriends(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="up-friends-list">
                            {friends.length === 0 ? (
                                <div className="up-empty-friends">No friends yet.</div>
                            ) : friends.map(f => (
                                <div
                                    key={f.username}
                                    className="up-friend-row"
                                    onClick={() => navigate(`/profile/${f.username}`)}
                                >
                                    <img
                                        src={f.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.username}`}
                                        alt={f.username}
                                        className="up-friend-avatar"
                                    />
                                    <div>
                                        <div className="up-friend-name">{f.username}</div>
                                        <div className="up-friend-handle">@{f.username}</div>
                                    </div>
                                    <ArrowRight size={14} className="up-friend-arrow" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </>
    );
};

export default UserProfile;
