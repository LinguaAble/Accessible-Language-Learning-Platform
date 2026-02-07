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
  const { user } = useUser();
  const navigate = useNavigate();

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
            5 Day Streak
          </div>
          <button className="notif-btn" aria-label="Notifications">
            <Bell size={20} />
          </button>
          <div className="profile-avatar">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`}
              alt="User avatar"
            />
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
            <p className="hindi-text">आम वाक्यांश</p>
            <p style={{ opacity: 0.9, marginTop: '10px' }}>
              Master 10 essential greetings for daily conversation
            </p>
            <button className="start-btn" onClick={() => handleNavigation('/lessons')}>
              <PlayCircle size={22} />
              Continue Lesson
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
                <circle className="ring-fill" cx="40" cy="40" r="36" />
              </svg>
              <span className="percent" style={{ fontSize: '18px' }}>75%</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '8px 0 0 0' }}>15/20 min today</p>
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
          <div className="progress-card" style={{ padding: '20px', textAlign: 'center' }}>
            <Award size={32} color="var(--accent-color)" style={{ margin: '0 auto 10px' }} />
            <h4 style={{ margin: '5px 0', fontSize: '24px', fontWeight: 800 }}>47</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Words Learned</p>
          </div>
          <div className="progress-card" style={{ padding: '20px', textAlign: 'center' }}>
            <Target size={32} color="var(--accent-color)" style={{ margin: '0 auto 10px' }} />
            <h4 style={{ margin: '5px 0', fontSize: '24px', fontWeight: 800 }}>82%</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Accuracy</p>
          </div>
          <div className="progress-card" style={{ padding: '20px', textAlign: 'center' }}>
            <TrendingUp size={32} color="var(--accent-color)" style={{ margin: '0 auto 10px' }} />
            <h4 style={{ margin: '5px 0', fontSize: '24px', fontWeight: 800 }}>12</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lessons Completed</p>
          </div>
        </div>
      </section>

      {/* Activities */}
      <section style={{ marginTop: '30px' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>Practice Your Skills</h3>
        <div className="activities-grid">
          <div className="activity-item" onClick={() => handleNavigation('/lessons')}>
            <BookOpen size={32} color="var(--accent-color)" />
            <span style={{ display: 'block', marginTop: '10px' }}>Vocabulary</span>
          </div>
          <div className="activity-item" onClick={() => handleNavigation('/practice')}>
            <Zap size={32} color="var(--accent-color)" />
            <span style={{ display: 'block', marginTop: '10px' }}>Listening</span>
          </div>
          <div className="activity-item" onClick={() => handleNavigation('/lessons')}>
            <BookOpen size={32} color="var(--accent-color)" />
            <span style={{ display: 'block', marginTop: '10px' }}>Grammar</span>
          </div>
          <div className="activity-item" onClick={() => handleNavigation('/practice')}>
            <Target size={32} color="var(--accent-color)" />
            <span style={{ display: 'block', marginTop: '10px' }}>Speaking</span>
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
            {[
              { day: 'M', value: 40 },
              { day: 'T', value: 70 },
              { day: 'W', value: 45 },
              { day: 'T', value: 90 },
              { day: 'F', value: 65 },
              { day: 'S', value: 30 },
              { day: 'S', value: 80 }
            ].map((item, i) => (
              <div key={i} className="bar-wrapper">
                <div className="bar" style={{ height: `${item.value}%` }}></div>
                <span className="day-label">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const styles = {
  mainContent: {
    position: 'relative',
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '48px 64px',
    background: '#0f1419',
    fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
    lineHeight: 1.6,
    minHeight: '100vh',
  },
  bgPattern: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 0,
    opacity: 0.05,
    backgroundImage: 'radial-gradient(circle at 20% 30%, #ff6b35 0%, transparent 50%), radial-gradient(circle at 80% 70%, #4ecdc4 0%, transparent 50%)',
  },
  header: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '48px',
  },
  greetingWrapper: {
    flex: 1,
  },
  greetingMain: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '16px',
    marginBottom: '4px',
    flexWrap: 'wrap',
  },
  greetingHindi: {
    fontFamily: "'Lexend', sans-serif",
    fontSize: '18px',
    fontWeight: 500,
    color: '#ff6b35',
    letterSpacing: '0.3px',
  },
  greetingName: {
    fontFamily: "'Lexend', sans-serif",
    fontSize: '36px',
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.5px',
    lineHeight: 1.1,
    margin: 0,
  },
  greetingSubtitle: {
    fontSize: '15px',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: '4px',
  },
  headerMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  streakContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    padding: '12px 20px',
    borderRadius: '9999px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
  streakIconWrapper: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.2), rgba(255, 107, 53, 0.1))',
    borderRadius: '50%',
  },
  streakFlame: {
    color: '#ff6b35',
  },
  streakText: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.2,
  },
  streakCount: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#ffffff',
    fontFamily: "'Lexend', sans-serif",
  },
  streakLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  headerIconBtn: {
    position: 'relative',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
  notificationBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '8px',
    height: '8px',
    background: '#e09f3e',
    border: '2px solid rgba(255, 255, 255, 0.8)',
    borderRadius: '50%',
  },
  userAvatarWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid #e09f3e',
    boxShadow: '0 0 0 4px rgba(224, 159, 62, 0.1)',
  },
  userAvatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  dashboardLayout: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  focusSection: {
    marginBottom: '8px',
  },
  focusCard: {
    position: 'relative',
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '48px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
  focusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255, 107, 53, 0.15)',
    border: '1px solid rgba(255, 107, 53, 0.3)',
    padding: '8px 16px',
    borderRadius: '9999px',
    marginBottom: '24px',
  },
  pulseIndicator: {
    width: '6px',
    height: '6px',
    background: '#ff6b35',
    borderRadius: '50%',
  },
  focusBadgeText: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#ff6b35',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  focusContent: {
    position: 'relative',
    zIndex: 2,
    marginBottom: '32px',
    maxWidth: '600px',
  },
  focusLessonTitle: {
    fontFamily: "'Lexend', sans-serif",
    fontSize: '42px',
    fontWeight: 800,
    color: '#ffffff',
    lineHeight: 1.1,
    letterSpacing: '-1px',
    marginBottom: '8px',
  },
  focusLessonHindi: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#4ecdc4',
    marginBottom: '16px',
    letterSpacing: '0.3px',
  },
  focusLessonDesc: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 1.6,
    marginBottom: '24px',
  },
  focusProgressInfo: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  progressStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#6b7c8c',
  },
  focusCtaBtn: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '16px',
    padding: '18px 36px',
    background: '#ff6b35',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: "'Lexend', sans-serif",
    cursor: 'pointer',
    boxShadow: '0 8px 32px rgba(255, 107, 53, 0.4)',
    zIndex: 2,
  },
  focusDecoration: {
    position: 'absolute',
    bottom: '20px',
    right: '40px',
    pointerEvents: 'none',
  },
  statsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },
  statCard: {
    position: 'relative',
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
  statIconBox: {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '16px',
  },
  statIconPrimary: {
    background: 'rgba(74, 124, 111, 0.1)',
    color: '#4a7c6f',
  },
  statIconSuccess: {
    background: 'rgba(106, 153, 78, 0.1)',
    color: '#6a994e',
  },
  statIconAccent: {
    background: 'rgba(224, 159, 62, 0.1)',
    color: '#e09f3e',
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  statValue: {
    fontFamily: "'Lexend', sans-serif",
    fontSize: '28px',
    fontWeight: 800,
    color: '#ffffff',
    lineHeight: 1,
  },
  statUnit: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: '2px',
  },
  statProgressBar: {
    width: '100%',
    height: '4px',
    background: 'rgba(74, 124, 111, 0.1)',
    borderRadius: '9999px',
    overflow: 'hidden',
  },
  statProgressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #4a7c6f, #e09f3e)',
    borderRadius: '9999px',
  },
  modesSection: {
    marginTop: '8px',
  },
  sectionHeading: {
    fontFamily: "'Lexend', sans-serif",
    fontSize: '20px',
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: '24px',
    letterSpacing: '-0.3px',
  },
  modesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },
  modeCard: {
    position: 'relative',
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    cursor: 'pointer',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    textAlign: 'left',
  },
  modeIcon: {
    width: '56px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '16px',
  },
  modeText: {
    flex: 1,
  },
  modeTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: '4px',
  },
  modeDesc: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 1.4,
  },
  modeArrow: {
    color: 'rgba(255, 255, 255, 0.6)',
    alignSelf: 'flex-end',
  },
  bottomSection: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
  },
  chartCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '32px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  chartBarsContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '200px',
    gap: '8px',
  },
  chartBarWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBar: {
    position: 'relative',
    width: '100%',
    maxWidth: '40px',
    background: 'linear-gradient(180deg, #ff6b35, #e85a25)',
    borderRadius: '8px 8px 4px 4px',
    minHeight: '20px',
    boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
  },
  chartBarTooltip: {
    position: 'absolute',
    top: '-32px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '11px',
    fontWeight: 700,
    color: '#2c3e3d',
    background: 'rgba(255, 255, 255, 0.8)',
    padding: '4px 10px',
    borderRadius: '10px',
    border: '1px solid rgba(74, 124, 111, 0.15)',
    boxShadow: '0 1px 3px rgba(74, 124, 111, 0.08)',
    whiteSpace: 'nowrap',
    opacity: 0,
    pointerEvents: 'none',
  },
  chartBarLabel: {
    fontSize: '12px',
    fontWeight: 700,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  wordCard: {
    position: 'relative',
    background: 'linear-gradient(135deg, #ff6b35 0%, #e85a25 100%)',
    borderRadius: '24px',
    padding: '48px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(255, 107, 53, 0.4)',
  },
  wordLabel: {
    position: 'relative',
    zIndex: 1,
    fontSize: '11px',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '24px',
  },
  wordContent: {
    position: 'relative',
    zIndex: 1,
  },
  wordHindi: {
    fontFamily: "'Lexend', sans-serif",
    fontSize: '48px',
    fontWeight: 800,
    color: 'white',
    lineHeight: 1,
    marginBottom: '8px',
    textShadow: '0 2px 12px rgba(0,0,0,0.1)',
  },
  wordTranslation: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: '0.5px',
  },
};

export default Dashboard;