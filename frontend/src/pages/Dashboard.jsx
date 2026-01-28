import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Flame, PlayCircle, BarChart3, Bell
} from 'lucide-react';
import '../Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (

    <div className="main-content-scrollable">
      <header className="content-header">
        <div className="greeting">
          <h2>नमस्ते, Arjun! 👋</h2>
          <p>You're 15 minutes away from your daily goal.</p>
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
    </div>
  );
};

export default Dashboard;