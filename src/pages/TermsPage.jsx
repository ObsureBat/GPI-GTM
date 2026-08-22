import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export function TermsPage() {
  useEffect(() => {
    document.title = 'Terms & Conditions | GPI Industries Pvt. Ltd.';
  }, []);

  return (
    <div className="page-width page-section">
      <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <Link to="/">Home</Link> &gt; <span>Terms &amp; Conditions</span>
      </nav>

      <h1>Terms &amp; Conditions</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Last updated: August 2026</p>

      <div style={{ lineHeight: '1.8', maxWidth: '800px' }}>
        <section style={{ marginBottom: '2rem' }}>
          <h2>1. Overview</h2>
          <p>
            This website is operated by GPI Industries Pvt. Ltd. By accessing our site or purchasing products from us, you agree to be bound by these Terms &amp; Conditions.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>2. Products &amp; Pricing</h2>
          <p>
            Prices for our products are subject to change without notice. All prices are listed in Indian Rupees (INR) and include applicable taxes unless otherwise stated. We reserve the right to limit quantities or refuse service.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>3. Intellectual Property</h2>
          <p>
            All content on this website, including text, graphics, logos, images, and software, is the property of GPI Industries Pvt. Ltd. and is protected by copyright and intellectual property laws.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>4. Governing Law</h2>
          <p>
            These Terms &amp; Conditions shall be governed by and construed in accordance with the laws of India, under the jurisdiction of courts in Uttar Pradesh, India.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>5. Contact Information</h2>
          <p>
            Questions about the Terms &amp; Conditions should be sent to <a href="mailto:viveekmd@gpipvtltd.com">viveekmd@gpipvtltd.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
