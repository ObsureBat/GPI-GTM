import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { api } from '../api.js';
import { mediaUrl } from '../utils.js';
import { HeaderAuth } from './HeaderAuth.jsx';

const productNav = [
  {
    label: 'All products',
    to: '/collections/all',
  },
  {
    label: 'Salt products',
    to: '/collections/salt-products',
    children: [
      { label: '1kg', to: '/collections/salt-1kg' },
      { label: '200gm', to: '/collections/salt-200gm' },
      { label: '100gm', to: '/collections/salt-100gm' },
    ],
  },
  {
    label: 'Spices products',
    to: '/collections/spices-products',
    children: [
      { label: '100gm', to: '/collections/spices-100gm' },
      { label: '50gm', to: '/collections/spices-50gm' },
    ],
  },
  {
    label: 'Cleaning products',
    to: '/collections/cleaning-products',
    children: [
      { label: '1kg', to: '/collections/cleaning-1kg' },
      { label: '500gm', to: '/collections/cleaning-500gm' },
    ],
  },
];

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3h2l2.4 12.3a1.8 1.8 0 0 0 1.8 1.5h9a1.8 1.8 0 0 0 1.8-1.5L21 7H7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="20" r="1.4" fill="currentColor" />
      <circle cx="18" cy="20" r="1.4" fill="currentColor" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function NavDropdown({ item }) {
  return (
    <div className="header__dropdown">
      <Link to={item.to} className="header__dropdownTrigger">
        {item.label}
        {item.children && <span className="header__dropdownCaret" aria-hidden="true" />}
      </Link>
      {item.children && (
        <div className="header__dropdownMenu">
          {item.children.map((child) => (
            <Link key={child.to} to={child.to} className="header__dropdownItem">
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchForm({ q, setQ, results, setResults, searchOpen, setSearchOpen, onSearch, onPick, compact }) {
  return (
    <div className={`header__searchWrapper${compact ? ' header__searchWrapper--drawer' : ''}`}>
      <form className={`header__search${compact ? ' header__search--drawer' : ''}`} onSubmit={onSearch} role="search">
        <input
          type="search"
          placeholder="Search products…"
          value={q}
          onChange={(e) => {
            const val = e.target.value;
            setQ(val);
            if (val.trim().length < 2) {
              setResults([]);
              setSearchOpen(false);
            }
          }}
          onFocus={() => q.trim().length >= 2 && results.length > 0 && setSearchOpen(true)}
          onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
          aria-label="Search products"
        />
        <button type="submit" className="header__searchBtn" aria-label="Search">
          <SearchIcon />
        </button>
      </form>
      {searchOpen && results.length > 0 && (
        <div className="search-dropdown" role="listbox">
          {results.map((p) => (
            <Link
              key={p.id}
              to={`/products/${p.handle}`}
              className="search-dropdown__item"
              onClick={() => {
                setSearchOpen(false);
                onPick?.();
              }}
            >
              <img src={mediaUrl(p.image_url)} alt="" width={40} height={40} />
              <span>{p.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Header({ config }) {
  const { cart } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const count = cart?.item_count ?? 0;
  const brandShort = config.brandName?.split(' ')[0] || 'Store';

  const closeDrawer = () => setDrawerOpen(false);

  async function handleDrawerLogout() {
    closeDrawer();
    await logout();
  }

  const onSearch = async (e) => {
    e.preventDefault();
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }
    const rows = await api.search(term);
    setResults(rows);
    setSearchOpen(true);
  };

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <>
    <header className="site-header">
      <div className="header__inner page-width">
        <div className="header__brandSection">
          <Link to="/" className="header__brand lift" aria-label={config.brandName || 'Home'}>
            <img
              src={mediaUrl('banners/gpi-logo.png')}
              alt={brandShort}
              className="header__logo"
              width={44}
              height={44}
            />
          </Link>
        </div>

        <div className="header__navSection">
          <nav className="header__navMobile" aria-label="Mobile quick links">
            <NavLink
              to="/collections/all"
              className={({ isActive }) =>
                isActive ? 'header__mobileLink header__mobileLink--active' : 'header__mobileLink'
              }
            >
              All products
            </NavLink>
          </nav>
          <nav className="header__mobileActions" aria-label="Mobile account actions">
            {user ? (
              <Link to="/cart" className="header__mobileActionBtn header__mobileActionBtn--cart">
                <CartIcon />
                <span className="header__cartCount">{count}</span>
              </Link>
            ) : (
              <>
                <Link to="/sign-in" className="header__mobileActionBtn header__mobileActionBtn--icon" aria-label="Sign in">
                  <UserIcon />
                </Link>
                <Link to="/cart" className="header__mobileActionBtn header__mobileActionBtn--cart">
                  <CartIcon />
                  <span className="header__cartCount">{count}</span>
                </Link>
              </>
            )}
          </nav>

          <nav className="header__nav" aria-label="Primary">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? 'header__link header__link--active' : 'header__link'
              }
            >
              Home
            </NavLink>
            {productNav.map((item) => (
              <NavDropdown key={item.to} item={item} />
            ))}
          </nav>
        </div>

        <div className="header__actions">
          <div className="header__actionsDesktop">
            <SearchForm
              q={q}
              setQ={setQ}
              results={results}
              setResults={setResults}
              searchOpen={searchOpen}
              setSearchOpen={setSearchOpen}
              onSearch={onSearch}
            />
            <HeaderAuth />
          </div>

          <Link to="/cart" className="btn header__cart lift header__cart--desktop" aria-label="Cart">
            <CartIcon />
            <span className="header__cartCount">{count}</span>
          </Link>

          <button
            type="button"
            className="btn header__menu"
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <span className="header__menuIcon" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>

      <div className="nav-drawer" data-open={drawerOpen || undefined} aria-hidden={!drawerOpen}>
        <button
          type="button"
          className="nav-drawer__backdrop"
          aria-label="Close menu"
          onClick={closeDrawer}
        />
        <div className="nav-drawer__panel" role="dialog" aria-modal="true" aria-label="Site menu">
          <div className="nav-drawer__top">
            <span className="nav-drawer__title">Menu</span>
            <button type="button" className="btn btn--drawer-close" onClick={closeDrawer}>
              Close
            </button>
          </div>

          <SearchForm
            q={q}
            setQ={setQ}
            results={results}
            setResults={setResults}
            searchOpen={searchOpen}
            setSearchOpen={setSearchOpen}
            onSearch={onSearch}
            onPick={closeDrawer}
            compact
          />

          <div className="nav-drawer__links">
            <span className="nav-drawer__section">Shop</span>
            <Link className="nav-drawer__link" to="/" onClick={closeDrawer}>
              Home
            </Link>
            {productNav.map((item) => (
              <div key={item.to} className="nav-drawer__group">
                <Link className="nav-drawer__link" to={item.to} onClick={closeDrawer}>
                  {item.label}
                </Link>
                {item.children?.length ? (
                  <div className="nav-drawer__sizes">
                    {item.children.map((child) => (
                      <Link
                        key={child.to}
                        className="nav-drawer__sizeChip"
                        to={child.to}
                        onClick={closeDrawer}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            <Link className="nav-drawer__link" to="/cart" onClick={closeDrawer}>
              Cart ({count})
            </Link>

            <span className="nav-drawer__section">Account</span>
            {user ? (
              <>
                <p className="nav-drawer__user">{user.name || user.email}</p>
                {isAdmin && (
                  <Link className="nav-drawer__link" to="/admin/dashboard" onClick={closeDrawer}>
                    Admin dashboard
                  </Link>
                )}
                <button
                  type="button"
                  className="nav-drawer__link nav-drawer__link--button"
                  onClick={handleDrawerLogout}
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="nav-drawer__auth">
                <Link className="nav-drawer__authBtn nav-drawer__authBtn--ghost" to="/sign-in" onClick={closeDrawer}>
                  Sign in
                </Link>
                <Link className="nav-drawer__authBtn nav-drawer__authBtn--primary" to="/sign-up" onClick={closeDrawer}>
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
