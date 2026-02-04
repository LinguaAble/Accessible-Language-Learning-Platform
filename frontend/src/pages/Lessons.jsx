import React, { useState } from 'react';
import { Flame, Bell, PlayCircle, Lock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../Dashboard.css'; 

const Lessons = () => {
    const navigate = useNavigate();

    // --- HARDCODED DATA (Reordered: Alphabet First) ---
    const chapters = [
        {
            id: 1,
            title: "Chapter 1: The Basics",
            subtitle: "Hindi Varnamala (Script)",
            color: "#e67e22", // Orange
            lessons: [
                { id: 1, title: "Vowels (Swar) - Part 1", locked: false, completed: false },
                { id: 2, title: "Vowels (Swar) - Part 2", locked: true, completed: false },
                { id: 3, title: "Consonants (Vyanjan) - 1", locked: true, completed: false },
                { id: 4, title: "Consonants (Vyanjan) - 2", locked: true, completed: false },
                { id: 5, title: "Namaste! (Greetings)", locked: true, completed: false },
                { id: 6, title: "Introducing Yourself", locked: true, completed: false },
                { id: 7, title: "Yes & No (Haan/Nahi)", locked: true, completed: false },
                { id: 8, title: "Politeness Words", locked: true, completed: false },
                { id: 9, title: "Common Objects", locked: true, completed: false },
                { id: 10, title: "Review: The Basics", locked: true, completed: false }
            ]
        },
        {
            id: 2,
            title: "Chapter 2: My World",
            subtitle: "Family, Numbers & Colors",
            color: "#3498db", // Blue
            lessons: [
                { id: 11, title: "Numbers 1-10", locked: true },
                { id: 12, title: "Numbers 11-20", locked: true },
                { id: 13, title: "Family: Mom & Dad", locked: true },
                { id: 14, title: "Family: Siblings", locked: true },
                { id: 15, title: "Colors of Rainbow", locked: true },
                { id: 16, title: "Fruits & Veggies", locked: true },
                { id: 17, title: "Food & Drink", locked: true },
                { id: 18, title: "Days of the Week", locked: true },
                { id: 19, title: "Time of Day", locked: true },
                { id: 20, title: "Review: Daily Life", locked: true }
            ]
        },
        {
            id: 3,
            title: "Chapter 3: First Sentences",
            subtitle: "Grammar & Basic Verbs",
            color: "#9b59b6", // Purple
            lessons: [
                { id: 21, title: "Pronouns (I, You)", locked: true },
                { id: 22, title: "Verbs: Eat, Sleep, Go", locked: true },
                { id: 23, title: "I am... (Hoon)", locked: true },
                { id: 24, title: "You are... (Ho/Hain)", locked: true },
                { id: 25, title: "Asking: What?", locked: true },
                { id: 26, title: "Asking: Where?", locked: true },
                { id: 27, title: "Adjectives (Big/Small)", locked: true },
                { id: 28, title: "Possessives (My/Your)", locked: true },
                { id: 29, title: "Feelings (Happy/Sad)", locked: true },
                { id: 30, title: "Review: Sentences", locked: true }
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
                        <Flame size={18} fill="currentColor" /> 5 Day Streak
                    </div>
                    <button className="notif-btn"><Bell size={20} /></button>
                    <div className="profile-avatar">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun" alt="User" />
                    </div>
                </div>
            </header>

            {/* --- CHAPTER LIST --- */}
            <div className="chapters-scroll">
                {chapters.map((chapter) => (
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
                            {chapter.lessons.map((lesson) => (
                                <div 
                                    key={lesson.id} 
                                    className={`lesson-card ${lesson.locked ? 'locked' : ''} ${lesson.completed ? 'completed' : ''}`}
                                    onClick={() => !lesson.locked && navigate('/learn', { state: { lessonId: lesson.id } })}
                                >
                                    <div className="lesson-icon">
                                        {lesson.completed ? (
                                            <CheckCircle size={24} color="#2ecc71" />
                                        ) : lesson.locked ? (
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
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Lessons;