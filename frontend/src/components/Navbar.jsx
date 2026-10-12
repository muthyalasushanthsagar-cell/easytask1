import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Bell, Info } from 'lucide-react';
import { formatDateTime } from '../utils/format.js';

export default function Navbar({ title, notif }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="navbar">
      <h1 className="navbar-title">{title}</h1>

      <div className="bell-wrap" ref={wrapRef}>
        <button type="button" className="icon-btn bell" onClick={() => setOpen((o) => !o)} aria-label="Notifications">
          <Bell size={20} />
          {notif.unread > 0 && <span className="bell-badge">{notif.unread > 9 ? '9+' : notif.unread}</span>}
        </button>

        {open && (
          <div className="bell-menu">
            <div className="bell-menu-header">
              <strong>Notifications</strong>
              {notif.unread > 0 && (
                <button type="button" className="link-btn" onClick={notif.markAllRead}>
                  Mark all read
                </button>
              )}
            </div>
            <div className="bell-list">
              {notif.items.length === 0 && <div className="bell-empty">You are all caught up</div>}
              {notif.items.map((n) => (
                <button
                  type="button"
                  key={n.id}
                  className={`bell-item ${n.read ? '' : 'unread'}`}
                  onClick={() => !n.read && notif.markRead(n.id)}
                >
                  <span className={`bell-icon ${n.type === 'OVERDUE' ? 'overdue' : ''}`}>
                    {n.type === 'OVERDUE' ? <AlertTriangle size={16} /> : <Info size={16} />}
                  </span>
                  <span className="bell-text">
                    <span className="bell-title">{n.title}</span>
                    {n.message && <span className="bell-msg">{n.message}</span>}
                    <span className="bell-time">{formatDateTime(n.createdAt)}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
