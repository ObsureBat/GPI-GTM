import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import './admin.css';

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/admin/products', label: 'Products', icon: '◫' },
  { to: '/admin/orders', label: 'Orders', icon: '☰' },
  { to: '/admin/categories', label: 'Categories', icon: '▤' },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/sign-in');
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__logo">GPI</span>
          <div>
            <strong>Admin</strong>
            <small>Store management</small>
          </div>
        </div>
        <nav className="admin-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `admin-nav__link${isActive ? ' admin-nav__link--active' : ''}`
              }
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__foot">
          <p className="admin-sidebar__user">{user?.email}</p>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={handleLogout}>
            Sign out
          </button>
          <a href="/" className="admin-sidebar__store">
            ← View store
          </a>
        </div>
      </aside>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}
