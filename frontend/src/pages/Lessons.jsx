import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, Lock, PlayCircle, ArrowLeft } from 'lucide-react';
import '../App.css'; // Using global styles for now, or create Lessons.css

const Lessons = () => {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/learn/lessons', {
                    headers: { 'x-auth-token': token }
                });
                setLessons(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch lessons", err);
                setLoading(false);
            }
        };

        fetchLessons();
    }, []);

    const handleLessonStart = (lesson) => {
        if (lesson.status === 'Locked') return;
        navigate('/learn', { state: { lessonId: lesson._id } });
    };

    return (
        <div className="dashboard-container"> {/* Reuse layout style */}
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
                    <h2>Your Learning Path</h2>
                    <p>Choose a lesson to start learning.</p>
                </header>

                <div className="lessons-grid">
                    {loading ? <p>Loading lessons...</p> : lessons.map((lesson) => (
                        <div
                            key={lesson._id}
                            className={`lesson-card ${lesson.status.toLowerCase()}`}
                            onClick={() => handleLessonStart(lesson)}
                            style={{
                                padding: '20px',
                                background: 'var(--card-bg)',
                                borderRadius: '16px',
                                border: '2px solid var(--border-color)',
                                cursor: lesson.status === 'Locked' ? 'not-allowed' : 'pointer',
                                opacity: lesson.status === 'Locked' ? 0.6 : 1,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className={`badge ${lesson.difficulty.toLowerCase()}`}>{lesson.difficulty}</span>
                                {lesson.status === 'Completed' && <CheckCircle color="#2ecc71" size={20} />}
                                {lesson.status === 'Locked' && <Lock color="#95a5a6" size={20} />}
                            </div>
                            <h3>{lesson.title}</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>{lesson.description}</p>
                            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '0.9em', color: 'var(--text-secondary)' }}>
                                <span>⏱ {lesson.estimatedTime}</span>
                                <span>{lesson.type}</span>
                            </div>
                            {lesson.status !== 'Locked' && (
                                <button className="start-btn-small" style={{ marginTop: '10px' }}>
                                    {lesson.status === 'Completed' ? 'Review' : 'Start'}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Lessons;
