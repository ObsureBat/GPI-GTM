import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.jsx';
import { formatInr, isComingSoonProduct, mediaUrl } from '../utils.js';

export function CartPage() {
  const { cart, loading, updateQty } = useCart();

  if (loading || !cart) {
    return (
      <div className="page-loading">
        <span className="spinner" />
      </div>
    );
  }

  const { items, subtotal_cents } = cart;

  return (
    <div className="page-width page-section cart-page">
      <h1>Cart</h1>
      {items.length === 0 ? (
        <p>
          Your cart is empty. <Link to="/collections/all">Continue shopping</Link>
        </p>
      ) : (
        <>
          <ul className="cart-list">
            {items.map((line) => {
              const lineProduct = { handle: line.handle, title: line.title };
              const comingSoon = isComingSoonProduct(lineProduct);
              return (
              <li key={line.product_id} className="cart-line">
                <img src={mediaUrl(line.image_url)} alt="" width={96} height={96} />
                <div className="cart-line__info">
                  <Link to={`/products/${line.handle}`}>{line.title}</Link>
                  <p className="cart-line__price">
                    {comingSoon ? 'Coming soon' : `${formatInr(line.price_cents)} each`}
                  </p>
                </div>
                <div className="cart-line__qty">
                  <button
                    type="button"
                    className="qty-btn qty-btn--decrease"
                    aria-label="Decrease"
                    onClick={() => updateQty(line.product_id, line.quantity - 1)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                  <span className="qty-value">{line.quantity}</span>
                  <button
                    type="button"
                    className="qty-btn qty-btn--increase"
                    aria-label="Increase"
                    onClick={() => updateQty(line.product_id, line.quantity + 1)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <div className="cart-line__total">
                  {comingSoon ? 'Coming soon' : formatInr(line.price_cents * line.quantity)}
                </div>
              </li>
            );
            })}
          </ul>
          <div className="cart-summary">
            <p>
              <strong>Subtotal</strong> {formatInr(subtotal_cents)}
            </p>
            <Link to="/checkout" className="btn btn--primary btn--large">
              Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
