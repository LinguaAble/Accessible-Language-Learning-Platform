import React, { useState } from 'react';
import { Flame, Bell, PlayCircle, Lock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../Dashboard.css';

const Lessons = () => {
    const navigate = useNavigate();
    const [completedLessons, setCompletedLessons] = useState([]);

    // Load progress from localStorage
    React.useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('completedLessons') || '[]');
        setCompletedLessons(stored);
    }, []);

    // --- CHAPTER DATA ---
    const chaptersData = [
        {
            id: 1,
            title: "Chapter 1: The Basics",
            subtitle: "Hindi Varnamala (Script)",
            color: "#e67e22", // Orange
            lessons: [
                { id: 1, title: "Vowels (Swar) - Part 1" },
                { id: 2, title: "Vowels (Swar) - Part 2" },
                { id: 3, title: "Consonants (Vyanjan) - 1" },
                { id: 4, title: "Consonants (Vyanjan) - 2" },
                { id: 5, title: "Namaste! (Greetings)" },
                { id: 6, title: "Introducing Yourself" },
                { id: 7, title: "Yes & No (Haan/Nahi)" },
                { id: 8, title: "Politeness Words" },
                { id: 9, title: "Common Objects" },
                { id: 10, title: "Review: The Basics" }
            ]
        },
        {
            id: 2,
            title: "Chapter 2: My World",
            subtitle: "Family, Numbers & Colors",
            color: "#3498db", // Blue
            lessons: [
                { id: 11, title: "Numbers 1-10" },
                { id: 12, title: "Numbers 11-20" },
                { id: 13, title: "Family: Mom & Dad" },
                { id: 14, title: "Family: Siblings" },
                { id: 15, title: "Colors of Rainbow" },
                { id: 16, title: "Fruits & Veggies" },
                { id: 17, title: "Food & Drink" },
                { id: 18, title: "Days of the Week" },
                { id: 19, title: "Time of Day" },
                { id: 20, title: "Review: Daily Life" }
            ]
        },
        {
            id: 3,
            title: "Chapter 3: First Sentences",
            subtitle: "Grammar & Basic Verbs",
            color: "#9b59b6", // Purple
            lessons: [
                { id: 21, title: "Pronouns (I, You)" },
                { id: 22, title: "Verbs: Eat, Sleep, Go" },
                { id: 23, title: "I am... (Hoon)" },
                { id: 24, title: "You are... (Ho/Hain)" },
                { id: 25, title: "Asking: What?" },
                { id: 26, title: "Asking: Where?" },
                { id: 27, title: "Adjectives (Big/Small)" },
                { id: 28, title: "Possessives (My/Your)" },
                { id: 29, title: "Feelings (Happy/Sad)" },
                { id: 30, title: "Review: Sentences" }
            ]
        }
    ];

    return (
        <div className="lessons-container">
            {/* --- HEADER --- */}
            <header className="content-header">
                <div className="greeting">
                    <h2>Lessons</h2>
                    <p>Explore new languages and skills.</p>
                </div>
                <div className="header-stats">
                    <div className="stat-pill streak">
                        <Flame size={18} fill="currentColor" /> {completedLessons.length > 0 ? '1' : '0'} Day Streak
                    </div>
                    <button className="notif-btn"><Bell size={20} /></button>
                    <div className="profile-avatar">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun" alt="User" />
                    </div>
                </div>
            </header>

            {/* --- CHAPTER LIST --- */}
            <div className="chapters-scroll">
                {chaptersData.map((chapter) => (
                    <div key={chapter.id} className="chapter-section">
                        {/* Chapter Title Bar */}
                        <div className="chapter-header" style={{ borderLeft: `5px solid ${chapter.color}` }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '20px' }}>{chapter.title}</h3>
                                <p style={{ margin: '5px 0 0', opacity: 0.7, fontSize: '14px' }}>{chapter.subtitle}</p>
                            </div>
                            <span className="chapter-badge">10 Lessons</span>
                        </div>

                        {/* Grid of Lessons */}
                        <div className="lessons-grid">
                            {chapter.lessons.map((lesson) => {
                                const isCompleted = completedLessons.includes(lesson.id);
                                // A lesson is unlocked if it's the first one OR the previous one is completed
                                const isLocked = lesson.id !== 1 && !completedLessons.includes(lesson.id - 1);

                                return (
                                    <div
                                        key={lesson.id}
                                        className={`lesson-card ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`}
                                        onClick={() => !isLocked && navigate('/learn', { state: { lessonId: lesson.id } })}
                                    >
                                        <div className="lesson-icon">
                                            {isCompleted ? (
                                                <CheckCircle size={24} color="#2ecc71" />
                                            ) : isLocked ? (
                                                <Lock size={24} color="#95a5a6" />
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