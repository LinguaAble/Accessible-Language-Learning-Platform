import React, { useState, useEffect } from 'react';
import { ArrowLeft, Flame, Bell, PlayCircle, Lock, CheckCircle, RotateCcw, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationBell from '../components/NotificationBell';
import '../Dashboard.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Lessons = () => {
    const { user, streak } = useUser();
    const navigate = useNavigate();

    // Sync completedLessons from context AND localStorage for instant updates.
    // localStorage acts as fallback when context hasn't propagated yet (navigation transitions).
    const [localCompleted, setLocalCompleted] = useState(() => {
        try { return JSON.parse(localStorage.getItem('completedLessons') || '[]'); }
        catch { return []; }
    });

    // Re-sync whenever user context updates
    useEffect(() => {
        if (user?.completedLessons && user.completedLessons.length > 0) {
            setLocalCompleted(user.completedLessons);
        } else {
            // Fallback: read from localStorage in case context is stale
            try {
                const ls = JSON.parse(localStorage.getItem('completedLessons') || '[]');
                if (ls.length > 0) setLocalCompleted(ls);
            } catch { /* ignore */ }
        }
    }, [user?.completedLessons]);

    const completedLessons = localCompleted;
    const [showProfileTooltip, setShowProfileTooltip] = useState(false);
    const [showNotificationTooltip, setShowNotificationTooltip] = useState(false);

    const name = user?.username || (user?.email ? user.email.split('@')[0].replace(/^./, c => c.toUpperCase()) : 'Learner');

    // --- CURRICULUM DATA ---
    const chaptersData = [
        {
            id: 1,
            title: "Chapter 1: Mastering the Script",
            subtitle: "Hindi Varnamala (Vowels & Consonants)",
            color: "#e67e22", // Orange
            lessons: [
                { id: 1, title: "Vowels (Swar) - Part 1" },
                { id: 2, title: "Vowels (Swar) - Part 2" },
                { id: 3, title: "Review: All Vowels", isRecap: true }, // Recap
                { id: 4, title: "Consonants: K & Ch Series" },
                { id: 5, title: "Consonants: T & Th Series" },
                { id: 6, title: "Consonants: D & N Series" },
                { id: 7, title: "Consonants: P & Y Series" },
                { id: 8, title: "Consonants: R & Sh Series" },
                { id: 9, title: "Consonants: S & Conjuncts" },
                { id: 10, title: "Grand Review: The Script", isRecap: true }, // Grand Recap
                // New Lessons
                { id: 11, title: "Recap: Vowels & Consonants Mixed", isRecap: true },
                { id: 12, title: "Recap: Rapid Fire Script", isRecap: true },
                { id: 13, title: "Pronunciation: Basic Vowels", isPronunciation: true },
                { id: 14, title: "Pronunciation: Tricky Consonants", isPronunciation: true },
                { id: 15, title: "Pronunciation: Script Review", isPronunciation: true }
            ]
        },
        {
            id: 2,
            title: "Chapter 2: My World",
            subtitle: "Family, Numbers & Colors",
            color: "#3498db", // Blue
            lessons: [
                { id: 16, title: "Common Words" },
                { id: 17, title: "Numbers 1-5" },
                { id: 18, title: "Numbers 6-10" },
                { id: 19, title: "Recap: Numbers", isRecap: true },
                { id: 20, title: "Family: Parents" },
                { id: 21, title: "Family: Siblings" },
                { id: 22, title: "Colors: Part 1" },
                { id: 23, title: "Colors: Part 2" },
                { id: 24, title: "Food & Drink: Part 1" },
                { id: 25, title: "Food & Drink: Part 2" },
                { id: 26, title: "Fruits" },
                { id: 27, title: "Recap: Vocabulary (5-11)", isRecap: true },
                { id: 28, title: "Pronunciation: Common Words", isPronunciation: true },
                { id: 29, title: "Pronunciation: Numbers & Family", isPronunciation: true },
                { id: 30, title: "Pronunciation: Colors & Food", isPronunciation: true }
            ]
        },
        {
            id: 3,
            title: "Chapter 3: First Sentences",
            subtitle: "Grammar & Basic Verbs",
            color: "#9b59b6", // Purple
            lessons: [
                { id: 31, title: "Pronouns: I & You" },
                { id: 32, title: "Pronouns: He, She & We" },
                { id: 33, title: "Verbs: Eat & Drink" },
                { id: 34, title: "Verbs: Go & Come" },
                { id: 35, title: "Verbs: Sleep & Wake" },
                { id: 36, title: "I am / You are" },
                { id: 37, title: "He/She is & We are" },
                { id: 38, title: "Simple Sentences" },
                { id: 39, title: "Questions: What & Where" },
                { id: 40, title: "Recap: Grammar Mix", isRecap: true },
                { id: 41, title: "Adjectives: Size" },
                { id: 42, title: "Adjectives: Feelings" },
                { id: 43, title: "Pronunciation: Pronouns & Verbs", isPronunciation: true },
                { id: 44, title: "Pronunciation: Sentences", isPronunciation: true },
                { id: 45, title: "Pronunciation: Questions & Adjectives", isPronunciation: true }
            ]
        },
        {
            id: 4,
            title: "Chapter 4: Everyday Conversations",
            subtitle: "Greetings & Daily Interaction",
            color: "#27ae60", // Green
            lessons: [
                { id: 46, title: "Greetings: Hello & Goodbye" },
                { id: 47, title: "Introducing Yourself" },
                { id: 48, title: "Asking Someone’s Name" },
                { id: 49, title: "Saying Thank You & Sorry" },
                { id: 50, title: "Yes / No Responses" },
                { id: 51, title: "Polite Expressions" },
                { id: 52, title: "Asking “How are you?”" },
                { id: 53, title: "Talking About Yourself" },
                { id: 54, title: "Talking About Friends" },
                { id: 55, title: "Asking Simple Questions" },
                { id: 56, title: "Everyday Phrases" },
                { id: 57, title: "Small Conversation Practice" },
                { id: 58, title: "Listening Practice: Greetings", isRecap: true },
                { id: 59, title: "Speaking Practice: Introductions", isPronunciation: true },
                { id: 60, title: "Conversation Review", isRecap: true }
            ]
        },
        {
            id: 5,
            title: "Chapter 5: Daily Life",
            subtitle: "Activities & Routines",
            color: "#f1c40f", // Yellow
            lessons: [
                { id: 61, title: "Daily Routine Vocabulary" },
                { id: 62, title: "Talking About Morning Activities" },
                { id: 63, title: "Talking About Work / Study" },
                { id: 64, title: "Talking About Food & Meals" },
                { id: 65, title: "Talking About Time" },
                { id: 66, title: "Talking About Places" },
                { id: 67, title: "Talking About Hobbies" },
                { id: 68, title: "Talking About Weather" },
                { id: 69, title: "Talking About Family Activities" },
                { id: 70, title: "Asking About Plans" },
                { id: 71, title: "Describing Your Day" },
                { id: 72, title: "Listening Practice: Daily Life", isRecap: true },
                { id: 73, title: "Speaking Practice: Daily Routine", isPronunciation: true },
                { id: 74, title: "Conversation Practice: Activities", isPronunciation: true },
                { id: 75, title: "Daily Life Review", isRecap: true }
            ]
        },
        {
            id: 6,
            title: "Chapter 6: Real World Communication",
            subtitle: "Situations & Practical Use",
            color: "#e74c3c", // Red
            lessons: [
                { id: 76, title: "Asking for Directions" },
                { id: 77, title: "Shopping Conversation" },
                { id: 78, title: "Ordering Food" },
                { id: 79, title: "Asking for Help" },
                { id: 80, title: "Talking at the Market" },
                { id: 81, title: "Talking at a Restaurant" },
                { id: 82, title: "Talking at the Bus / Train Station" },
                { id: 83, title: "Talking on the Phone" },
                { id: 84, title: "Talking About Preferences" },
                { id: 85, title: "Making Simple Requests" },
                { id: 86, title: "Expressing Opinions" },
                { id: 87, title: "Listening Practice: Real Situations", isRecap: true },
                { id: 88, title: "Speaking Practice: Role Play", isPronunciation: true },
                { id: 89, title: "Real-Life Conversation Practice", isPronunciation: true },
                { id: 90, title: "Final Communication Review", isRecap: true }
            ]
        }
    ];

    return (
        <div className="lessons-container">
            <header className="content-header">
                <div className="greeting">
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '8px', cursor: 'pointer', padding: 0 }}
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                    <h2>Lessons</h2>
                    <p>Master the Hindi alphabet and basic conversation.</p>
                </div>
                <div className="db-header-right">
                    <div className="db-streak">
                        <Flame size={15} fill="currentColor" />
                        {streak} Day{streak !== 1 ? 's' : ''} Streak
                    </div>
                    <div className="notification-container" onMouseEnter={() => setShowNotificationTooltip(true)} onMouseLeave={() => setShowNotificationTooltip(false)}>
                        <NotificationBell btnClassName="db-icon-btn" />
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

            <div className="chapters-scroll">
                {chaptersData.map((chapter) => (
                    <div key={chapter.id} className="chapter-section">
                        <div className="chapter-header" style={{ borderLeft: `5px solid ${chapter.color}` }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{chapter.title}</h3>
                                <p style={{ margin: '5px 0 0', opacity: 0.7, fontSize: '0.875rem' }}>{chapter.subtitle}</p>
                            </div>
                            <span className="chapter-badge">{chapter.lessons.length} Lessons</span>
                        </div>

                        <div className="lessons-grid">
                            {chapter.lessons.map((lesson) => {
                                const isCompleted = completedLessons.includes(lesson.id);
                                const isLocked = lesson.id !== 1 && !completedLessons.includes(lesson.id - 1);

                                return (
                                    <div
                                        key={lesson.id}
                                        className={`lesson-card ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`}
                                        onClick={() => !isLocked && navigate(`/learn?id=${lesson.id}`)}
                                    >
                                        <div className="lesson-icon">
                                            {isCompleted ? (
                                                <CheckCircle size={24} color="#2ecc71" />
                                            ) : isLocked ? (
                                                <Lock size={24} color="#95a5a6" />
                                            ) : lesson.isRecap ? (
                                                <RotateCcw size={24} color={chapter.color} />
                                            ) : lesson.isPronunciation ? (
                                                <Volume2 size={24} color={chapter.color} />
                                            ) : (
                                                <PlayCircle size={24} color={chapter.color} />
                                            )}
                                        </div>
                                        <div className="lesson-info">
                                            <span className="lesson-num">Lesson {lesson.id}</span>
                                            <h4 className="lesson-title">{lesson.title}</h4>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Lessons;