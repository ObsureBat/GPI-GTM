import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function getInitials(user) {
  const name = user?.name?.trim() || user?.email || '?';
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function HeaderAuth({ onNavigate }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function handleLogout() {
    setOpen(false);
    onNavigate?.();
    await logout();
    navigate('/');
  }

  if (!user) {
    return (
      <div className="header-account header-account--guest">
        <Link to="/sign-in" className="header-account__signin" onClick={onNavigate}>
          <UserIcon />
          <span>Sign in</span>
        </Link>
        <Link to="/sign-up" className="header-account__signup" onClick={onNavigate}>
          Sign up
        </Link>
      </div>
    );
  }

  const displayName = user.name?.split(' ')[0] || user.email?.split('@')[0] || 'Account';

  return (
    <div className="header-account header-account--signed-in" ref={rootRef}>
      <button
        type="button"
        className="header-account__trigger"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="header-account__avatar" aria-hidden="true">
          {getInitials(user)}
        </span>
        <span className="header-account__label">{displayName}</span>
        <span className="header-account__caret" aria-hidden="true" />
      </button>

      {open && (
        <div className="header-account__menu" role="menu">
          <div className="header-account__menuHead">
            <strong>{user.name || 'Account'}</strong>
            <small>{user.email}</small>
          </div>
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className="header-account__menuItem"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
            >
              Admin dashboard
            </Link>
          )}
          <button
            type="button"
            className="header-account__menuItem header-account__menuItem--danger"
            role="menuitem"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
