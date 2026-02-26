import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { BookOpen, Flame, PlayCircle, BarChart3, Bell, TrendingUp, Settings, Trophy, ChevronRight } from 'lucide-react';
import '../Dashboard.css';

const Dashboard = () => {
  const { user, preferences, todayProgress } = useUser();
  const navigate = useNavigate();
  const [showProfileTooltip, setShowProfileTooltip] = useState(false);
  const [showNotificationTooltip, setShowNotificationTooltip] = useState(false);
  const [weeklyData, setWeeklyData] = useState([]);
  const [totalLessonsCompleted, setTotalLessonsCompleted] = useState(0);

  const getLatestProgress = () => {
    const stored = parseInt(localStorage.getItem('todayProgress'), 10) || 0;
    return Math.max(todayProgress, stored);
  };
  const [displayProgress, setDisplayProgress] = useState(getLatestProgress);
  useEffect(() => { setDisplayProgress(getLatestProgress()); }, [todayProgress]);
  useEffect(() => {
    const refresh = () => setDisplayProgress(getLatestProgress());
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => { document.removeEventListener('visibilitychange', refresh); window.removeEventListener('focus', refresh); };
  }, [todayProgress]);

  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const startOfWeek = (d) => { const x = new Date(d), day = x.getDay(); x.setDate(x.getDate() - day + (day === 0 ? -6 : 1)); return x; };

  useEffect(() => {
    const today = fmt(new Date());
    const sow = startOfWeek(new Date());
    const cl = (user.completedLessons?.length > 0) ? user.completedLessons : JSON.parse(localStorage.getItem('completedLessons') || '[]');
    setTotalLessonsCompleted(cl.length);
    const ds = user.dailyScores || [];
    setWeeklyData(['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
      const d = new Date(sow); d.setDate(sow.getDate() + i);
      const str = fmt(d);
      return { day, value: ds.find(e => e.date === str)?.score || 0, isToday: str === today };
    }));
    const t = setInterval(() => { if (fmt(new Date()) !== today) window.location.reload(); }, 60000);
    return () => clearInterval(t);
  }, [user.completedLessons, user.dailyScores]);

  useEffect(() => {
    if (!user.email) return;
    const ll = JSON.parse(localStorage.getItem('completedLessons') || '[]');
    axios.put('http://localhost:5000/api/auth/update-progress', { email: user.email, completedLessons: ll })
      .then(r => { if (r.data.success && r.data.completedLessons) localStorage.setItem('completedLessons', JSON.stringify(r.data.completedLessons)); })
      .catch(e => console.error('Sync failed', e));
  }, [user.email]);

  const name = user.username || (user.email ? user.email.split('@')[0].replace(/^./, c => c.toUpperCase()) : 'Learner');
  const maxVal = Math.max(...weeklyData.map(d => d.value), 1);
  const goalPct = Math.min(100, Math.round((displayProgress / preferences.dailyGoalMinutes) * 100));

  return (
    <div className="main-content db-root">

      {/* Header */}
      <header className="db-header">
        <div>
          <div className="db-namaste">नमस्ते,</div>
          <h1 className="db-name">{name} 👋</h1>
          <p className="db-subtitle">Ready to continue your Hindi journey?</p>
        </div>
        <div className="db-header-right">
          <div className="db-streak">
            <Flame size={15} fill="currentColor" />
            {totalLessonsCompleted > 0 ? 1 : 0} Day Streak
          </div>
          <div className="notification-container" onMouseEnter={() => setShowNotificationTooltip(true)} onMouseLeave={() => setShowNotificationTooltip(false)}>
            <button className="db-icon-btn" aria-label="Notifications" onClick={() => navigate('/settings')}><Bell size={18} /></button>
            {showNotificationTooltip && <div className="notification-tooltip"><div className="notification-tooltip-content"><Bell size={20} style={{ color: 'var(--text-muted)', opacity: 0.5 }} /><p>No notifications</p></div></div>}
          </div>
          <div className="profile-avatar-container" onMouseEnter={() => setShowProfileTooltip(true)} onMouseLeave={() => setShowProfileTooltip(false)}>
            <div className="profile-avatar" onClick={() => navigate('/settings')} style={{ cursor: 'pointer' }}>
              <img src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt="avatar" />
            </div>
            {showProfileTooltip && <div className="profile-tooltip">
              <div className="tooltip-header">
                <img src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt="avatar" className="tooltip-avatar" />
                <div className="tooltip-user-info"><h4>{name}</h4><p>{user.email || 'No email'}</p></div>
              </div>
              <div className="tooltip-divider" />
              <button className="tooltip-settings-btn" onClick={() => navigate('/settings')}>View Profile Settings</button>
            </div>}
          </div>
        </div>
      </header>

      {/* Top grid: Hero (left) + Stats (right) */}
      <div className="db-top-grid">
        {/* Hero */}
        <div className="db-hero">
          <span className="db-hero-badge">→ CONTINUE LEARNING</span>
          <h2 className="db-hero-title">Common Phrases</h2>
          <p className="db-hero-hindi">आम वाक्यांश</p>
          <p className="db-hero-desc">Master 10 essential greetings for daily conversation</p>
          <button className="db-start-btn" onClick={() => navigate('/lessons')}>
            <PlayCircle size={18} /> Start Now
          </button>
        </div>

        {/* Right: Daily Goal + Lessons stacked */}
        <div className="db-right-col">
          {/* Daily Goal */}
          <div className="db-goal-card">
            <div className="db-card-row">
              <span className="db-label">Daily Goal</span>
            </div>
            <div className="db-goal-body">
              <div className="progress-ring">
                <svg width="72" height="72">
                  <circle className="ring-bg" cx="36" cy="36" r="30" />
                  <circle className="ring-fill" cx="36" cy="36" r="30"
                    style={{ strokeDasharray: 188, strokeDashoffset: 188 - (188 * Math.min(1, displayProgress / preferences.dailyGoalMinutes)) }} />
                </svg>
                <span className="percent" style={{ fontSize: '0.9rem' }}>{goalPct}%</span>
              </div>
              <div>
                <p className="db-goal-status">
                  {goalPct >= 100 ? '🎉 Goal reached!' : goalPct >= 50 ? '🔥 Halfway!' : '💪 Keep going!'}
                </p>
                <p className="db-goal-hint">Target: {preferences.dailyGoalMinutes} min</p>
              </div>
            </div>
          </div>

          {/* Lessons */}
          <div className="db-lessons-card" onClick={() => navigate('/lessons')}>
            <TrendingUp size={24} color="var(--accent-color)" />
            <div>
              <div className="db-stat-num">{totalLessonsCompleted}</div>
              <div className="db-stat-label">Lessons Completed</div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
          </div>
        </div>
      </div>

      {/* Weekly chart */}
      <div className="db-card">
        <div className="db-card-row" style={{ marginBottom: '16px' }}>
          <h3 className="db-card-title">This Week</h3>
          <BarChart3 size={16} color="var(--text-muted)" />
        </div>
        <div className="weekly-chart">
          {weeklyData.map((item, i) => (
            <div key={i} className="bar-wrapper">
              <div className={`bar${item.isToday ? ' bar-today' : ''}`}
                style={{ height: `${Math.min(85, (item.value / Math.max(maxVal, 5)) * 85)}%` }}
                title={`Score: ${item.value}`}>
                {item.value > 0 && <span className="bar-score-label">{item.value}</span>}
              </div>
              <span className="day-label" style={{
                fontWeight: item.isToday ? 800 : 600,
                color: item.isToday ? 'var(--accent-color)' : 'var(--text-muted)'
              }}>{item.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="db-card-title" style={{ marginBottom: '12px' }}>Quick Actions</h3>
        <div className="db-actions">
          {[
            { label: 'Lessons', icon: BookOpen, path: '/lessons', color: '#e67e22' },
            { label: 'Leaderboard', icon: Trophy, path: '/leaderboard', color: '#9b59b6' },
            { label: 'Settings', icon: Settings, path: '/settings', color: '#27ae60' },
          ].map(({ label, icon: Icon, path, color }) => (
            <button key={label} className="db-action-btn" onClick={() => navigate(path)}>
              <div className="db-action-icon" style={{ background: `${color}18`, color }}><Icon size={20} /></div>
              <span className="db-action-label">{label}</span>
              <ChevronRight size={15} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
export default Dashboard;