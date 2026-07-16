import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../adminApi.js';
import { formatInr, mediaUrl } from '../../utils.js';

function StatCard({ label, value, hint, tone = 'default' }) {
  return (
    <article className={`admin-stat admin-stat--${tone}`}>
      <p className="admin-stat__label">{label}</p>
      <p className="admin-stat__value">{value}</p>
      {hint && <p className="admin-stat__hint">{hint}</p>}
    </article>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .getStats()
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="admin-page">
        <p className="admin-alert admin-alert--error">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="admin-page admin-page--loading">
        <span className="spinner" />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of sales, orders, and inventory.</p>
        </div>
      </header>

      <section className="admin-section">
        <h2 className="admin-section__title">Analytics</h2>
        <div className="admin-stat-grid admin-stat-grid--4">
          <StatCard label="Total Sales" value={formatInr(stats.total_sales_cents)} tone="sales" />
          <StatCard label="Visitors" value={stats.visitors.toLocaleString('en-IN')} tone="visitors" />
          <StatCard label="Orders" value={stats.order_count.toLocaleString('en-IN')} tone="orders" />
          <StatCard
            label="Products Sold"
            value={stats.products_sold.toLocaleString('en-IN')}
            tone="products"
          />
        </div>
      </section>

      <section className="admin-section">
        <h2 className="admin-section__title">Order summary</h2>
        <div className="admin-stat-grid admin-stat-grid--3">
          <StatCard
            label="Pending Orders"
            value={stats.pending_orders}
            hint="Awaiting payment or fulfillment"
            tone="warn"
          />
          <StatCard
            label="Completed Orders"
            value={stats.completed_orders}
            hint="Paid, shipped, or delivered"
            tone="ok"
          />
          <StatCard label="Revenue" value={formatInr(stats.revenue_cents)} hint="From completed orders" />
        </div>
        <div className="admin-section__actions">
          <Link to="/admin/orders" className="admin-btn admin-btn--secondary">
            View all orders
          </Link>
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section__row">
          <h2 className="admin-section__title">Low stock products</h2>
          <Link to="/admin/products" className="admin-link">
            Manage products
          </Link>
        </div>
        {stats.low_stock.length === 0 ? (
          <p className="admin-empty">All products are well stocked.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.low_stock.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="admin-product-cell">
                        {p.image_url && (
                          <img src={mediaUrl(p.image_url)} alt="" width={36} height={36} />
                        )}
                        <span>{p.title}</span>
                      </div>
                    </td>
                    <td>{p.brand?.toUpperCase()}</td>
                    <td>{p.stock_qty ?? '—'}</td>
                    <td>
                      <span
                        className={`admin-badge ${p.available ? 'admin-badge--warn' : 'admin-badge--danger'}`}
                      >
                        {p.available ? 'Low stock' : 'Out of stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
