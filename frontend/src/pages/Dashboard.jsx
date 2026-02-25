import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import {
  BookOpen, Flame, PlayCircle, BarChart3, Bell, Award, Target, TrendingUp,
  Zap, ChevronRight, Star, Clock
} from 'lucide-react';
import '../Dashboard.css';

const Dashboard = () => {
  const { user, preferences, todayProgress } = useUser();
  const navigate = useNavigate();
  const [showProfileTooltip, setShowProfileTooltip] = useState(false);
  const [showNotificationTooltip, setShowNotificationTooltip] = useState(false);
  const [weeklyData, setWeeklyData] = useState([]);
  const [totalLessonsCompleted, setTotalLessonsCompleted] = useState(0);

  // Helper function to get start of week (Monday)
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when Sunday
    return new Date(d.setDate(diff));
  };

  // Helper function to format date as YYYY-MM-DD (Local Time)
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initialize or update chart data from backend
  useEffect(() => {
    const today = formatDate(new Date());
    const now = new Date();

    // Get current week info
    const startOfWeek = getStartOfWeek(now);

    // Get total completed lessons
    const completedLessons = (user.completedLessons && user.completedLessons.length > 0)
      ? user.completedLessons
      : JSON.parse(localStorage.getItem('completedLessons') || '[]');

    setTotalLessonsCompleted(completedLessons.length);

    // Build weekly data for chart using Backend Data
    const buildWeeklyData = () => {
      const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
      const data = [];
      const dailyScores = user.dailyScores || [];

      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + i);
        const dateStr = formatDate(currentDate);

        // Find accumulated score for this date
        const entry = dailyScores.find(e => e.date === dateStr);
        const dayScore = entry ? entry.score : 0;

        data.push({
          day: days[i],
          value: dayScore,
          date: dateStr,
          isToday: dateStr === today
        });
      }

      return data;
    };
    setWeeklyData(buildWeeklyData());

    // Set up an interval to refresh the chart every minute (in case day changes)
    const interval = setInterval(() => {
      const newToday = formatDate(new Date());
      if (newToday !== today) {
        console.log('📅 Day changed, refreshing...');
        window.location.reload();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);

  }, [user.completedLessons, user.dailyScores]);

  // Sync progress with backend
  useEffect(() => {
    if (user.email) {
      const localLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
      axios.put('http://localhost:5000/api/auth/update-progress', {
        email: user.email,
        completedLessons: localLessons
      }).then(res => {
        if (res.data.success && res.data.completedLessons) {
          localStorage.setItem('completedLessons', JSON.stringify(res.data.completedLessons));
          console.log("Progress synced:", res.data.completedLessons);
        }
      }).catch(err => console.error("Sync failed", err));
    }
  }, [user.email]);

  const getDisplayName = () => {
    if (user.username) return user.username;
    if (!user.email) return "Learner";
    const namePart = user.email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  const displayName = getDisplayName();

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Calculate max value for chart scaling
  const maxValue = Math.max(...weeklyData.map(d => d.value), 1);

  return (
    <div className="main-content">
      {/* Header */}
      <header className="content-header">
        <div className="greeting">
          <span className="hindi-text" style={{ fontSize: '18px', fontWeight: 500 }}>नमस्ते</span>
          <h2>{displayName}</h2>
          <p>You're doing amazing — keep the momentum going!</p>
        </div>

        <div className="header-stats">
          <div className="stat-pill streak">
            <Flame size={18} fill="currentColor" />
            {totalLessonsCompleted > 0 ? '1' : '0'} Day Streak
          </div>
          <div
            className="notification-container"
            onMouseEnter={() => setShowNotificationTooltip(true)}
            onMouseLeave={() => setShowNotificationTooltip(false)}
            style={{ position: 'relative' }}
          >
            <button
              className="notif-btn"
              aria-label="Notifications"
              onClick={() => navigate('/settings')}
              style={{ cursor: 'pointer' }}
            >
              <Bell size={20} />
            </button>

            {showNotificationTooltip && (
              <div className="notification-tooltip">
                <div className="notification-tooltip-content">
                  <Bell size={24} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                  <p>No notifications</p>
                </div>
              </div>
            )}
          </div>
          <div
            className="profile-avatar-container"
            onMouseEnter={() => setShowProfileTooltip(true)}
            onMouseLeave={() => setShowProfileTooltip(false)}
            style={{ position: 'relative' }}
          >
            <div
              className="profile-avatar"
              onClick={() => navigate('/settings')}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`}
                alt="User avatar"
              />
            </div>

            {showProfileTooltip && (
              <div className="profile-tooltip">
                <div className="tooltip-header">
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`}
                    alt="User avatar"
                    className="tooltip-avatar"
                  />
                  <div className="tooltip-user-info">
                    <h4>{displayName}</h4>
                    <p>{user.email || 'No email provided'}</p>
                  </div>
                </div>
                <div className="tooltip-divider"></div>
                <div className="tooltip-stats">
                  <div className="tooltip-stat">
                    <Flame size={16} fill="currentColor" style={{ color: 'var(--accent-color)' }} />
                    <span>{totalLessonsCompleted > 0 ? '1' : '0'} Day Streak</span>
                  </div>
                  <div className="tooltip-stat">
                    <Award size={16} style={{ color: 'var(--accent-color)' }} />
                    <span>47 Words Learned</span>
                  </div>
                  <div className="tooltip-stat">
                    <Target size={16} style={{ color: 'var(--accent-color)' }} />
                    <span>82% Accuracy</span>
                  </div>
                </div>
                <button
                  className="tooltip-settings-btn"
                  onClick={() => navigate('/settings')}
                >
                  View Profile Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Focus Card */}
        <div className="focus-card">
          <div className="focus-info">
            <span className="badge">→ CONTINUE LEARNING</span>
            <h3>Common Phrases</h3>
            <p className="hindi-text" style={{ fontSize: '18px', fontWeight: 600 }}>आम वाक्यांश</p>
            <p style={{ opacity: 0.9, marginTop: '10px' }}>
              Master 10 essential greetings for daily conversation
            </p>
            <button className="start-btn" onClick={() => handleNavigation('/lessons')}>
              <PlayCircle size={22} />
              START NOW
            </button>
          </div>
        </div>

        {/* Stats Column */}
        <div className="stats-column">
          {/* Daily Goal */}
          <div className="goal-circle-card">
            <h4 style={{ fontSize: '16px', margin: '0 0 8px 0' }}>Daily Goal</h4>
            <div className="progress-ring">
              <svg width="80" height="80">
                <circle className="ring-bg" cx="40" cy="40" r="36" />
                <circle
                  className="ring-fill"
                  cx="40"
                  cy="40"
                  r="36"
                  style={{
                    strokeDashoffset: 226 - (226 * Math.min(1, todayProgress / preferences.dailyGoalMinutes))
                  }}
                />
              </svg>
              <span className="percent" style={{ fontSize: '18px' }}>{Math.min(100, Math.round((todayProgress / preferences.dailyGoalMinutes) * 100))}%</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '8px 0 0 0' }}>{todayProgress}/{preferences.dailyGoalMinutes} min today</p>
          </div>

          {/* Word of Day */}
          <div className="word-card">
            <span className="label" style={{ fontSize: '11px' }}>Word of the Day</span>
            <h4 style={{ fontSize: '28px', margin: '8px 0' }}>दोस्त</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>Dost · Friend</p>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <section style={{ marginTop: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div
            className="progress-card"
            style={{ padding: '20px', textAlign: 'center', cursor: 'pointer' }}
            onClick={() => navigate('/lessons')}
          >
            <Award size={32} color="var(--accent-color)" style={{ margin: '0 auto 10px' }} />
            <h4 style={{ margin: '5px 0', fontSize: '24px', fontWeight: 800 }}>47</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Words Learned</p>
          </div>
          <div
            className="progress-card"
            style={{ padding: '20px', textAlign: 'center', cursor: 'pointer' }}
            onClick={() => navigate('/practice')}
          >
            <Target size={32} color="var(--accent-color)" style={{ margin: '0 auto 10px' }} />
            <h4 style={{ margin: '5px 0', fontSize: '24px', fontWeight: 800 }}>82%</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Accuracy</p>
          </div>
          <div
            className="progress-card"
            style={{ padding: '20px', textAlign: 'center', cursor: 'pointer' }}
            onClick={() => navigate('/lessons')}
          >
            <TrendingUp size={32} color="var(--accent-color)" style={{ margin: '0 auto 10px' }} />
            <h4 style={{ margin: '5px 0', fontSize: '24px', fontWeight: 800 }}>{totalLessonsCompleted}</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lessons Completed</p>
          </div>
        </div>
      </section>

      {/* Weekly Progress */}
      <section style={{ marginTop: '30px' }}>
        <div className="progress-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>This Week</h3>
            <BarChart3 size={18} color="var(--text-muted)" />
          </div>
          <div className="weekly-chart">
            {weeklyData.map((item, i) => (
              <div key={i} className="bar-wrapper">
                <div
                  className="bar"
                  style={{
                    height: `${(item.value / Math.max(maxValue, 5)) * 100}%`,
                    opacity: item.isToday ? 1 : 0.7,
                    position: 'relative',
                    boxShadow: item.isToday ? '0 0 10px rgba(230, 126, 34, 0.5)' : '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                  title={`${item.date}: Score ${item.value}`}
                >
                  {item.value > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: 'var(--accent-color)'
                    }}>
                      {item.value}
                    </span>
                  )}
                </div>
                <span className="day-label" style={{ fontWeight: item.isToday ? 800 : 700, color: item.isToday ? 'var(--accent-color)' : 'var(--text-muted)' }}>
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section style={{ marginTop: '30px' }}>
        <h3 style={{ marginBottom: '20px' }}>Quick Actions</h3>
        <div className="activities-grid">
          <div className="activity-item" onClick={() => handleNavigation('/lessons')}>
            <BookOpen size={32} color="var(--accent-color)" style={{ margin: '0 auto 10px' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Learn</p>
          </div>
          <div className="activity-item" onClick={() => handleNavigation('/practice')}>
            <Zap size={32} color="var(--accent-color)" style={{ margin: '0 auto 10px' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Practice</p>
          </div>
          <div className="activity-item" onClick={() => handleNavigation('/leaderboard')}>
            <Star size={32} color="var(--accent-color)" style={{ margin: '0 auto 10px' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Leaderboard</p>
          </div>
          <div className="activity-item" onClick={() => handleNavigation('/settings')}>
            <Clock size={32} color="var(--accent-color)" style={{ margin: '0 auto 10px' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Settings</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;