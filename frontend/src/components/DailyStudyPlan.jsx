import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { Sparkles, RefreshCw, BookOpen } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CACHE_KEY = 'ai_daily_plan';
const CACHE_SNAPSHOT_KEY = 'ai_daily_plan_snapshot'; // tracks what data the plan was based on

const DailyStudyPlan = () => {
  const { user, preferences, todayProgress } = useUser();
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Build a snapshot string that changes whenever the AI should re-generate
  const buildSnapshot = useCallback(() => {
    const completed = (user.completedLessons || []).length;
    const scores = (user.lessonScores || []).map(s => `${s.lessonId}:${s.score}`).join(',');
    const prog = parseInt(localStorage.getItem('todayProgress'), 10) || todayProgress || 0;
    const goal = preferences?.dailyGoalMinutes || 5;
    const goalDone = prog >= goal ? 'done' : 'open';
    return `${completed}|${scores}|${goalDone}`;
  }, [user.completedLessons, user.lessonScores, todayProgress, preferences]);

  const fetchPlan = useCallback(async (forceRefresh = false) => {
    const snapshot = buildSnapshot();
    const cachedPlan = sessionStorage.getItem(CACHE_KEY);
    const cachedSnapshot = sessionStorage.getItem(CACHE_SNAPSHOT_KEY);

    // Only use cache if data hasn't changed
    if (!forceRefresh && cachedPlan && cachedSnapshot === snapshot) {
      setPlan(cachedPlan);
      return;
    }

    setLoading(true);
    setError('');
    setPlan('');

    try {
      const completedLessons = user.completedLessons ||
        JSON.parse(localStorage.getItem('completedLessons') || '[]');

      const currentProgress = parseInt(localStorage.getItem('todayProgress'), 10) || todayProgress || 0;
      const dailyGoalMinutes = preferences?.dailyGoalMinutes || 5;

      const res = await axios.post(`${API}/api/ai/daily-plan`, {
        completedLessons,
        dailyScores: user.dailyScores || [],
        streak: user.streak || 0,
        dailyGoalMinutes,
        lessonScores: user.lessonScores || [],
        todayProgress: currentProgress
      });

      if (res.data.success) {
        setPlan(res.data.plan);
        sessionStorage.setItem(CACHE_KEY, res.data.plan);
        sessionStorage.setItem(CACHE_SNAPSHOT_KEY, snapshot);
      }
    } catch (err) {
      console.error('Daily plan fetch failed:', err);
      setError('Could not load your plan. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, preferences, todayProgress, buildSnapshot]);

  // Re-fetch when user data changes (e.g. after completing a lesson)
  useEffect(() => {
    if (user.email || user.completedLessons) {
      fetchPlan(false);
    }
  }, [user.email, user.completedLessons?.length, user.lessonScores?.length, todayProgress]);

  return (
    <div className="db-ai-plan-card">
      <div className="db-ai-plan-header">
        <div className="db-ai-badge">
          <Sparkles size={13} />
          AI Coach
        </div>
        <h3 className="db-card-title">Today's Study Plan</h3>
        <button
          className="db-ai-refresh-btn"
          onClick={() => fetchPlan(true)}
          disabled={loading}
          title="Refresh plan"
          aria-label="Refresh AI study plan"
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
        </button>
      </div>

      <div className="db-ai-plan-body">
        {loading && (
          <div className="db-ai-shimmer">
            <div className="shimmer-line shimmer-long" />
            <div className="shimmer-line shimmer-short" />
          </div>
        )}

        {!loading && error && (
          <p className="db-ai-error">{error}</p>
        )}

        {!loading && !error && plan && (
          <div className="db-ai-plan-text">
            <BookOpen size={16} className="db-ai-plan-icon" />
            <p>{plan}</p>
          </div>
        )}

        {!loading && !error && !plan && (
          <p className="db-ai-placeholder">Generating your personalized plan...</p>
        )}
      </div>
    </div>
  );
};

export default DailyStudyPlan;
