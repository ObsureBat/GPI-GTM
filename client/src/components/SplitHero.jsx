import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const GTM_BACKGROUND_IMAGE = '/hero/gtm-hero.png';
const GPI_BACKGROUND_IMAGE = '/hero/gpi-hero.png';

export function SplitHero() {
  const rootRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={rootRef}
      className={`merged-hero${visible ? ' merged-hero--visible' : ''}`}
      aria-label="GPI and GTM brand showcase"
    >
      <div className="merged-hero__canvas" aria-hidden="true">
        <div className="merged-hero__layer merged-hero__layer--gtm">
          <img src={GTM_BACKGROUND_IMAGE} alt="" className="merged-hero__img" loading="eager" decoding="async" />
          <div className="merged-hero__tint merged-hero__tint--gtm" />
        </div>
        <div className="merged-hero__layer merged-hero__layer--gpi">
          <img src={GPI_BACKGROUND_IMAGE} alt="" className="merged-hero__img" loading="eager" decoding="async" />
          <div className="merged-hero__tint merged-hero__tint--gpi" />
        </div>
        <div className="merged-hero__seam" />
        <div className="merged-hero__glow" />
        <div className="merged-hero__shimmer" />
      </div>

      <div className="merged-hero__content">
        <div className="merged-hero__badges">
          <span className="merged-hero__badge merged-hero__badge--gtm">GTM</span>
          <span className="merged-hero__badge merged-hero__badge--gpi">GPI</span>
        </div>
        <h1 className="merged-hero__title">Premium salts, spices &amp; home care</h1>
        <p className="merged-hero__desc">
          Himalayan minerals and authentic Indian essentials — crafted with purity, tradition, and trust.
        </p>
        <Link to="/collections/all" className="btn btn--primary btn--large merged-hero__cta">
          View all products
        </Link>
      </div>
    </section>
  );
}
