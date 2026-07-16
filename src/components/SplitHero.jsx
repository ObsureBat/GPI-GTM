import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { mediaUrl } from '../utils.js';

const GTM_BACKGROUND_IMAGE = mediaUrl('banners/gtm-hero.png');
const GPI_BACKGROUND_IMAGE = mediaUrl('banners/gpi-hero.png');

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
      className={`merged-hero merged-hero--stacked${visible ? ' merged-hero--visible' : ''}`}
      aria-label="GPI and GTM brand showcase"
    >
      <div className="merged-hero__stack">
        <div className="merged-hero__pane merged-hero__pane--gtm">
          <img src={GTM_BACKGROUND_IMAGE} alt="" className="merged-hero__pane-img" loading="eager" decoding="async" />
          <div className="merged-hero__pane-tint merged-hero__pane-tint--gtm" />
          <span className="merged-hero__pane-label">GTM · Himalayan Salt</span>
        </div>

        <div className="merged-hero__center">
          <div className="merged-hero__center-glow" aria-hidden="true" />
          <Link to="/collections/all" className="btn btn--primary btn--large merged-hero__cta">
            View all products
          </Link>
        </div>

        <div className="merged-hero__pane merged-hero__pane--gpi">
          <img src={GPI_BACKGROUND_IMAGE} alt="" className="merged-hero__pane-img" loading="eager" decoding="async" />
          <div className="merged-hero__pane-tint merged-hero__pane-tint--gpi" />
          <span className="merged-hero__pane-label">GPI · Spices &amp; Home Care</span>
        </div>
      </div>
    </section>
  );
}
