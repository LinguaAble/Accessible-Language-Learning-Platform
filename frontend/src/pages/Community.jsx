import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, ChevronRight, Check, X as XIcon, Users } from 'lucide-react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import '../Dashboard.css'; // Reuse dashboard styles for cards
import './Community.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Community = () => {
    const { user } = useUser();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [communityData, setCommunityData] = useState({ friendRequests: [], friends: [] });
    const navigate = useNavigate();

    // Fetch friend requests and current friends initially
    useEffect(() => {
        if (!user?.email) return;
        const fetchCommunityData = async () => {
            try {
                const res = await axios.get(`${API}/api/auth/community/data?email=${user.email}`);
                setCommunityData(res.data);
            } catch (err) {
                console.error("Failed to load community data:", err);
            }
        };
        fetchCommunityData();
    }, [user]);

    // Debounced search
    useEffect(() => {
        const fetchUsers = async () => {
            if (!searchQuery.trim()) {
                setResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const res = await axios.get(`${API}/api/auth/search?q=${searchQuery}`);
                // Filter out current user from search results
                setResults(res.data.filter(u => u.username !== user?.username));
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(fetchUsers, 400);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, user]);

    // Handle Accept/Reject friend
    const handleAction = async (targetId, action) => {
        try {
            await axios.post(`${API}/api/auth/friend-request/${action}`, {
                currentEmail: user.email,
                targetId
            });
            // Update local state without refreshing
            if (action === 'accept') {
                const acceptedUser = communityData.friendRequests.find(u => u._id === targetId);
                setCommunityData(prev => ({
                    friendRequests: prev.friendRequests.filter(u => u._id !== targetId),
                    friends: [...prev.friends, acceptedUser]
                }));
            } else if (action === 'reject') {
                setCommunityData(prev => ({
                    ...prev,
                    friendRequests: prev.friendRequests.filter(u => u._id !== targetId)
                }));
            }
        } catch (err) {
            console.error(`Failed to ${action} request`, err);
        }
    };

    const isSearchActive = searchQuery.trim().length > 0;

    return (
        <div>
            <header className="content-header">
                <div className="greeting">
                    <h2>Community</h2>
                    <p>Connect with other learners and grow together.</p>
                </div>
            </header>

            <div className="community-container">
                <div className="stat-card" style={{ marginBottom: '20px' }}>
                    <div className="search-bar-wrapper">
                        <Search className="search-icon" size={20} color="var(--text-muted)" />
                        <input
                            type="text"
                            className="community-search-input"
                            placeholder="Find learners by name or username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {isSearchActive ? (
                    <div className="search-results">
                        <h3 className="section-label">Search Results</h3>
                        {isSearching ? (
                            <div className="search-message">Searching for learners...</div>
                        ) : results.length > 0 ? (
                            results.map((u) => (
                                <div
                                    key={u._id}
                                    className="stat-card user-result-card"
                                    onClick={() => navigate(`/profile/${u.username}`)}
                                >
                                    <img
                                        src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username || 'default'}`}
                                        alt={`${u.username}'s avatar`}
                                        className="user-avatar"
                                    />
                                    <div className="user-details">
                                        <div className="user-fullname">{u.fullName || u.username}</div>
                                        <div className="user-username">@{u.username}</div>
                                    </div>
                                    <ChevronRight size={20} color="var(--text-muted)" />
                                </div>
                            ))
                        ) : (
                            <div className="search-message">No learners found matching "{searchQuery}".</div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Pending Requests */}
                        {communityData.friendRequests.length > 0 && (
                            <div className="friend-requests-section" style={{ marginBottom: '30px' }}>
                                <h3 className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Users size={20} color="var(--accent-color)" /> Friend Requests
                                    <span className="badge">{communityData.friendRequests.length}</span>
                                </h3>
                                <div className="requests-grid">
                                    {communityData.friendRequests.map((req) => (
                                        <div key={req._id} className="stat-card request-card">
                                            <div className="req-user-info" onClick={() => navigate(`/profile/${req.username}`)} style={{ cursor: 'pointer' }}>
                                                <img
                                                    src={req.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.username || 'default'}`}
                                                    alt="avatar"
                                                    className="user-avatar"
                                                />
                                                <div className="user-details" style={{ marginLeft: '10px' }}>
                                                    <div className="user-fullname">{req.fullName || req.username}</div>
                                                    <div className="user-username">@{req.username}</div>
                                                </div>
                                            </div>
                                            <div className="action-buttons">
                                                <button className="icon-btn accept" onClick={() => handleAction(req._id, 'accept')}>
                                                    <Check size={18} />
                                                </button>
                                                <button className="icon-btn decline" onClick={() => handleAction(req._id, 'reject')}>
                                                    <XIcon size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Current Friends */}
                        <div className="friends-list-section">
                            <h3 className="section-label">Your Friends ({communityData.friends.length})</h3>
                            {communityData.friends.length === 0 ? (
                                <div className="search-message" style={{ opacity: 0.7 }}>
                                    You don't have any friends yet. Use the search bar above to find someone!
                                </div>
                            ) : (
                                <div className="friends-grid">
                                    {communityData.friends.map(friend => (
                                        <div
                                            key={friend._id}
                                            className="stat-card user-result-card"
                                            onClick={() => navigate(`/profile/${friend.username}`)}
                                        >
                                            <img
                                                src={friend.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username || 'default'}`}
                                                alt="avatar"
                                                className="user-avatar"
                                            />
                                            <div className="user-details">
                                                <div className="user-fullname">{friend.fullName || friend.username}</div>
                                                <div className="user-username">@{friend.username}</div>
                                            </div>
                                            <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {friend.streak > 0 && <div style={{ color: '#e74c3c' }}>🔥 {friend.streak} Streak</div>}
                                                <div>📚 {friend.completedLessons?.length || 0} Lessons</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <style>{`
                .section-label {
                    margin-bottom: 15px;
                    color: var(--text-main);
                    font-size: 1.15rem;
                }
                .badge {
                    background: #e74c3c;
                    color: #fff;
                    border-radius: 12px;
                    padding: 2px 8px;
                    font-size: 0.8rem;
                    font-weight: bold;
                }
                .requests-grid, .friends-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 15px;
                }
                .request-card {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px;
                }
                .req-user-info {
                    display: flex;
                    align-items: center;
                    flex: 1;
                }
                .action-buttons {
                    display: flex;
                    gap: 8px;
                }
                .icon-btn {
                    padding: 8px;
                    border-radius: 50%;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    color: white;
                }
                .icon-btn.accept { background-color: #2ecc71; }
                .icon-btn.accept:hover { background-color: #27ae60; }
                .icon-btn.decline { background-color: #e74c3c; }
                .icon-btn.decline:hover { background-color: #c0392b; }
            `}</style>
        </div>
    );
};

export default Community;
