import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Flame, BookOpen, User, Star, UserPlus, Check, Clock, ShieldCheck } from 'lucide-react';
import { useUser } from '../context/UserContext';
import '../Dashboard.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const UserProfile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Pass requester email so backend knows relationship 
                const query = user?.email ? `?requesterEmail=${user.email}` : '';
                const res = await axios.get(`${API}/api/auth/profile/${username}${query}`);
                setProfile(res.data);
            } catch (err) {
                console.error("Failed to fetch profile:", err);
                setError(err.response?.data?.message || "Could not find user.");
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
                currentEmail: user.email, // for accept/reject
                targetUsername: username, // for send
                targetId: profile._id // for accept
            });

            // Optimistically update relationship state
            setProfile(prev => {
                let newRel = prev.relationship;
                let newStreak = prev.streak;
                let newCompleted = prev.completedLessons;
                if (action === 'send') newRel = 'pending_sent';
                if (action === 'accept') newRel = 'friends';
                return { ...prev, relationship: newRel };
            });

            if (action === 'accept') {
                // To get actual stats since now we're friends, we should ideally refetch
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

    if (loading) {
        return <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading {username}'s profile...</div>;
    }

    if (error || !profile) {
        return (
            <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-main)' }}>
                <h3>User Not Found</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>{error}</p>
                <button
                    className="toggle-btn active"
                    onClick={() => navigate('/community')}
                    style={{ padding: '10px 20px', borderRadius: '8px' }}
                >
                    Back to Community
                </button>
            </div>
        );
    }

    const isFriendOrSelf = profile.relationship === 'friends' || profile.relationship === 'self';
    const totalXP = (isFriendOrSelf && profile.dailyScores)
        ? profile.dailyScores.reduce((sum, day) => sum + day.score, 0) : 0;

    return (
        <div>
            <header className="content-header" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button
                    onClick={() => navigate('/community')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--card-bg)'
                    }}
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="greeting">
                    <h2>Learner Profile</h2>
                    <p>Viewing {profile.username}'s information</p>
                </div>
            </header>

            <div className="dashboard-grid">
                {/* Profile Header Card */}
                <div className="stat-card" style={{ gridColumn: 'span 2', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '25px', padding: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                        <img
                            src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username || 'default'}`}
                            alt="Profile avatar"
                            style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                border: '4px solid var(--accent-color)',
                                objectFit: 'cover'
                            }}
                        />
                        <div>
                            <h2 style={{ fontSize: '1.8rem', margin: '0 0 5px 0', color: 'var(--text-main)' }}>
                                {profile.fullName || profile.username}
                            </h2>
                            <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>@{profile.username}</span>
                            {profile.bio && (
                                <p style={{ marginTop: '15px', color: 'var(--text-main)', opacity: 0.9, fontStyle: 'italic', maxWidth: '600px', lineHeight: 1.5 }}>
                                    "{profile.bio}"
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Friend Action Button */}
                    {profile.relationship !== 'self' && (
                        <div style={{ marginTop: '10px' }}>
                            {profile.relationship === 'none' && (
                                <button className="toggle-btn active" onClick={() => handleFriendAction('send')} disabled={actionLoading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px' }}>
                                    <UserPlus size={18} /> Add Friend
                                </button>
                            )}
                            {profile.relationship === 'pending_sent' && (
                                <button className="toggle-btn" disabled style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', opacity: 0.7 }}>
                                    <Clock size={18} /> Request Sent
                                </button>
                            )}
                            {profile.relationship === 'pending_received' && (
                                <button className="toggle-btn active" onClick={() => handleFriendAction('accept')} disabled={actionLoading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', backgroundColor: '#2ecc71', borderColor: '#27ae60' }}>
                                    <Check size={18} /> Accept Request
                                </button>
                            )}
                            {profile.relationship === 'friends' && (
                                <button className="toggle-btn" disabled style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', borderColor: '#3498db', color: '#3498db' }}>
                                    <ShieldCheck size={18} /> Friends
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Conditional Stat Cards */}
                {isFriendOrSelf ? (
                    <>
                        <div className="stat-card">
                            <div className="stat-header">
                                <Flame size={24} color="#e74c3c" />
                                <h3>Streak</h3>
                            </div>
                            <div className="stat-number">{profile.streak || 0}</div>
                            <div className="stat-description">Days in a row</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-header">
                                <BookOpen size={24} color="#3498db" />
                                <h3>Lessons</h3>
                            </div>
                            <div className="stat-number">{profile.completedLessons?.length || 0}</div>
                            <div className="stat-description">Lessons finished</div>
                        </div>

                        <div className="stat-card" style={{ gridColumn: 'span 2' }}>
                            <div className="stat-header">
                                <Star size={24} color="#f1c40f" />
                                <h3>Total Experience (Estimated)</h3>
                            </div>
                            <div className="stat-number" style={{ color: '#f1c40f' }}>{totalXP} XP</div>
                            <div className="stat-description">Knowledge gained over time</div>
                        </div>
                    </>
                ) : (
                    <div className="stat-card" style={{ gridColumn: 'span 2', textAlign: 'center', padding: '60px 20px' }}>
                        <ShieldCheck size={48} color="var(--border-color)" style={{ marginBottom: '15px' }} />
                        <h3 style={{ color: 'var(--text-main)', fontSize: '1.4rem' }}>Private Progress</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '10px' }}>
                            Add @{profile.username} as a friend to see their learning statistics, streak, and level up together!
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }
                .dashboard-grid > .stat-card {
                    animation: scaleIn 0.5s ease-out both;
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                }
                .dashboard-grid > .stat-card:nth-child(1) { animation-delay: 0.05s; }
                .dashboard-grid > .stat-card:nth-child(2) { animation-delay: 0.15s; }
                .dashboard-grid > .stat-card:nth-child(3) { animation-delay: 0.25s; }
                .dashboard-grid > .stat-card:nth-child(4) { animation-delay: 0.35s; }
                .dashboard-grid > .stat-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.1);
                }
                .stat-number {
                    animation: countUp 0.6s ease-out 0.3s both;
                }
            `}</style>
        </div>
    );
};

export default UserProfile;
