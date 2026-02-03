<<<<<<< HEAD
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Flame, PlayCircle, BarChart3, Bell
} from 'lucide-react';
import '../Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user] = useState(JSON.parse(localStorage.getItem('user')) || {});

  // Derive a display name from email (everything before @), capitalizing the first letter
  const getDisplayName = () => {
    if (!user.email) return "Learner";
    const namePart = user.email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  const displayName = getDisplayName();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (

    <div className="main-content-scrollable">
      <header className="content-header">
        <div className="greeting">
          <h2>नमस्ते, {displayName}! 👋</h2>
          <p>You're 15 minutes away from your daily goal.</p>
        </div>
        <div className="header-stats">
          <div className="stat-pill streak">
            <Flame size={18} fill="currentColor" /> 5 Day Streak
          </div>
          <button className="notif-btn"><Bell size={20} /></button>
          <div className="profile-avatar">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`} alt="User" />
          </div>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Main Focus Card */}
        <section className="focus-card">
          <div className="focus-info">
            <span className="badge">Current Lesson</span>
            <h3>Common Phrases <br /><span className="hindi-text">आम वाक्यांश</span></h3>
            <p>Master 10 essential greetings for daily conversation.</p>

            <button className="start-btn" onClick={() => handleNavigation('/learn')}>
              <PlayCircle size={24} /> CONTINUE LEARNING
            </button>
          </div>
          <div className="focus-visual">
            <div className="floating-shape"></div>
            <BookOpen size={100} strokeWidth={1} opacity={0.2} />
          </div>
        </section>

        {/* Quick Activities */}
        <section className="activities-grid">
          <div className="activity-item vocab" onClick={() => handleNavigation('/lessons')}><span>📖</span> Vocab</div>
          <div className="activity-item audio" onClick={() => handleNavigation('/practice')}><span>🎧</span> Audio</div>
          <div className="activity-item grammar" onClick={() => handleNavigation('/lessons')}><span>✍️</span> Grammar</div>
          <div className="activity-item chat" onClick={() => handleNavigation('/practice')}><span>💬</span> Speak</div>
        </section>

        {/* Progress Section */}
        <section className="progress-card">
          <div className="card-header">
            <h4>Learning Progress</h4>
            <BarChart3 size={18} />
          </div>
          <div className="weekly-chart">
            {[40, 70, 45, 90, 65, 30, 80].map((h, i) => (
              <div key={i} className="bar-wrapper">
                <div className="bar" style={{ height: `${h}%` }}></div>
                <span className="day-label">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Right Sidebar Elements */}
        <section className="stats-column">
          <div className="goal-circle-card">
            <h4>Daily Goal</h4>
            <div className="progress-ring">
              <svg width="120" height="120">
                <circle className="ring-bg" cx="60" cy="60" r="54" />
                <circle className="ring-fill" cx="60" cy="60" r="54" />
              </svg>
              <span className="percent">65%</span>
            </div>
            <p>15/20 min</p>
          </div>

          <div className="word-card">
            <span className="label">Word of the Day</span>
            <h4>दोस्त</h4>
            <p>(Dost) • Friend</p>
          </div>
        </section>
      </div>
=======
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard, BookOpen, Trophy, Settings, LogOut,
  Flame, PlayCircle, BarChart3, MessageSquare, Bell, Clock,
  Coffee, CheckCircle, AlertCircle, TrendingUp
} from 'lucide-react';
import './Dashboard.css';
import logo from '../assets/logo.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBreakReminder, setShowBreakReminder] = useState(false);
  const [studyTime, setStudyTime] = useState(0);
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const studyTimerRef = useRef(null);

  // Encouraging messages for ADHD learners
  const encouragingMessages = [
    "You're doing amazing! Every small step counts.",
    "Consistency is your superpower. Keep going!",
    "Your brain is learning, even when it feels hard.",
    "Progress, not perfection. You're on the right track!",
    "Small wins lead to big victories. Celebrate today!",
    "You showed up today. That's already a win!",
    "Learning takes time. Be patient with yourself.",
    "Your effort matters more than speed. Well done!",
    "Every mistake is a chance to grow stronger.",
    "You're building skills that will last forever."
  ];

  // Alert / Break Reminder Logic - User Story #8
  useEffect(() => {
    // Get random encouraging message on load
    const randomMsg = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
    setEncouragementMessage(randomMsg);

    // Initialize session start time
    const sessionStart = localStorage.getItem('sessionStart');
    if (!sessionStart) {
      localStorage.setItem('sessionStart', Date.now().toString());
    }

    // Check every minute for break reminder (20 minutes = ADHD-friendly Pomodoro)
    const interval = setInterval(() => {
      const startTime = parseInt(localStorage.getItem('sessionStart'));
      const currentTime = Date.now();
      const minutesStudied = Math.floor((currentTime - startTime) / 1000 / 60);

      setStudyTime(minutesStudied);

      // User Story #8: Show break reminder after 20 minutes
      if (minutesStudied >= 20 && !showBreakReminder) {
        setShowBreakReminder(true);

        // Optional: Browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Time for a Break! 🧘', {
            body: 'You\'ve been studying for 20 minutes. A short break will help you focus better.',
            icon: '/logo.png'
          });
        }
      }
    }, 60000); // Check every minute

    // Update study time display every second
    studyTimerRef.current = setInterval(() => {
      const startTime = parseInt(localStorage.getItem('sessionStart'));
      const currentTime = Date.now();
      const minutesStudied = Math.floor((currentTime - startTime) / 1000 / 60);
      setStudyTime(minutesStudied);
    }, 1000);

    return () => {
      clearInterval(interval);
      if (studyTimerRef.current) clearInterval(studyTimerRef.current);
    };
  }, [showBreakReminder]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }

        const [statsRes, nextLessonRes] = await Promise.all([
          axios.get('http://localhost:5000/api/learn/stats', { headers: { 'x-auth-token': token } }),
          axios.get('http://localhost:5000/api/learn/next-lesson', { headers: { 'x-auth-token': token } })
        ]);

        setStats(statsRes.data);
        setNextLesson(nextLessonRes.data);

        // Get user info from localStorage if available
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser({ name: "Learner" });
        }

        setLoading(false);
      } catch (err) {
        console.error("Dashboard fetch error", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionStart');
    sessionStorage.removeItem('token');
    navigate('/');
  };

  // User Story #2: Start Now button with default activity
  const startLesson = () => {
    // Reset session timer when starting a lesson
    localStorage.setItem('sessionStart', Date.now().toString());
    setShowBreakReminder(false);

    if (nextLesson && !nextLesson.completed) {
      navigate('/learn', { state: { lessonId: nextLesson._id } });
    } else {
      navigate('/lessons');
    }
  };

  // Handle break reminder dismissal
  const handleTakeBreak = () => {
    setShowBreakReminder(false);
    localStorage.setItem('sessionStart', Date.now().toString());
    setStudyTime(0);
  };

  const handleContinue = () => {
    setShowBreakReminder(false);
    localStorage.setItem('sessionStart', Date.now().toString());
    setStudyTime(0);
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-content">
        <BookOpen size={48} className="loading-icon" />
        <p>Loading your personalized dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* Break Reminder Modal - User Story #8 */}
      {showBreakReminder && (
        <div className="break-reminder-overlay">
          <div className="break-reminder-modal">
            <div className="break-icon">
              <Coffee size={48} color="#e67e22" />
            </div>
            <h2>Time for a Short Break! 🧘</h2>
            <p>You've been studying for 20 minutes. Taking a 5-minute break can help you stay focused and retain information better.</p>
            <div className="break-tips">
              <ul>
                <li>✨ Stretch your body</li>
                <li>💧 Drink some water</li>
                <li>👀 Look away from the screen</li>
                <li>🌬️ Take deep breaths</li>
              </ul>
            </div>
            <div className="break-actions">
              <button className="take-break-btn" onClick={handleTakeBreak}>
                Take a Break
              </button>
              <button className="continue-btn" onClick={handleContinue}>
                Continue Learning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-section">
          <img src={logo} alt="LinguaAble Logo" className="app-logo" />
          <h1 className="brand-name">Linguable</h1>
        </div>

        <nav className="side-nav">
          <button
            className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={() => handleNavigation('/dashboard')}
          >
            <LayoutDashboard size={20} /> <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${location.pathname === '/lessons' ? 'active' : ''}`}
            onClick={() => handleNavigation('/lessons')}
          >
            <BookOpen size={20} /> <span>Lessons</span>
          </button>

          <button
            className={`nav-item ${location.pathname === '/practice' ? 'active' : ''}`}
            onClick={() => handleNavigation('/practice')}
          >
            <MessageSquare size={20} /> <span>Practice</span>
          </button>

          <button
            className={`nav-item ${location.pathname === '/leaderboard' ? 'active' : ''}`}
            onClick={() => handleNavigation('/leaderboard')}
          >
            <Trophy size={20} /> <span>Leaderboard</span>
          </button>
        </nav>

        <div className="side-footer">
          <button
            className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
            onClick={() => handleNavigation('/settings')}
          >
            <Settings size={20} /> <span>Settings</span>
          </button>

          <button className="nav-item logout" onClick={handleLogout}>
            <LogOut size={20} /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="content-header">
          <div className="greeting">
            <h2>Namaste! 👋</h2>
            <p>Ready to continue your learning journey?</p>
            {studyTime > 0 && (
              <div className="study-timer">
                <Clock size={16} />
                <span>Today's session: {studyTime} minutes</span>
              </div>
            )}
          </div>
          <div className="header-stats">
            <div className="stat-pill streak">
              <Flame size={18} fill="currentColor" /> {stats?.streak || 0} Day Streak
            </div>
            <button className="notif-btn" onClick={() => handleNavigation('/notifications')}>
              <Bell size={20} />
            </button>
            <div className="profile-avatar">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
            </div>
          </div>
        </header>

        <div className="dashboard-grid">
          {/* User Story #1, #2, #3, #10: Next Recommended Lesson Card */}
          <section className="focus-card">
            <div className="focus-info">
              <span className="badge">Next Recommended Lesson</span>
              {nextLesson && !nextLesson.completed ? (
                <>
                  <h3>{nextLesson.title}</h3>
                  <p>{nextLesson.description}</p>
                  <div className="lesson-meta">
                    {/* User Story #10: Show estimated time */}
                    <span className="time-estimate">
                      <Clock size={16} /> {nextLesson.estimatedTime}
                    </span>
                    <span className="difficulty-badge">{nextLesson.difficulty}</span>
                    {/* User Story #3: Show it's a short, focused lesson */}
                    {parseInt(nextLesson.estimatedTime) <= 15 && (
                      <span className="short-lesson-badge">⚡ Quick Lesson</span>
                    )}
                  </div>
                  {/* User Story #2: Prominent Start Now button */}
                  <button className="start-btn" onClick={startLesson}>
                    <PlayCircle size={24} /> START NOW
                  </button>
                </>
              ) : (
                <>
                  <h3>All caught up! 🎉</h3>
                  <p>You've completed all available lessons. Great work!</p>
                  <button className="start-btn" onClick={() => navigate('/lessons')}>
                    Review Lessons
                  </button>
                </>
              )}
            </div>
            <div className="focus-visual">
              <div className="floating-shape"></div>
              <BookOpen size={100} strokeWidth={1} opacity={0.2} />
            </div>
          </section>

          {/* Quick Activities */}
          <section className="activities-grid">
            <div className="activity-item vocab" onClick={() => handleNavigation('/lessons')}>
              <span>📖</span> Vocab
            </div>
            <div className="activity-item audio" onClick={() => handleNavigation('/practice')}>
              <span>🎧</span> Audio
            </div>
            <div className="activity-item grammar" onClick={() => handleNavigation('/lessons')}>
              <span>✍️</span> Grammar
            </div>
            <div className="activity-item chat" onClick={() => handleNavigation('/practice')}>
              <span>💬</span> Speak
            </div>
          </section>

          {/* User Story #4: Learning Path Display */}
          <section className="learning-path-card">
            <div className="card-header">
              <h4>Your Learning Path</h4>
              <TrendingUp size={18} />
            </div>
            <div className="path-steps">
              {stats && stats.completedLessons >= 0 && (
                <>
                  <div className={`path-step ${stats.completedLessons >= 1 ? 'completed' : 'active'}`}>
                    <div className="step-icon">
                      {stats.completedLessons >= 1 ? <CheckCircle size={20} /> : <span>1</span>}
                    </div>
                    <div className="step-info">
                      <h5>Basic Greetings</h5>
                      <p>Learn essential Hindi greetings</p>
                    </div>
                  </div>
                  <div className={`path-step ${stats.completedLessons >= 3 ? 'completed' : stats.completedLessons >= 1 ? 'active' : 'locked'}`}>
                    <div className="step-icon">
                      {stats.completedLessons >= 3 ? <CheckCircle size={20} /> : <span>2</span>}
                    </div>
                    <div className="step-info">
                      <h5>Numbers & Colors</h5>
                      <p>Count and describe in Hindi</p>
                    </div>
                  </div>
                  <div className={`path-step ${stats.completedLessons >= 5 ? 'completed' : stats.completedLessons >= 3 ? 'active' : 'locked'}`}>
                    <div className="step-icon">
                      {stats.completedLessons >= 5 ? <CheckCircle size={20} /> : <span>3</span>}
                    </div>
                    <div className="step-info">
                      <h5>Daily Conversations</h5>
                      <p>Practice real-life dialogues</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* User Story #7: Weekly Progress - Small Achievable Goals */}
          <section className="progress-card">
            <div className="card-header">
              <h4>This Week's Progress</h4>
              <BarChart3 size={18} />
            </div>
            {/* User Story #7: Show daily micro-goals */}
            <div className="daily-goal">
              <p>Today's Goal: Complete 1 lesson</p>
              <div className="goal-progress-bar">
                <div
                  className="goal-progress-fill"
                  style={{ width: `${stats?.todayProgress || 0}%` }}
                ></div>
              </div>
              <span className="goal-status">
                {stats?.todayProgress >= 100 ? '✅ Goal achieved!' : `${stats?.todayProgress || 0}% complete`}
              </span>
            </div>
            {stats && stats.weeklyData && (
              <div className="weekly-chart">
                {stats.weeklyData.map((d, i) => (
                  <div key={i} className="bar-wrapper">
                    <div
                      className="bar"
                      style={{ height: `${Math.min((d.minutes / 30) * 100, 100)}%` }}
                    ></div>
                    <span className="day-label">{d.day}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Right Sidebar - Stats & Encouragement */}
          <section className="stats-column">
            {/* User Story #5: Skills Mastery with Adaptive Difficulty */}
            <div className="goal-circle-card">
              <h4>Skills Mastery</h4>
              <p className="mastery-subtitle">Your progress adapts to your pace</p>
              {stats && stats.skills && (
                <div className="skills-list">
                  {Object.entries(stats.skills).map(([skill, score]) => (
                    <div key={skill} className="skill-item">
                      <div className="skill-header">
                        <span className="skill-name">{skill}</span>
                        <span className="skill-score">{score}%</span>
                      </div>
                      <div className="skill-bar-bg">
                        <div
                          className="skill-bar-fill"
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                      {/* User Story #5: Show difficulty level */}
                      <span className="skill-difficulty">
                        {score < 40 ? '🟢 Beginner' : score < 70 ? '🟡 Intermediate' : '🔴 Advanced'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User Story #6: Revision Recommendations */}
            {stats && stats.mistakeCount > 0 && (
              <div className="revision-card">
                <div className="revision-header">
                  <AlertCircle size={20} color="#e67e22" />
                  <h4>Recommended Revision</h4>
                </div>
                <p>You have {stats.mistakeCount} topics that need review</p>
                <button
                  className="revision-btn"
                  onClick={() => navigate('/practice')}
                >
                  Review Mistakes
                </button>
              </div>
            )}

            {/* User Story #9: Encouraging Messages */}
            <div className="encouragement-card">
              <span className="label">Daily Encouragement</span>
              <h4>Keep Going! 💪</h4>
              <p className="encouragement-text">{encouragementMessage}</p>
              <div className="encouragement-icon">✨</div>
            </div>
          </section>
        </div>
      </main>
>>>>>>> 6320a95 (added dashboard)
    </div>
  );
};

export default Dashboard;