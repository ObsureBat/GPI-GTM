import { Link } from 'react-router-dom';
import { useState } from 'react';
import { formatProductPrice, getProductSizeClass, isComingSoonProduct, mediaUrl } from '../utils.js';

function HeartIcon({ filled = false }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} aria-hidden="true">
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 6l-4-4-4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ReviewIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProductCard({ product, onAdd, className = '', style = {} }) {
  const tag = product.brand === 'gtm' ? 'GTM' : 'GPI';
  const tagClass = product.brand === 'gtm' ? 'tag tag--gtm' : 'tag tag--gpi';
  const comingSoon = isComingSoonProduct(product);
  const sizeClass = getProductSizeClass(product);
  const [liked, setLiked] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/products/${product.handle}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.title, url });
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleReviewClick = () => {
    window.location.href = `/products/${product.handle}#reviews`;
  };

  return (
    <article
      className={`product-card ${sizeClass}${className ? ` ${className}` : ''}`}
      style={style}
    >
      <Link to={`/products/${product.handle}`} className="product-card__media">
        <img src={mediaUrl(product.image_url)} alt={product.title} loading="lazy" />
        <span className={tagClass}>{tag}</span>
      </Link>
      <div className="product-card__body">
        <Link to={`/products/${product.handle}`}>
          <h3 className="product-card__title">{product.title}</h3>
        </Link>
        <div className="product-card__price">
          <span className={comingSoon ? 'price-coming-soon' : 'price-current'}>
            {formatProductPrice(product)}
          </span>
          {!comingSoon && product.compare_at_cents && product.compare_at_cents > product.price_cents && (
            <span className="price-compare">{formatProductPrice(product, product.compare_at_cents)}</span>
          )}
        </div>
        {onAdd &&
          (comingSoon ? (
            <button type="button" className="btn btn--muted btn--small" disabled>
              Coming soon
            </button>
          ) : (
            <button type="button" className="btn btn--primary btn--small" onClick={() => onAdd(product.id)}>
              Add to cart
            </button>
          ))}
      </div>
      <div className="product-card__actions">
        <button
          type="button"
          className={`product-card__action ${liked ? 'product-card__action--liked' : ''}`}
          onClick={() => setLiked(!liked)}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          <HeartIcon filled={liked} />
        </button>
        <button
          type="button"
          className="product-card__action"
          onClick={handleShare}
          aria-label="Share"
        >
          <ShareIcon />
        </button>
        <button
          type="button"
          className="product-card__action"
          onClick={handleReviewClick}
          aria-label="Review"
        >
          <ReviewIcon />
        </button>
      </div>
    </article>
  );
}
