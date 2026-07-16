import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../adminApi.js';
import { formatInr } from '../../utils.js';

const STATUS_OPTIONS = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

function statusClass(status) {
  if (status === 'pending') return 'admin-badge--warn';
  if (status === 'cancelled') return 'admin-badge--danger';
  if (status === 'delivered') return 'admin-badge--ok';
  return 'admin-badge--info';
}

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await adminApi.getOrders();
      setOrders(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return orders;
    if (filter === 'completed') {
      return orders.filter((o) => ['paid', 'shipped', 'delivered'].includes(o.status));
    }
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const summary = useMemo(() => {
    const pending = orders.filter((o) => o.status === 'pending').length;
    const completed = orders.filter((o) =>
      ['paid', 'shipped', 'delivered'].includes(o.status)
    ).length;
    const revenue = orders
      .filter((o) => ['paid', 'shipped', 'delivered'].includes(o.status))
      .reduce((s, o) => s + o.total_cents, 0);
    return { pending, completed, revenue };
  }, [orders]);

  async function openOrder(id) {
    try {
      const data = await adminApi.getOrder(id);
      setSelected(data);
    } catch (e) {
      setError(e.message);
    }
  }

  async function changeStatus(id, status) {
    try {
      await adminApi.updateOrderStatus(id, status);
      await load();
      if (selected?.id === id) {
        const data = await adminApi.getOrder(id);
        setSelected(data);
      }
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <h1>Orders</h1>
          <p>Track pending and completed orders.</p>
        </div>
      </header>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}

      <div className="admin-stat-grid admin-stat-grid--3">
        <article className="admin-stat admin-stat--warn">
          <p className="admin-stat__label">Pending</p>
          <p className="admin-stat__value">{summary.pending}</p>
        </article>
        <article className="admin-stat admin-stat--ok">
          <p className="admin-stat__label">Completed</p>
          <p className="admin-stat__value">{summary.completed}</p>
        </article>
        <article className="admin-stat admin-stat--sales">
          <p className="admin-stat__label">Revenue</p>
          <p className="admin-stat__value">{formatInr(summary.revenue)}</p>
        </article>
      </div>

      <div className="admin-tabs">
        {[
          ['all', 'All'],
          ['pending', 'Pending'],
          ['completed', 'Completed'],
          ['cancelled', 'Cancelled'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={`admin-tab${filter === value ? ' admin-tab--active' : ''}`}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-page--loading"><span className="spinner" /></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>City</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>
                    <div>
                      <strong>{o.full_name}</strong>
                      <small>{o.email}</small>
                    </div>
                  </td>
                  <td>{o.city || '—'}</td>
                  <td>{formatInr(o.total_cents)}</td>
                  <td>
                    <span className={`admin-badge ${statusClass(o.status)}`}>{o.status}</span>
                  </td>
                  <td>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                  <td>
                    <button type="button" className="admin-btn admin-btn--sm" onClick={() => openOrder(o.id)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="admin-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="admin-modal admin-modal--wide" onClick={(e) => e.stopPropagation()}>
            <h2>Order #{selected.id}</h2>
            <div className="admin-detail-grid">
              <div>
                <h3>Customer</h3>
                <p>{selected.full_name}</p>
                <p>{selected.email}</p>
                <p>{selected.phone || '—'}</p>
              </div>
              <div>
                <h3>Shipping</h3>
                <p>{selected.address_line1}</p>
                {selected.address_line2 && <p>{selected.address_line2}</p>}
                <p>
                  {selected.city}, {selected.state} {selected.postal_code}
                </p>
              </div>
              <div>
                <h3>Status</h3>
                <select
                  value={selected.status}
                  onChange={(e) => changeStatus(selected.id, e.target.value)}
                  className="admin-select"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <p className="admin-detail-total">Total: {formatInr(selected.total_cents)}</p>
              </div>
            </div>
            <h3>Items</h3>
            <ul className="admin-order-items">
              {selected.items?.map((it) => (
                <li key={it.id}>
                  <span>{it.title_snapshot}</span>
                  <span>
                    ×{it.quantity} — {formatInr(it.price_cents * it.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="admin-modal__actions">
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
