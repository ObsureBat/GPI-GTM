import { Link } from 'react-router-dom';

export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-page__glow auth-page__glow--1" aria-hidden="true" />
      <div className="auth-page__glow auth-page__glow--2" aria-hidden="true" />
      <div className="auth-card">
        <div className="auth-card__brand">
          <span className="auth-card__logo">GPI</span>
          <div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </div>
        {children}
        {footer}
        <Link to="/" className="auth-card__back">
          ← Back to store
        </Link>
      </div>
    </div>
  );
}
