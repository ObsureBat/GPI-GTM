import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.jsx';
import { api } from '../api.js';

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

export function Header({ config }) {
  const { cart } = useCart();
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const count = cart?.item_count ?? 0;
  const brandShort = config.brandName?.split(' ')[0] || 'Store';

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
    <header className="site-header">
      <div className="header__inner page-width">
        <Link to="/" className="header__brand lift" aria-label={config.brandName || 'Home'}>
          <img
            src="/products/GPI Logo.png"
            alt={brandShort}
            className="header__logo"
            width={44}
            height={44}
          />
        </Link>

        <nav className="header__navMobile" aria-label="Mobile quick links">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? 'header__mobileLink header__mobileLink--active' : 'header__mobileLink'
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/collections/all"
            className={({ isActive }) =>
              isActive ? 'header__mobileLink header__mobileLink--active' : 'header__mobileLink'
            }
          >
            All products
          </NavLink>
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
          <div className="header__navGroup">
            <span className="header__navLabel">Products</span>
            {productNav.map((item) => (
              <NavDropdown key={item.to} item={item} />
            ))}
          </div>
        </nav>

        <div className="header__actions">
          <form className="header__search" onSubmit={onSearch}>
            <input
              type="search"
              placeholder="Search…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => q.trim().length >= 2 && setSearchOpen(true)}
              aria-label="Search products"
            />
            <button type="submit" className="btn btn--header-search">
              Search
            </button>
          </form>
          {searchOpen && results.length > 0 && (
            <div className="search-dropdown" role="listbox">
              {results.map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.handle}`}
                  className="search-dropdown__item"
                  onClick={() => setSearchOpen(false)}
                >
                  <img src={p.image_url} alt="" width={40} height={40} />
                  <span>{p.title}</span>
                </Link>
              ))}
            </div>
          )}

          <Link to="/cart" className="btn header__cart" aria-label="Cart">
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

      <div className="nav-drawer" data-open={drawerOpen || undefined} aria-hidden={!drawerOpen}>
        <button type="button" className="nav-drawer__backdrop" aria-label="Close menu" onClick={() => setDrawerOpen(false)} />
        <div className="nav-drawer__panel">
          <div className="nav-drawer__top">
            <span className="nav-drawer__title">Navigate</span>
            <button type="button" className="btn btn--drawer-close" onClick={() => setDrawerOpen(false)}>
              Close
            </button>
          </div>
          <div className="nav-drawer__links">
            <Link className="nav-drawer__link" to="/" onClick={() => setDrawerOpen(false)}>
              Home
            </Link>
            <span className="nav-drawer__section">Products</span>
            {productNav.map((item) => (
              <div key={item.to} className="nav-drawer__group">
                <Link className="nav-drawer__link" to={item.to} onClick={() => setDrawerOpen(false)}>
                  {item.label}
                </Link>
                {item.children?.map((child) => (
                  <Link
                    key={child.to}
                    className="nav-drawer__sublink"
                    to={child.to}
                    onClick={() => setDrawerOpen(false)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
            <Link className="nav-drawer__link" to="/cart" onClick={() => setDrawerOpen(false)}>
              Cart ({count})
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
