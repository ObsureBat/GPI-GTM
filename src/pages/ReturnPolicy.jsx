import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export function ReturnPolicy() {
  useEffect(() => {
    document.title = 'Return & Refund Policy | GPI Industries Pvt. Ltd.';
  }, []);

  return (
    <div className="page-width page-section">
      <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <Link to="/">Home</Link> &gt; <span>Return &amp; Refund Policy</span>
      </nav>

      <h1>Return &amp; Refund Policy</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Last updated: August 2026</p>

      <div style={{ lineHeight: '1.8', maxWidth: '800px' }}>
        <section style={{ marginBottom: '2rem' }}>
          <h2>1. 7-Day Return Guarantee</h2>
          <p>
            At GPI Industries Pvt. Ltd., we stand by the quality of our Himalayan salts, authentic Indian spices, and household essentials. If you receive a damaged, defective, or incorrect product, you may request a return or replacement within 7 days of delivery.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>2. Eligibility Criteria</h2>
          <p>
            To be eligible for a return:
          </p>
          <ul>
            <li>The item must be unused, unopened, and in its original packaging.</li>
            <li>Proof of purchase (order ID or invoice) must be provided.</li>
            <li>Damaged or defective items must be reported within 48 hours of delivery with photos.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>3. Refund Process</h2>
          <p>
            Once your returned item is received and inspected, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed to your original payment method within 5–7 business days.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>4. Cancellation Policy</h2>
          <p>
            Orders can be cancelled before dispatch by contacting customer support. Once dispatched, orders cannot be cancelled directly but can be returned upon arrival subject to return eligibility.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2>5. Customer Support</h2>
          <p>
            To initiate a return or refund request, please email <a href="mailto:viveekmd@gpipvtltd.com">viveekmd@gpipvtltd.com</a> or call +91 7078750755 with your order number.
          </p>
        </section>
      </div>
    </div>
  );
}
