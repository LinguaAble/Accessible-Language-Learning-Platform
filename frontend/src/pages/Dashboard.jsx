import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import {
  BookOpen, Flame, PlayCircle, BarChart3, Bell, Award, Target, TrendingUp,
  Zap, ChevronRight, Star, Clock
} from 'lucide-react';

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
    <div style={styles.mainContent}>
      <div style={styles.bgPattern}></div>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.greetingWrapper}>
          <div style={styles.greetingMain}>
            <span style={styles.greetingHindi}>नमस्ते</span>
            <h1 style={styles.greetingName}>{displayName}</h1>
          </div>
          <p style={styles.greetingSubtitle}>You're doing amazing — keep the momentum going!</p>
        </div>

        <div style={styles.headerMeta}>
          <div style={styles.streakContainer}>
            <div style={styles.streakIconWrapper}>
              <Flame style={styles.streakFlame} size={20} />
            </div>
            <div style={styles.streakText}>
              <span style={styles.streakCount}>5</span>
              <span style={styles.streakLabel}>day streak</span>
            </div>
          </div>

          <button style={styles.headerIconBtn} aria-label="Notifications">
            <Bell size={20} />
            <span style={styles.notificationBadge}></span>
          </button>

          <div style={styles.userAvatarWrapper}>
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`}
              alt="User avatar"
              style={styles.userAvatarImg}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.dashboardLayout}>

        {/* Primary Focus Card */}
        <section style={styles.focusSection}>
          <div style={styles.focusCard}>
            <div style={styles.focusBadge}>
              <div style={styles.pulseIndicator}></div>
              <span style={styles.focusBadgeText}>Continue Learning</span>
            </div>

            <div style={styles.focusContent}>
              <h2 style={styles.focusLessonTitle}>Common Phrases</h2>
              <p style={styles.focusLessonHindi}>आम वाक्यांश</p>
              <p style={styles.focusLessonDesc}>
                Master 10 essential greetings for daily conversation
              </p>

              <div style={styles.focusProgressInfo}>
                <div style={styles.progressStat}>
                  <Clock size={16} color="#4a7c6f" />
                  <span>15 min left today</span>
                </div>
                <div style={styles.progressStat}>
                  <Star size={16} color="#4a7c6f" />
                  <span>7/10 phrases learned</span>
                </div>
              </div>
            </div>

            <button style={styles.focusCtaBtn} onClick={() => handleNavigation('/learn')}>
              <PlayCircle size={22} />
              <span>Continue Lesson</span>
            </button>

            <div style={styles.focusDecoration}>
              <BookOpen size={140} strokeWidth={0.5} color="rgba(74, 124, 111, 0.04)" />
            </div>
          </div>
        </section>

        {/* Stats Row */}
        <section style={styles.statsSection}>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIconBox, ...styles.statIconPrimary }}>
              <Target size={20} />
            </div>
            <div style={styles.statInfo}>
              <p style={styles.statLabel}>Daily Goal</p>
              <p style={styles.statValue}>15<span style={styles.statUnit}>/20 min</span></p>
            </div>
            <div style={styles.statProgressBar}>
              <div style={{ ...styles.statProgressFill, width: '75%' }}></div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statIconBox, ...styles.statIconSuccess }}>
              <Award size={20} />
            </div>
            <div style={styles.statInfo}>
              <p style={styles.statLabel}>Words Learned</p>
              <p style={styles.statValue}>47</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.statIconBox, ...styles.statIconAccent }}>
              <TrendingUp size={20} />
            </div>
            <div style={styles.statInfo}>
              <p style={styles.statLabel}>Accuracy</p>
              <p style={styles.statValue}>82<span style={styles.statUnit}>%</span></p>
            </div>
          </div>
        </section>

        {/* Learning Modes */}
        <section style={styles.modesSection}>
          <h3 style={styles.sectionHeading}>Practice Your Skills</h3>

          <div style={styles.modesGrid}>
            <button style={styles.modeCard} onClick={() => handleNavigation('/lessons')}>
              <div style={{ ...styles.modeIcon, backgroundColor: 'rgba(74, 124, 111, 0.1)', color: '#4a7c6f' }}>
                <BookOpen size={24} strokeWidth={1.8} />
              </div>
              <div style={styles.modeText}>
                <h4 style={styles.modeTitle}>Vocabulary</h4>
                <p style={styles.modeDesc}>Build your word bank</p>
              </div>
              <ChevronRight style={styles.modeArrow} size={20} />
            </button>

            <button style={styles.modeCard} onClick={() => handleNavigation('/practice')}>
              <div style={{ ...styles.modeIcon, backgroundColor: 'rgba(224, 159, 62, 0.1)', color: '#e09f3e' }}>
                <Zap size={24} strokeWidth={1.8} />
              </div>
              <div style={styles.modeText}>
                <h4 style={styles.modeTitle}>Listening</h4>
                <p style={styles.modeDesc}>Train your ear</p>
              </div>
              <ChevronRight style={styles.modeArrow} size={20} />
            </button>

            <button style={styles.modeCard} onClick={() => handleNavigation('/lessons')}>
              <div style={{ ...styles.modeIcon, backgroundColor: 'rgba(106, 153, 78, 0.1)', color: '#6a994e' }}>
                <BookOpen size={24} strokeWidth={1.8} />
              </div>
              <div style={styles.modeText}>
                <h4 style={styles.modeTitle}>Grammar</h4>
                <p style={styles.modeDesc}>Understand structure</p>
              </div>
              <ChevronRight style={styles.modeArrow} size={20} />
            </button>

            <button style={styles.modeCard} onClick={() => handleNavigation('/practice')}>
              <div style={{ ...styles.modeIcon, backgroundColor: 'rgba(74, 124, 111, 0.1)', color: '#4a7c6f' }}>
                <Target size={24} strokeWidth={1.8} />
              </div>
              <div style={styles.modeText}>
                <h4 style={styles.modeTitle}>Speaking</h4>
                <p style={styles.modeDesc}>Practice pronunciation</p>
              </div>
              <ChevronRight style={styles.modeArrow} size={20} />
            </button>
          </div>
        </section>

        {/* Bottom Row */}
        <section style={styles.bottomSection}>
          {/* Weekly Chart */}
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <h3 style={styles.sectionHeading}>This Week</h3>
              <BarChart3 size={18} color="#6b7c8c" />
            </div>

            <div style={styles.chartBarsContainer}>
              {[
                { day: 'M', value: 40 },
                { day: 'T', value: 70 },
                { day: 'W', value: 45 },
                { day: 'T', value: 90 },
                { day: 'F', value: 65 },
                { day: 'S', value: 30 },
                { day: 'S', value: 80 }
              ].map((item, i) => (
                <div key={i} style={styles.chartBarWrapper}>
                  <div style={{ ...styles.chartBar, height: `${item.value}%` }}>
                    <span style={styles.chartBarTooltip}>{item.value}%</span>
                  </div>
                  <span style={styles.chartBarLabel}>{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Word of Day */}
          <div style={styles.wordCard}>
            <span style={styles.wordLabel}>Word of the Day</span>
            <div style={styles.wordContent}>
              <h2 style={styles.wordHindi}>दोस्त</h2>
              <p style={styles.wordTranslation}>Dost · Friend</p>
            </div>
          </div>
        </section>

      </div>
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
    background: '#f8faf9',
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
    opacity: 0.03,
    backgroundImage: 'radial-gradient(circle at 20% 30%, #4a7c6f 0%, transparent 50%), radial-gradient(circle at 80% 70%, #e09f3e 0%, transparent 50%)',
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
    color: '#e09f3e',
    letterSpacing: '0.3px',
  },
  greetingName: {
    fontFamily: "'Lexend', sans-serif",
    fontSize: '36px',
    fontWeight: 800,
    color: '#2c3e3d',
    letterSpacing: '-0.5px',
    lineHeight: 1.1,
    margin: 0,
  },
  greetingSubtitle: {
    fontSize: '15px',
    fontWeight: 500,
    color: '#6b7c8c',
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
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    padding: '12px 20px',
    borderRadius: '9999px',
    border: '1px solid rgba(74, 124, 111, 0.15)',
    boxShadow: '0 1px 3px rgba(74, 124, 111, 0.08)',
  },
  streakIconWrapper: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(224, 159, 62, 0.1), rgba(224, 159, 62, 0.05))',
    borderRadius: '50%',
  },
  streakFlame: {
    color: '#e09f3e',
  },
  streakText: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.2,
  },
  streakCount: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#2c3e3d',
    fontFamily: "'Lexend', sans-serif",
  },
  streakLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#6b7c8c',
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
    background: 'rgba(255, 255, 255, 0.8)',
    border: '1px solid rgba(74, 124, 111, 0.15)',
    borderRadius: '50%',
    color: '#6b7c8c',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(74, 124, 111, 0.08)',
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
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(74, 124, 111, 0.15)',
    borderRadius: '24px',
    padding: '48px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(74, 124, 111, 0.12)',
  },
  focusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(224, 159, 62, 0.08)',
    border: '1px solid rgba(224, 159, 62, 0.2)',
    padding: '8px 16px',
    borderRadius: '9999px',
    marginBottom: '24px',
  },
  pulseIndicator: {
    width: '6px',
    height: '6px',
    background: '#e09f3e',
    borderRadius: '50%',
  },
  focusBadgeText: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#e09f3e',
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
    color: '#2c3e3d',
    lineHeight: 1.1,
    letterSpacing: '-1px',
    marginBottom: '8px',
  },
  focusLessonHindi: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#4a7c6f',
    marginBottom: '16px',
    letterSpacing: '0.3px',
  },
  focusLessonDesc: {
    fontSize: '16px',
    color: '#6b7c8c',
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
    background: '#e09f3e',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: "'Lexend', sans-serif",
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(224, 159, 62, 0.3)',
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
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(74, 124, 111, 0.15)',
    borderRadius: '20px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(74, 124, 111, 0.08)',
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
    color: '#6b7c8c',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  statValue: {
    fontFamily: "'Lexend', sans-serif",
    fontSize: '28px',
    fontWeight: 800,
    color: '#2c3e3d',
    lineHeight: 1,
  },
  statUnit: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#6b7c8c',
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
    color: '#2c3e3d',
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
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(74, 124, 111, 0.15)',
    borderRadius: '20px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(74, 124, 111, 0.08)',
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
    color: '#2c3e3d',
    marginBottom: '4px',
  },
  modeDesc: {
    fontSize: '13px',
    color: '#6b7c8c',
    lineHeight: 1.4,
  },
  modeArrow: {
    color: '#6b7c8c',
    alignSelf: 'flex-end',
  },
  bottomSection: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
  },
  chartCard: {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(74, 124, 111, 0.15)',
    borderRadius: '24px',
    padding: '32px',
    boxShadow: '0 4px 12px rgba(74, 124, 111, 0.1)',
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
    background: 'linear-gradient(180deg, #e09f3e, #d18d2e)',
    borderRadius: '8px 8px 4px 4px',
    minHeight: '20px',
    boxShadow: '0 4px 12px rgba(224, 159, 62, 0.2)',
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
    color: '#6b7c8c',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  wordCard: {
    position: 'relative',
    background: 'linear-gradient(135deg, #e09f3e 0%, #d18d2e 100%)',
    borderRadius: '24px',
    padding: '48px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(224, 159, 62, 0.3)',
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