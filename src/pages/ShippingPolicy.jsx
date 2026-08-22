import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export function ShippingPolicy() {
  useEffect(() => {
    document.title = 'Shipping & Delivery Policy | GPI Industries Pvt. Ltd.';
  }, []);

  return (
    <div className="page-width page-section">
      <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <Link to="/">Home</Link> &gt; <span>Shipping &amp; Delivery Policy</span>
      </nav>

      <h1>Shipping &amp; Delivery Policy</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Last updated: August 2026</p>

      <div style={{ lineHeight: '1.8', maxWidth: '800px' }}>
        <section style={{ marginBottom: '2rem' }}>
          <h2>1. Processing &amp; Dispatch</h2>
          <p>
            All orders placed with GPI Industries Pvt. Ltd. are processed within 1–2 business days (excluding weekends and public holidays). You will receive a confirmation message once your order has been dispatched.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>2. Delivery Timelines &amp; Coverage</h2>
          <p>
            We deliver products across India. Standard delivery typically takes 3 to 7 business days depending on your location:
          </p>
          <ul>
            <li><strong>Metro Cities:</strong> 3–5 business days</li>
            <li><strong>Rest of India:</strong> 5–7 business days</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>3. Shipping Charges</h2>
          <p>
            We offer standard shipping on eligible orders across India. Shipping fees (if applicable) are clearly displayed during checkout prior to payment.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>4. Tracking Your Order</h2>
          <p>
            Once your order is shipped, tracking details will be sent to your registered email address or phone number. You can track your shipment live using the provided tracking link.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>5. Contact Us</h2>
          <p>
            For any shipping inquiries, please email us at <a href="mailto:viveekmd@gpipvtltd.com">viveekmd@gpipvtltd.com</a> or call +91 7078750755.
          </p>
        </section>
      </div>
    </div>
  );
}
