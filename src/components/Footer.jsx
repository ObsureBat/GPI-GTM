import { Link } from 'react-router-dom';

const MAP_EMBED_SRC =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d845.3579647959515!2d77.2671830672388!3d29.115912176457723!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390c4b72d10a1eef%3A0xef7f9e3d5ce7154f!2sGTM%20GROUP!5e0!3m2!1sen!2sin!4v1783234707764!5m2!1sen!2sin';

export function Footer({ config }) {
  const { contact, social, brandName, brandDescription } = config;
  const email = contact?.email || 'care@gpipvtltd.com';

  return (
    <footer className="footer footer--flux">
      <div className="footer__inner page-width">
        <div className="footer__grid">
          <div className="reveal">
            <div className="pill">GPI · GTM</div>
            <h2 className="footer__title">{brandName}</h2>
            <p className="footer__text">
              {brandDescription ||
                'Everyday spices, salts, and home-care staples crafted for Indian kitchens and beyond.'}
            </p>
          </div>
          <div className="footer__col reveal">
            <h3 className="footer__heading">Shop</h3>
            <Link className="footer__link" to="/collections/all">
              All products
            </Link>
            <Link className="footer__link" to="/collections/salt-products">
              Salt products
            </Link>
            <Link className="footer__link" to="/collections/spices-products">
              Spices products
            </Link>
            <Link className="footer__link" to="/collections/cleaning-products">
              Cleaning products
            </Link>
          </div>
          <div className="footer__col reveal">
            <h3 className="footer__heading">Contact</h3>
            <a className="footer__link" href={`mailto:${email}`}>
              {email}
            </a>
            {contact?.phone && (
              <a className="footer__link" href={`tel:${contact.phone.replace(/\s/g, '')}`}>
                {contact.phone}
              </a>
            )}
            {contact?.location && <span className="footer__muted">{contact.location}</span>}
            <div className="footer__map">
              <iframe
                src={MAP_EMBED_SRC}
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="GPI office location"
              />
            </div>
          </div>
          <div className="footer__col reveal">
            <h3 className="footer__heading">Newsletter</h3>
            <form
              className="footer__form"
              onSubmit={(e) => {
                e.preventDefault();
                alert('Thanks — connect a mail provider in production.');
              }}
            >
              <div className="form-row">
                <input className="input" type="email" required placeholder="Email address" aria-label="Email" />
                <button type="submit" className="btn btn--primary">
                  Subscribe
                </button>
              </div>
            </form>
            <span className="footer__muted">No spam. Just recipes, launches, and offers.</span>
            <div className="footer__social">
              {social?.instagram && (
                <a href={social.instagram} target="_blank" rel="noreferrer">
                  Instagram
                </a>
              )}
              {social?.facebook && (
                <a href={social.facebook} target="_blank" rel="noreferrer">
                  Facebook
                </a>
              )}
              {social?.youtube && (
                <a href={social.youtube} target="_blank" rel="noreferrer">
                  YouTube
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <span className="footer__muted">
            © {new Date().getFullYear()} {brandName}. Built as a standalone storefront (Node + React + SQL).
          </span>
        </div>
      </div>
    </footer>
  );
}
