import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export function PrivacyPolicy() {
  useEffect(() => {
    document.title = 'Privacy Policy | GPI Industries Pvt. Ltd.';
  }, []);

  return (
    <div className="page-width page-section">
      <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <Link to="/">Home</Link> &gt; <span>Privacy Policy</span>
      </nav>

      <h1>Privacy Policy</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Last updated: August 2026</p>

      <div style={{ lineHeight: '1.8', maxWidth: '800px' }}>
        <section style={{ marginBottom: '2rem' }}>
          <h2>1. Information We Collect</h2>
          <p>
            GPI Industries Pvt. Ltd. collects personal information that you provide when creating an account, placing an order, or contacting us. This includes your name, email address, shipping address, telephone number, and payment details.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>2. How We Use Your Information</h2>
          <p>
            We use your personal information strictly to process and fulfill your orders, communicate order updates, improve customer service, and comply with legal requirements.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>3. Data Protection &amp; Security</h2>
          <p>
            We implement industry-standard administrative and technical security measures to protect your personal information against unauthorized access, loss, or misuse.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>4. Third-Party Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We share data only with trusted service partners (such as courier delivery partners and payment gateways) solely to complete transactions.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>5. Contact &amp; Grievance Officer</h2>
          <p>
            If you have questions regarding this Privacy Policy, please email <a href="mailto:viveekmd@gpipvtltd.com">viveekmd@gpipvtltd.com</a> or write to us at Delhi Saharanpur Road, Baraut, Distt. Baghpat, Uttar Pradesh - 250611.
          </p>
        </section>
      </div>
    </div>
  );
}
