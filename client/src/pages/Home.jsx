import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SplitHero } from '../components/SplitHero.jsx';
import { HimalayanSaltModel } from '../components/HimalayanSaltModel.jsx';

const whyFeatures = [
  {
    title: '100% Natural Ingredients',
    text: 'Sourced from authentic Himalayan regions and trusted suppliers.',
    icon: '🌿',
  },
  {
    title: 'Premium Quality Control',
    text: 'Carefully processed and packed to maintain purity and freshness.',
    icon: '✓',
  },
  {
    title: 'Authentic Indian Taste',
    text: 'Traditional salts and spices crafted for real flavor.',
    icon: '🍛',
  },
  {
    title: 'Trusted Manufacturing',
    text: 'Modern packaging with strict hygiene and quality standards.',
    icon: '🏭',
  },
  {
    title: 'Rich in Natural Minerals',
    text: 'Especially in Himalayan salts like Pink, Rock, and Black salt.',
    icon: '💎',
  },
  {
    title: 'Customer First Approach',
    text: 'Quality products designed for everyday healthy living.',
    icon: '❤️',
  },
];

const journeySteps = [
  {
    title: 'Born in the Himalayan Mountains',
    text: 'Naturally formed deep within ancient mountains, preserving pure mineral-rich structure.',
    img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
  },
  {
    title: 'Pure and Unprocessed',
    text: 'Carefully mined and minimally processed to retain natural minerals.',
    img: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=600&q=80',
  },
  {
    title: 'Rich in Natural Minerals',
    text: 'Trace minerals like calcium, potassium, and magnesium for unique taste.',
    img: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=600&q=80',
  },
  {
    title: 'From Mountains to Your Kitchen',
    text: 'Enhancing meals worldwide with purity and authenticity.',
    img: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80',
  },
];

