
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import '../App.css';

const Practice = () => {
    const navigate = useNavigate();
    const [revisionLessons, setRevisionLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRevision = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                // Use the backend revision endpoint
                const res = await axios.get('http://localhost:5000/api/learn/revision', {
                    headers: { 'x-auth-token': token }
                });

                // If no revision returned from backend (mock logic often returns empty), 
                // fallback to showing previously completed lessons or random ones for demo.
                if (res.data && res.data.length > 0) {
                    setRevisionLessons(res.data);
                } else {
                    // Fallback: Fetch all lessons and filter for completed
                    const allRes = await axios.get('http://localhost:5000/api/learn/lessons', {
                        headers: { 'x-auth-token': token }
                    });
                    // Just show some random ones as "Recommended Revision" for the POC if user has no history
                    setRevisionLessons(allRes.data.slice(0, 3));
                }
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch revision", err);
                setLoading(false);
            }
        };

        fetchRevision();
    }, []);

    const handleStartRevision = (lessonId) => {
        navigate('/learn', { state: { lessonId: lessonId, mode: 'revision' } });
    };

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="logo-section">
                    <div className="logo-circle">L</div>
                    <h1 className="brand-name">Linguable</h1>
                </div>
                <button
                    className="nav-item"
                    onClick={() => navigate('/dashboard')}
                >
                    <ArrowLeft size={20} /> <span>Back to Dashboard</span>
                </button>
            </aside>

            <main className="main-content">
                <header className="content-header">
                    <h2>Practice & Revision</h2>
                    <p>Strengthen your weak areas and review past lessons.</p>
                </header>

                <div className="practice-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

                    {/* Feature Card: Mistake Review */}
                    <div className="practice-card" style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '16px', border: '2px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div className="icon-bg" style={{ background: 'rgba(231, 76, 60, 0.1)', width: 'fit-content', padding: '10px', borderRadius: '12px', marginBottom: '15px' }}>
                                <AlertCircle color="#e74c3c" size={24} />
                            </div>
                            <h3>Mistake Review</h3>
                            <p style={{ color: 'var(--text-secondary)', margin: '10px 0' }}>You have made 0 mistakes recently. Keep it up!</p>
                            <button className="secondary-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>No Mistakes to Review</button>
                        </div>
                    </div>

                    {/* Dynamic Revision Cards */}
                    {loading ? <p>Loading suggestions...</p> : revisionLessons.map((lesson) => (
                        <div key={lesson._id} className="practice-card" style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '16px', borderLeft: '5px solid var(--brand-secondary)' }}>
                            <div className="icon-bg" style={{ background: 'rgba(52, 152, 219, 0.1)', width: 'fit-content', padding: '10px', borderRadius: '12px', marginBottom: '15px' }}>
                                <RefreshCw color="#3498db" size={24} />
                            </div>
                            <h4>{lesson.title}</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>Recommended for revision based on time elapsed.</p>
                            <button
                                className="start-btn-small"
                                onClick={() => handleStartRevision(lesson._id)}
                            >
                                Review Now
                            </button>
                        </div>
                    ))}

                    {/* Generic Practice Mode */}
                    <div className="practice-card" style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))', color: 'white', padding: '25px', borderRadius: '16px' }}>
                        <h3>Quick Practice</h3>
                        <p style={{ margin: '10px 0', opacity: 0.9 }}>5 minute rapid fire session to boost your memory.</p>
                        <button
                            style={{
                                background: 'white',
                                color: 'var(--brand-primary)',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '20px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                marginTop: '10px'
                            }}
                            onClick={() => {
                                // If we have lessons, pick first one for now
                                if (revisionLessons.length > 0) handleStartRevision(revisionLessons[0]._id);
                            }}
                        >
                            Start Session
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Practice;
