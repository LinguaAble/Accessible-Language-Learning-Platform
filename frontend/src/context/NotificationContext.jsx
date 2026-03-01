/**
 * NotificationContext.jsx
 * Place at: src/context/NotificationContext.jsx
 *
 * Self-contained. Does NOT depend on UserContext or any other custom context.
 * Safe to wrap around the entire app without breaking anything.
 *
 * User Stories covered:
 *  US1  – Gentle inactivity reminders (idle timer)
 *  US2  – Limit notification frequency (5-min throttle gate)
 *  US3  – Goal reminders (called via triggerGoalReminder)
 *  US4  – Break reminders during long study sessions
 *  US5  – Encouragement / milestones after progress
 *  US6  – No late-night notifications (quiet hours)
 *  US7  – Simple, clear language (enforced by callers)
 *  US9  – Single call-to-action per notification
 *  US10 – User-controlled notification preferences (persisted to localStorage)
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const NotificationContext = createContext(null);

// ─── Default preferences (US10) ──────────────────────────────────────────────
const DEFAULT_PREFS = {
  inactivityReminders: true,
  breakReminders: true,
  goalReminders: true,
  milestoneAlerts: true,
  inactivityMinutes: 30,
  breakIntervalMinutes: 20,
  quietHoursStart: 22,
  quietHoursEnd: 8,
};

// Minimum gap between any two notifications – prevents overwhelming (US2)
const MIN_GAP_MS = 5 * 60 * 1000;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const isQuietNow = ({ quietHoursStart: s, quietHoursEnd: e }) => {
  const h = new Date().getHours();
  return s > e ? (h >= s || h < e) : (h >= s && h < e);
};

let _id = 1;
const makeNotif = (type, title, message, actionLabel = null, actionPath = null) => ({
  id: _id++,
  type,
  title,
  message,
  actionLabel,
  actionPath,
  timestamp: Date.now(),
  read: false,
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export const NotificationProvider = ({ children }) => {
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      const stored = localStorage.getItem('linguaable_notif_prefs');
      return stored ? { ...DEFAULT_PREFS, ...JSON.parse(stored) } : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  });

  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

  const lastNotifAt = useRef(0);
  const inactivityRef = useRef(null);
  const breakRef = useRef(null);
  const isStudying = useRef(false);

  useEffect(() => {
    localStorage.setItem('linguaable_notif_prefs', JSON.stringify(notifPrefs));
  }, [notifPrefs]);

  const pushNotification = useCallback((notif) => {
    if (isQuietNow(notifPrefs)) return;
    const now = Date.now();
    if (now - lastNotifAt.current < MIN_GAP_MS) return;
    lastNotifAt.current = now;
    setNotifications(prev => [notif, ...prev].slice(0, 50));
    setToast(notif);
  }, [notifPrefs]);

  const dismissToast = useCallback(() => setToast(null), []);
  const markAllRead = useCallback(() =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true }))), []);
  const clearAll = useCallback(() => setNotifications([]), []);

  // US1 – Inactivity reminder
  const resetInactivity = useCallback(() => {
    if (!notifPrefs.inactivityReminders) return;
    if (inactivityRef.current) clearTimeout(inactivityRef.current);
    inactivityRef.current = setTimeout(() => {
      pushNotification(makeNotif(
        'inactivity',
        '👋 Still there?',
        "You've been away for a while. Ready to continue learning?",
        'Resume Learning',
        '/lessons'
      ));
    }, notifPrefs.inactivityMinutes * 60 * 1000);
  }, [notifPrefs.inactivityReminders, notifPrefs.inactivityMinutes, pushNotification]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    const handler = () => resetInactivity();
    events.forEach(ev => window.addEventListener(ev, handler, { passive: true }));
    resetInactivity();
    return () => {
      events.forEach(ev => window.removeEventListener(ev, handler));
      if (inactivityRef.current) clearTimeout(inactivityRef.current);
    };
  }, [resetInactivity]);

  // US4 – Break reminder
  const startStudySession = useCallback(() => {
    if (!notifPrefs.breakReminders) return;
    isStudying.current = true;
    if (breakRef.current) clearTimeout(breakRef.current);
    breakRef.current = setTimeout(() => {
      if (!isStudying.current) return;
      pushNotification(makeNotif(
        'break',
        '☕ Time for a short break!',
        `You've been studying for ${notifPrefs.breakIntervalMinutes} minutes. A quick rest helps you remember more.`,
        'Take a Break',
        null
      ));
    }, notifPrefs.breakIntervalMinutes * 60 * 1000);
  }, [notifPrefs.breakReminders, notifPrefs.breakIntervalMinutes, pushNotification]);

  const endStudySession = useCallback(() => {
    isStudying.current = false;
    if (breakRef.current) clearTimeout(breakRef.current);
  }, []);

  // US3 – Goal reminder
  const triggerGoalReminder = useCallback((dailyGoalMinutes, progressMinutes) => {
    if (!notifPrefs.goalReminders) return;
    const pct = Math.round((progressMinutes / dailyGoalMinutes) * 100);
    if (pct < 100) {
      pushNotification(makeNotif(
        'goal',
        '🎯 Daily Goal Check-in',
        `You're ${pct}% towards your ${dailyGoalMinutes}-minute goal today. Keep it up!`,
        'Start a Lesson',
        '/lessons'
      ));
    }
  }, [notifPrefs.goalReminders, pushNotification]);

  // US5 – Milestone
  const triggerMilestone = useCallback((message, actionLabel = 'Keep Learning', actionPath = '/lessons') => {
    if (!notifPrefs.milestoneAlerts) return;
    pushNotification(makeNotif('milestone', '🏆 Achievement!', message, actionLabel, actionPath));
  }, [notifPrefs.milestoneAlerts, pushNotification]);

  // US5 – Encouragement
  const triggerEncouragement = useCallback((message) => {
    if (!notifPrefs.milestoneAlerts) return;
    pushNotification(makeNotif('encouragement', '⭐ Great work!', message, null, null));
  }, [notifPrefs.milestoneAlerts, pushNotification]);

  // US10 – Update prefs
  const updateNotifPrefs = useCallback((updates) => {
    setNotifPrefs(prev => ({ ...prev, ...updates }));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      toast,
      unreadCount,
      notifPrefs,
      dismissToast,
      markAllRead,
      clearAll,
      updateNotifPrefs,
      startStudySession,
      endStudySession,
      triggerGoalReminder,
      triggerMilestone,
      triggerEncouragement,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider');
  return ctx;
};