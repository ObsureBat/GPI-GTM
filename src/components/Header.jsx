import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.jsx';
import { api } from '../api.js';

const nav = [
  { to: '/', label: 'Home', end: true },
  { to: '/collections/gpi-products', label: 'Shop GPI' },
  { to: '/collections/gtm-products', label: 'Shop GTM' },
  { to: '/collections/all', label: 'All products' },
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

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 12h18M3 6h18M3 18h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Header({ config }) {
  const { cart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileMenuOpen && !e.target.closest('.nav-drawer') && !e.target.closest('.header__menu')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchLoading(true);
      const timeoutId = setTimeout(() => {
        api.search(searchQuery).then(results => {
          setSearchResults(results);
          setSearchLoading(false);
        });
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const itemCount = cart?.item_count || 0;

  return (
    <>
      <header className="header">
        <div className="header__content">
          <Link to="/" className="header__logo">
            {config?.store_name || 'GPI / GTM'}
          </Link>

          <nav className="header__nav">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? 'active' : '')}
                end={item.end}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header__search">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                className="search-input"
              />
              {searchOpen && searchResults.length > 0 && (
                <div className="search-results">
                  {searchLoading ? (
                    <div className="search-loading">Searching...</div>
                  ) : (
                    searchResults.map((product) => (
                      <Link
                        key={product.id}
                        to={`/products/${product.handle}`}
                        className="search-result-item"
                        onClick={() => setSearchOpen(false)}
                      >
                        <img 
                          src={product.image_url} 
                          alt={product.title}
                          className="search-result-image"
                        />
                        <div className="search-result-info">
                          <div className="search-result-title">{product.title}</div>
                          <div className="search-result-price">
                            ₹{(product.price_cents / 100).toFixed(2)}
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </form>
          </div>

          <Link to="/cart" className="header__cart" aria-label={`Shopping cart with ${itemCount} items`}>
            <CartIcon />
            {itemCount > 0 && <span className="header__cart-count">{itemCount}</span>}
          </Link>

          <button
            type="button"
            className="header__menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div className={`nav-drawer ${mobileMenuOpen ? 'nav-drawer--open' : ''}`}>
        <div className="nav-drawer__header">
          <Link to="/" className="header__logo">
            {config?.store_name || 'GPI / GTM'}
          </Link>
          <button
            type="button"
            className="nav-drawer__close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <CloseIcon />
          </button>
        </div>
        <nav className="nav-drawer__nav">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'active' : '')}
              end={item.end}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div 
          className="nav-overlay"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
