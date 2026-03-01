/**
 * NotificationBell.jsx
 * Place at: src/components/NotificationBell.jsx
 *
 * Drop-in replacement for the plain <Bell> icon button in headers.
 * Shows an unread count badge. Click opens a history dropdown.
 *
 * Usage:
 *   import NotificationBell from '../components/NotificationBell';
 *   <NotificationBell btnClassName="db-icon-btn" />
 */

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Trash2, Coffee, Target, Trophy, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const TYPE_ICON = {
  inactivity:    <Bell size={13} />,
  break:         <Coffee size={13} />,
  goal:          <Target size={13} />,
  milestone:     <Trophy size={13} />,
  encouragement: <Star size={13} />,
};

const TYPE_COLOR = {
  inactivity:    '#e67e22',
  break:         '#3498db',
  goal:          '#9b59b6',
  milestone:     '#f1c40f',
  encouragement: '#2ecc71',
};

const timeAgo = ts => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const NotificationBell = ({ btnClassName = 'db-icon-btn' }) => {
  const { notifications, unreadCount, markAllRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleToggle = () => {
    setOpen(o => !o);
    if (!open) markAllRead();
  };

  return (
    <>
      <style>{`
        ._nb { position: relative; display: inline-flex; align-items: center; }
        ._nb-badge {
          position: absolute; top: -4px; right: -4px;
          background: #e74c3c; color: #fff;
          border-radius: 10px; font-size: 0.6rem; font-weight: 700;
          padding: 1px 4px; min-width: 15px; text-align: center;
          pointer-events: none; line-height: 1.5;
        }
        ._nb-panel {
          position: absolute; top: calc(100% + 10px); right: 0;
          width: 300px; max-height: 380px; overflow-y: auto;
          background: var(--card-bg, #1e293b);
          border: 1px solid var(--border-color, #334155);
          border-radius: 14px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.22);
          z-index: 9999;
          animation: _nbIn 0.18s ease;
        }
        @keyframes _nbIn {
          from { opacity:0; transform: translateY(-5px); }
          to   { opacity:1; transform: translateY(0); }
        }
        ._nb-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 14px 10px;
          border-bottom: 1px solid var(--border-color, #334155);
        }
        ._nb-head-title { font-weight: 700; font-size: 0.87rem; color: var(--text-main, #f1f5f9); }
        ._nb-clear {
          background: none; border: none; cursor: pointer;
          color: var(--text-muted, #94a3b8);
          display: flex; align-items: center; gap: 4px;
          font-size: 0.72rem; padding: 3px 6px; border-radius: 5px;
        }
        ._nb-clear:hover { color: #e74c3c; background: rgba(231,76,60,0.08); }
        ._nb-empty {
          padding: 28px 16px; text-align: center;
          color: var(--text-muted, #94a3b8); font-size: 0.82rem;
        }
        ._nb-item {
          display: flex; align-items: flex-start; gap: 9px;
          padding: 11px 14px;
          border-bottom: 1px solid var(--border-color, #334155);
        }
        ._nb-item:last-child { border-bottom: none; }
        ._nb-item:hover { background: var(--bg-color, #0f172a); }
        ._nb-ico {
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        ._nb-txt { flex: 1; min-width: 0; }
        ._nb-ttl { font-weight: 600; font-size: 0.8rem; color: var(--text-main, #f1f5f9); margin-bottom: 2px; }
        ._nb-msg { font-size: 0.75rem; color: var(--text-muted, #94a3b8); line-height: 1.4; }
        ._nb-time { font-size: 0.68rem; color: var(--text-muted, #94a3b8); margin-top: 3px; opacity: 0.7; }
      `}</style>

      <div className="_nb" ref={ref}>
        <button
          className={btnClassName}
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          onClick={handleToggle}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="_nb-badge" aria-hidden="true">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="_nb-panel" role="dialog" aria-label="Notifications">
            <div className="_nb-head">
              <span className="_nb-head-title">🔔 Notifications</span>
              {notifications.length > 0 && (
                <button className="_nb-clear" onClick={clearAll} aria-label="Clear all">
                  <Trash2 size={11} /> Clear all
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="_nb-empty">
                <Bell size={26} style={{ opacity: 0.25, display: 'block', margin: '0 auto 8px' }} />
                No notifications yet
              </div>
            ) : (
              notifications.map(n => {
                const color = TYPE_COLOR[n.type] || '#e67e22';
                return (
                  <div key={n.id} className="_nb-item">
                    <div className="_nb-ico" style={{ background: `${color}22`, color }}>
                      {TYPE_ICON[n.type] || <Bell size={13} />}
                    </div>
                    <div className="_nb-txt">
                      <div className="_nb-ttl">{n.title}</div>
                      <div className="_nb-msg">{n.message}</div>
                      {n.actionPath && n.actionLabel && (
                        <button
                          onClick={() => { setOpen(false); navigate(n.actionPath); }}
                          style={{ marginTop: 4, background: 'none', border: 'none', padding: 0,
                            color, fontSize: '0.73rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          {n.actionLabel}
                        </button>
                      )}
                      <div className="_nb-time">{timeAgo(n.timestamp)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationBell;