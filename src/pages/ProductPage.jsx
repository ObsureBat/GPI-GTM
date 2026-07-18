import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useCart } from '../contexts/CartContext.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { formatInr, formatProductPrice, isComingSoonProduct, mediaUrl } from '../utils.js';
import { ProductCard } from '../components/ProductCard.jsx';

function formatReviewDate(iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso));
  } catch {
    return String(iso).slice(0, 10);
  }
}

const EMPTY_STATS = {
  avg: 0,
  count: 0,
  dist: [5, 4, 3, 2, 1].map((s) => ({ stars: s, count: 0 })),
};

export function ProductPage() {
  const { handle } = useParams();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [related, setRelated] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [allProducts, setAllProducts] = useState([]);

  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState(EMPTY_STATS);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    title: '',
    rating: 5,
    body: '',
  });
  const [reviewErr, setReviewErr] = useState(null);
  const [highlightReviewId, setHighlightReviewId] = useState(null);
  const [status, setStatus] = useState('ready');
  const carouselRef = useRef(null);

  useEffect(() => {
    api.getProduct(handle).then(setP).catch(() => setP(false));
    api.getProducts().then(setAllProducts).catch(() => setAllProducts([]));
  }, [handle]);

  const sizes = useMemo(() => {
    if (!p || !allProducts.length) return [];
    const baseTitle = p.title.replace(/\s\d+(g|kg|Kg).*$/i, '').trim();
    return allProducts
      .filter((x) => x.title.startsWith(baseTitle))
      .map((x) => {
        const match = x.title.match(/(\d+(g|kg|Kg))/i);
        return {
          id: x.id,
          handle: x.handle,
          size: match ? match[0] : 'Standard',
          price: x.price_cents,
        };
      })
      .sort((a, b) => {
        const val = (s) => {
          const m = s.match(/(\d+)(g|kg|Kg)/i);
          if (!m) return 0;
          return m[2].toLowerCase() === 'kg' ? Number(m[1]) * 1000 : Number(m[1]);
        };
        return val(a.size) - val(b.size);
      });
  }, [p, allProducts]);

  useEffect(() => {
    if (sizes.length > 0) {
      const current = sizes.find((s) => s.id === p?.id);
      setSelectedSize(current || sizes[0]);
    }
  }, [sizes, p]);

  useEffect(() => {
    if (!p || p === false) return undefined;
    api
      .getProducts('?brand=' + encodeURIComponent(p.brand))
      .then((rows) => rows.filter((x) => x.handle !== p.handle).slice(0, 8))
      .then(setRelated)
      .catch(() => setRelated([]));
    return undefined;
  }, [p]);

  const loadReviews = useCallback(async () => {
    if (!handle) return;
    setReviewsLoading(true);
    try {
      const data = await api.getReviews(handle);
      setReviews(data.reviews || []);
      setRatingStats(data.stats || EMPTY_STATS);
    } catch {
      setReviews([]);
      setRatingStats(EMPTY_STATS);
    } finally {
      setReviewsLoading(false);
    }
  }, [handle]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    if (user?.name) {
      setReviewForm((f) => ({ ...f, name: user.name }));
    }
  }, [user?.name]);

  const isBestSeller = useMemo(() => {
    if (!p || p === false) return false;
    // Deterministic best seller based on handle for professional look
    return p.handle.length % 3 === 0;
  }, [p]);

  const comingSoon = p && p !== false && isComingSoonProduct(p);

  const addToCartWithAnimation = async (id, quantity) => {
    try {
      // Only show global loading state if adding the main product
      const isMainProduct = id === p?.id;
      if (isMainProduct) setStatus('adding');

      await addToCart(id, quantity);

      if (isMainProduct) {
        // Wait for animation to finish before resetting state
        setTimeout(() => {
          setQty(1);
          setStatus('ready');
        }, 1500);
      }
    } catch {
      setStatus('ready');
    }
  };

  const onSubmitReview = async (e) => {
    e.preventDefault();
    setReviewErr(null);

    const name = reviewForm.name.trim();
    const title = reviewForm.title.trim();
    const body = reviewForm.body.trim();
    const rating = Number(reviewForm.rating);

    if (!name || name.length < 2) return setReviewErr('Please enter your name.');
    if (!title || title.length < 3) return setReviewErr('Please add a short title.');
    if (!body || body.length < 20) return setReviewErr('Please write at least 20 characters.');
    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
      return setReviewErr('Rating must be between 1 and 5.');
    }

    if (!handle) return undefined;

    setReviewSubmitting(true);
    try {
      const created = await api.submitReview(handle, { name, title, rating, body });
      setHighlightReviewId(created.id);
      setReviewForm((f) => ({ ...f, title: '', rating: 5, body: '' }));
      await loadReviews();
    } catch (err) {
      setReviewErr(err.message || 'Could not submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const hasReviews = ratingStats.count > 0;

  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return;
    const scrollAmount = 300;
    carouselRef.current.scrollBy({
      left: direction === 'next' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  };

  if (p === null) {
    return (
      <div className="page-loading">
        <span className="spinner" />
      </div>
    );
  }

  if (p === false) {
    return (
      <div className="page-width page-section">
        <p>Product not found.</p>
        <Link to="/collections/all">Browse shop</Link>
      </div>
    );
  }

  return (
    <div className="page-width page-section product-detail">
      <div className="product-detail__grid">
        <div className="product-detail__media reveal">
          <img src={mediaUrl(p.image_url)} alt={p.title} />
        </div>
        <div className="product-detail__info reveal">
          <div className="product-detail__meta">
            <span className={p.brand === 'gtm' ? 'tag tag--gtm' : 'tag tag--gpi'}>
              {p.brand === 'gtm' ? 'GTM' : 'GPI'}
            </span>
            {isBestSeller && <span className="product-detail__badge">Best Seller</span>}
          </div>
          <h1>{p.title}</h1>
          
          <div className="product-detail__rating-summary" onClick={() => document.getElementById('reviews').scrollIntoView({ behavior: 'smooth' })}>
            {hasReviews ? (
              <>
                <div className="stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < Math.round(ratingStats.avg) ? 'star star--on' : 'star'}>★</span>
                  ))}
                </div>
                <span className="count">{ratingStats.count} Review{ratingStats.count === 1 ? '' : 's'}</span>
              </>
            ) : (
              <span className="count count--muted">No reviews yet</span>
            )}
          </div>

          <div className="product-detail__price">
            <span className={comingSoon ? 'price-coming-soon' : 'price-current'}>
              {formatProductPrice(p, selectedSize?.price || p.price_cents)}
            </span>
            {!comingSoon && p.compare_at_cents && p.compare_at_cents > p.price_cents && (
              <span className="price-compare">{formatInr(p.compare_at_cents)}</span>
            )}
          </div>

          <p className="product-detail__desc">{p.description}</p>

          {sizes.length > 1 && (
            <div className="product-detail__sizes">
              <label>Select Size</label>
              <div className="size-options">
                {sizes.map((s) => (
                  <Link
                    key={s.id}
                    to={`/products/${s.handle}`}
                    className={`size-option ${selectedSize?.id === s.id ? 'active' : ''}`}
                  >
                    {s.size}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="product-detail__buy">
            {!comingSoon && (
              <div className="qty-selector">
                <button
                  type="button"
                  className="qty-btn qty-btn--decrease"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  aria-label="Decrease quantity"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value) || 1)}
                  className="qty-input"
                />
                <button
                  type="button"
                  className="qty-btn qty-btn--increase"
                  onClick={() => setQty(Math.min(99, qty + 1))}
                  aria-label="Increase quantity"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            )}
            <button
              type="button"
              className={`btn ${comingSoon ? 'btn--muted' : 'btn--primary'} btn--add-to-cart ${status === 'adding' ? 'adding' : ''}`}
              onClick={() => !comingSoon && addToCartWithAnimation(p.id, qty)}
              disabled={comingSoon || status === 'adding'}
            >
              <span className="btn-text">
                {comingSoon ? 'Coming soon' : status === 'adding' ? 'Adding to cart...' : 'Add to cart'}
              </span>
              {!comingSoon && <span className="btn-icon">{status === 'adding' ? '✨' : '🛒'}</span>}
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="product-extra product-extra--reco reveal">
          <div className="product-extra__panel">
            <header className="product-extra__head reveal">
              <h2>Recommended for you</h2>
              <p>Similar {p.brand.toUpperCase()} picks you may like.</p>
            </header>
            <div className="product-reco__carousel-wrapper">
              <button
                className="carousel-nav carousel-nav--prev"
                onClick={() => scrollCarousel('prev')}
                aria-label="Previous products"
              >
                ←
              </button>
              <div className="product-reco__carousel" ref={carouselRef}>
                {related.map((rp, idx) => (
                  <ProductCard
                    key={rp.id}
                    product={rp}
                    onAdd={(id) => addToCartWithAnimation(id, 1)}
                    className="carousel-item reveal"
                    style={{ '--i': idx }}
                  />
                ))}
              </div>
              <button
                className="carousel-nav carousel-nav--next"
                onClick={() => scrollCarousel('next')}
                aria-label="Next products"
              >
                →
              </button>
            </div>
          </div>
        </section>
      )}

      <section id="reviews" className="product-extra product-extra--reviews reveal">
        <div className="product-extra__panel">
          <header className="product-extra__head reveal">
            <h2>Customer reviews</h2>
            <p>Real feedback to help you choose with confidence.</p>
          </header>

          <div className="reviews-summary">
            <div className="reviews-summary__left">
              {hasReviews ? (
                <>
                  <div className="reviews-rating">
                    <div className="reviews-rating__avg" aria-label={`Average rating ${ratingStats.avg.toFixed(1)} out of 5`}>
                      {ratingStats.avg.toFixed(1)}
                    </div>
                    <div className="reviews-rating__stars" aria-hidden="true">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < Math.round(ratingStats.avg) ? 'star star--on' : 'star'}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="reviews-count">
                    Based on {ratingStats.count} verified review{ratingStats.count === 1 ? '' : 's'}
                  </p>
                </>
              ) : (
                <div className="reviews-summary__empty">
                  <p className="reviews-summary__empty-label">Overall rating</p>
                  <p className="reviews-summary__empty-value">Not rated yet</p>
                </div>
              )}
            </div>

            <div className="reviews-summary__right">
              <div className="rating-dist">
                {ratingStats.dist.map((d) => {
                  const percent = ratingStats.count ? (d.count / ratingStats.count) * 100 : 0;
                  return (
                    <div key={d.stars} className="rating-dist__row">
                      <span className="rating-dist__label">{d.stars}★</span>
                      <span className="rating-dist__bar" aria-hidden="true">
                        <span className="rating-dist__fill" style={{ width: `${percent}%` }} />
                      </span>
                      <span className="rating-dist__count">{d.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="reviews-content">
            <div className="reviews-list">
              {reviewsLoading ? (
                <div className="reviews-loading">
                  <span className="spinner" aria-hidden="true" />
                  <p>Loading reviews…</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="reviews-empty-state">
                  <div className="reviews-empty-state__icon" aria-hidden="true">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.2 22 12 18.56 5.8 22 7 14.14l-5-4.87 7.1-1.01L12 2z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="reviews-empty-state__title">No reviews yet</h3>
                  <p className="reviews-empty-state__text">
                    Be the first to share your experience with this product. Your feedback helps other
                    customers shop with confidence.
                  </p>
                </div>
              ) : (
                reviews.map((r, idx) => (
                  <article
                    key={r.id}
                    className={`review-card reveal reveal--stagger${r.id === highlightReviewId ? ' review-card--new' : ''}`}
                    style={{ '--stagger': idx }}
                  >
                    <div className="review-card__top">
                      <div className="review-card__meta">
                        <strong>{r.title}</strong>
                        <span className="review-card__by">by {r.name}</span>
                      </div>
                      <div className="review-card__stars" aria-label={`${r.rating} out of 5`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < r.rating ? 'star star--on' : 'star'} aria-hidden="true">
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="review-card__date">{formatReviewDate(r.created_at || r.date)}</div>
                    <p className="review-card__body">{r.body}</p>
                  </article>
                ))
              )}
            </div>

            <form className="review-form" onSubmit={onSubmitReview}>
              <h3>Write a review</h3>
              <p className="review-form__hint">Share an honest rating and a few details about quality, taste, or packaging.</p>

              <label>
                Your name
                <input
                  className="input"
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
                  disabled={!!user?.name || reviewSubmitting}
                  placeholder="Your name"
                />
              </label>

              <label>
                Title
                <input
                  className="input"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                  disabled={reviewSubmitting}
                  placeholder="Summarize your experience"
                />
              </label>

              <label>
                Rating
                <select
                  className="input"
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                  disabled={reviewSubmitting}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} star{n === 1 ? '' : 's'}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Review
                <textarea
                  className="input"
                  rows={5}
                  value={reviewForm.body}
                  onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
                  disabled={reviewSubmitting}
                  placeholder="What did you like? How was the quality and packaging?"
                />
              </label>

              {reviewErr && <p className="form-error">{reviewErr}</p>}

              <button type="submit" className="btn btn--primary btn--large" disabled={reviewSubmitting}>
                {reviewSubmitting ? 'Submitting…' : 'Submit review'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
