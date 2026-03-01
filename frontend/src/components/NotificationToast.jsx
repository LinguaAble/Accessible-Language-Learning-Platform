/**
 * NotificationToast.jsx
 * Place at: src/components/NotificationToast.jsx
 *
 * Renders a non-intrusive floating toast in the bottom-right corner.
 * Auto-dismisses after 6 seconds.
 * US7 – Simple language (content from context)
 * US9 – Single CTA button only
 */

import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const AUTO_DISMISS_MS = 6000;

const COLORS = {
  inactivity: '#e67e22',
  break:       '#3498db',
  goal:        '#9b59b6',
  milestone:   '#f1c40f',
  encouragement: '#2ecc71',
};

const ICONS = {
  inactivity:    '👋',
  break:         '☕',
  goal:          '🎯',
  milestone:     '🏆',
  encouragement: '⭐',
};

const NotificationToast = () => {
  const { toast, dismissToast } = useNotifications();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    if (toast) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(dismissToast, AUTO_DISMISS_MS);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [toast, dismissToast]);

  if (!toast) return null;

  const accent = COLORS[toast.type] || '#e67e22';
  const emoji  = ICONS[toast.type]  || '🔔';

  const handleAction = () => {
    dismissToast();
    if (toast.actionPath) navigate(toast.actionPath);
  };

  return (
    <>
      <style>{`
        @keyframes _toastIn {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes _toastProg {
          from { width: 100%; }
          to   { width: 0%; }
        }
        ._toast-wrap {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 310px;
          background: var(--card-bg, #1e293b);
          border: 1px solid var(--border-color, #334155);
          border-left: 4px solid ${accent};
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.22);
          padding: 14px 16px 18px;
          z-index: 99999;
          animation: _toastIn 0.3s ease;
          font-family: inherit;
        }
        ._toast-row {
          display: flex;
          align-items: flex-start;
          gap: 9px;
        }
        ._toast-emoji {
          font-size: 1.2rem;
          line-height: 1.4;
          flex-shrink: 0;
        }
        ._toast-body { flex: 1; min-width: 0; }
        ._toast-title {
          font-weight: 700;
          font-size: 0.88rem;
          color: var(--text-main, #f1f5f9);
          margin: 0 0 3px;
        }
        ._toast-msg {
          font-size: 0.8rem;
          color: var(--text-muted, #94a3b8);
          line-height: 1.45;
          margin: 0;
        }
        ._toast-close {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted, #94a3b8);
          padding: 2px;
          display: flex;
          align-items: center;
          border-radius: 4px;
          flex-shrink: 0;
        }
        ._toast-close:hover { color: var(--text-main, #f1f5f9); }
        ._toast-btn {
          margin-top: 10px;
          background: ${accent};
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 6px 14px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        ._toast-btn:hover { opacity: 0.85; }
        ._toast-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          border-radius: 0 0 0 12px;
          background: ${accent};
          animation: _toastProg ${AUTO_DISMISS_MS}ms linear forwards;
        }
      `}</style>

      <div className="_toast-wrap" role="alert" aria-live="polite">
        <div className="_toast-row">
          <span className="_toast-emoji">{emoji}</span>
          <div className="_toast-body">
            <p className="_toast-title">{toast.title}</p>
            <p className="_toast-msg">{toast.message}</p>
            {/* US9 – single CTA only */}
            {toast.actionLabel && (
              <button className="_toast-btn" onClick={handleAction}>
                {toast.actionLabel}
              </button>
            )}
          </div>
          <button className="_toast-close" onClick={dismissToast} aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
        <div className="_toast-bar" />
      </div>
    </>
  );
};

export default NotificationToast;