export function Home() {
  const saltRotationMs = 20000;
  const [saltModelReady, setSaltModelReady] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!saltModelReady) return undefined;
    const interval = setInterval(() => {
      setActiveStep((s) => (s + 1) % journeySteps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [saltModelReady]);

  return (
    <>
      <section className="home-layout">
        <div className="home-layout__grid">
          <div className="home-layout__col home-layout__col--hero">
            <SplitHero />
          </div>

          <div className={`home-layout__col home-layout__col--journey section journey${saltModelReady ? ' home-layout__col--journey-ready' : ''}`}>
            <div className="home-layout__journey-inner">
              <span className="journey__badge reveal">Premium Quality</span>
              <h2 className="journey__title">From Himalayan Mountains to Your Kitchen</h2>
              <p className="journey__subtitle">
                Discover the authentic journey of pure Himalayan pink salt — from ancient mountains to your table.
              </p>

              <div className={`journey-showcase journey-showcase--sidebar${saltModelReady ? ' journey-showcase--active' : ''}`}>
                <div className="journey-showcase__visual">
                  <div className="journey-showcase__model">
                    <HimalayanSaltModel rotationDurationMs={saltRotationMs} onReady={() => setSaltModelReady(true)} />
                  </div>
                </div>

                <div className="journey-showcase__content reveal">
                  <div className="journey-showcase__steps">
                    {journeySteps.map((s, idx) => (
                      <button
                        key={s.title}
                        type="button"
                        className={`journey-showcase__step-nav${activeStep === idx ? ' active' : ''}`}
                        onClick={() => setActiveStep(idx)}
                        aria-label={`Step ${idx + 1}`}
                      >
                        <span className="num">{idx + 1}</span>
                        <span className="dot" />
                      </button>
                    ))}
                  </div>

                  <div key={activeStep} className="journey-showcase__active-step">
                    <span className="journey-showcase__step-num">Stage 0{activeStep + 1}</span>
                    <h3 className="journey-showcase__step-title">{journeySteps[activeStep].title}</h3>
                    <p className="journey-showcase__step-text">{journeySteps[activeStep].text}</p>
                    <div className="journey-showcase__step-media">
                      <img src={journeySteps[activeStep].img} alt="" className="journey-showcase__step-img" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="journey__cta reveal">
                <h3>Experience the Purity of Himalayan Salt</h3>
                <Link to="/collections/salt-products" className="btn btn--gold btn--large">
                  Shop Himalayan Salt
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section why">
        <div className="page-width">
          <header className="section__head reveal">
            <h2>Why Choose Our Products</h2>
            <p>Pure ingredients, trusted quality, and authentic taste crafted with care.</p>
          </header>
          <div className="why__grid">
            {whyFeatures.map((f, idx) => (
              <article key={f.title} className="why__card reveal reveal--stagger" style={{ '--stagger': idx }}>
                <div className="why__iconWrap" aria-hidden="true">
                  <span className="why__icon">{f.icon}</span>
                  <span className="why__num">{idx + 1}</span>
                </div>
                <h3 className="why__title">{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section signature-salts">
        <div className="page-width">
          <header className="section__head reveal">
            <span className="pill">Signature Collection</span>
            <h2>Premium Himalayan Salts</h2>
            <p>Experience the purest minerals from the heart of the Himalayas.</p>
          </header>

          <div className="signature-grid">
            <article className="salt-card salt-card--pink reveal">
              <div className="salt-card__visual">
                <img
                  src="https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=900&q=80"
                  alt="Pure Himalayan Pink Salt"
                  className="salt-card__img"
                />
                <div className="salt-card__overlay" />
                <div className="salt-card__badge">Naturally Rich</div>
              </div>
              <div className="salt-card__content">
                <div className="salt-card__header">
                  <span className="salt-card__sub">Perfectly Pure</span>
                  <h3 className="salt-card__title">Pure Himalayan Pink Salt</h3>
                </div>
                <p className="salt-card__desc">
                  Our GTM Himalayan Pink Salt is naturally sourced from ancient mines and carefully processed
                  for natural purity and essential minerals.
                </p>
                <ul className="salt-card__list">
                  <li>100% Natural &amp; Unrefined</li>
                  <li>Mineral Rich Crystal Salt</li>
                  <li>Perfect for Cooking &amp; Seasoning</li>
                  <li>Premium Food Grade Quality</li>
                </ul>
                <Link to="/collections/salt-products" className="btn btn--pink btn--large btn--wide">
                  Shop Pink Salt <span className="arrow">→</span>
                </Link>
              </div>
            </article>

            <article className="salt-card salt-card--black reveal">
              <div className="salt-card__visual">
                <img
                  src="https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=900&q=80"
                  alt="Authentic Indian Black Salt"
                  className="salt-card__img"
                />
                <div className="salt-card__overlay" />
                <div className="salt-card__badge">Bold Flavor</div>
              </div>
              <div className="salt-card__content">
                <div className="salt-card__header">
                  <span className="salt-card__sub">Traditional Purity</span>
                  <h3 className="salt-card__title">Authentic Indian Black Salt</h3>
                </div>
                <p className="salt-card__desc">
                  GTM Black Salt (Kala Namak) delivers the tangy flavor loved in Indian cuisine — chaats,
                  fruits, and traditional recipes.
                </p>
                <ul className="salt-card__list">
                  <li>Authentic Indian Taste</li>
                  <li>Natural Mineral Salt</li>
                  <li>Perfect for Chaats &amp; Fruits</li>
                  <li>Hygienically Packed Premium Quality</li>
                </ul>
                <Link to="/collections/salt-products" className="btn btn--gold btn--large btn--wide">
                  Shop Black Salt <span className="arrow">→</span>
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="banner-cta">
        <div className="banner-cta__bg" />
        <div className="banner-cta__grain" aria-hidden="true" />
        <div className="banner-cta__inner page-width reveal">
          <span className="banner-cta__badge">GPI / GTM Collection</span>
          <h2>Premium Products, Naturally Crafted</h2>
          <p>Explore premium salts, spices, and essentials made for authentic taste.</p>
          <Link to="/collections/all" className="btn btn--light btn--shine">
            Shop now <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
