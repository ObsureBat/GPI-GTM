import { useEffect, useState } from 'react';
import { adminApi } from '../adminApi.js';
import { formatInr, mediaUrl } from '../../utils.js';

const EMPTY = {
  title: '',
  handle: '',
  description: '',
  price_cents: '',
  brand: 'gpi',
  stock_qty: 100,
  sort_order: 9999,
  available: true,
  image_url: '',
};

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        adminApi.getProducts(),
        adminApi.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats.filter((c) => c.handle !== 'all'));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setForm({ ...EMPTY, category_ids: [] });
  }

  function openEdit(p) {
    setForm({
      id: p.id,
      title: p.title,
      handle: p.handle,
      description: p.description || '',
      price_cents: p.price_cents / 100,
      brand: p.brand,
      stock_qty: p.stock_qty ?? 100,
      sort_order: p.sort_order ?? 9999,
      available: !!p.available,
      image_url: p.image_url || '',
      category_ids: [],
    });
  }

  async function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !form) return;
    setUploading(true);
    setError('');
    try {
      const { image_url } = await adminApi.uploadImage(file);
      setForm((f) => ({ ...f, image_url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function onSave(e) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    setError('');
    const body = {
      title: form.title.trim(),
      handle: form.handle.trim() || undefined,
      description: form.description,
      price_cents: Math.round(Number(form.price_cents) * 100),
      brand: form.brand,
      stock_qty: Number(form.stock_qty),
      sort_order: Number(form.sort_order),
      available: form.available,
      image_url: form.image_url || null,
      category_ids: form.category_ids || [],
    };
    try {
      if (form.id) await adminApi.updateProduct(form.id, body);
      else await adminApi.createProduct(body);
      setForm(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleStock(p) {
    try {
      await adminApi.updateProduct(p.id, { available: !p.available });
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function removeProduct(p) {
    if (!confirm(`Delete "${p.title}"?`)) return;
    setNotice('');
    try {
      const result = await adminApi.deleteProduct(p.id);
      await load();
      setError('');
      if (result?.archived) {
        setNotice(result.message || 'Product was archived because it appears in past orders.');
      }
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <h1>Products</h1>
          <p>Add, edit, and manage catalog items.</p>
        </div>
        <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate}>
          + Add product
        </button>
      </header>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}
      {notice && <p className="admin-alert admin-alert--info">{notice}</p>}

      {form && (
        <div className="admin-modal-backdrop" onClick={() => setForm(null)}>
          <form className="admin-modal" onSubmit={onSave} onClick={(e) => e.stopPropagation()}>
            <h2>{form.id ? 'Edit product' : 'Add product'}</h2>
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Title</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </label>
              <label className="admin-field">
                <span>Handle (URL slug)</span>
                <input
                  value={form.handle}
                  onChange={(e) => setForm({ ...form, handle: e.target.value })}
                  placeholder="auto-generated if empty"
                />
              </label>
              <label className="admin-field">
                <span>Price (₹)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price_cents}
                  onChange={(e) => setForm({ ...form, price_cents: e.target.value })}
                  required
                />
              </label>
              <label className="admin-field">
                <span>Brand</span>
                <select
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                >
                  <option value="gpi">GPI</option>
                  <option value="gtm">GTM</option>
                </select>
              </label>
              <label className="admin-field">
                <span>Stock qty</span>
                <input
                  type="number"
                  min="0"
                  value={form.stock_qty}
                  onChange={(e) => setForm({ ...form, stock_qty: e.target.value })}
                />
              </label>
              <label className="admin-field">
                <span>Sort order</span>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                />
              </label>
              <label className="admin-field admin-field--full">
                <span>Description</span>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </label>
              <label className="admin-field admin-field--full">
                <span>Image</span>
                <input type="file" accept="image/*" onChange={onUpload} disabled={uploading} />
                {form.image_url && (
                  <img
                    className="admin-form-preview"
                    src={mediaUrl(form.image_url)}
                    alt=""
                  />
                )}
              </label>
              <label className="admin-field admin-field--check">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => setForm({ ...form, available: e.target.checked })}
                />
                <span>In stock (available for sale)</span>
              </label>
            </div>
            <div className="admin-modal__actions">
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setForm(null)}>
                Cancel
              </button>
              <button type="submit" className="admin-btn admin-btn--primary" disabled={busy || uploading}>
                {busy ? 'Saving…' : 'Save product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="admin-page--loading"><span className="spinner" /></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="admin-product-cell">
                      {p.image_url && <img src={mediaUrl(p.image_url)} alt="" width={40} height={40} />}
                      <div>
                        <strong>{p.title}</strong>
                        <small>{p.handle}</small>
                      </div>
                    </div>
                  </td>
                  <td>{formatInr(p.price_cents)}</td>
                  <td>{p.stock_qty ?? '—'}</td>
                  <td>
                    <span className={`admin-badge ${p.available ? 'admin-badge--ok' : 'admin-badge--danger'}`}>
                      {p.available ? 'In stock' : 'Out of stock'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button type="button" className="admin-btn admin-btn--sm" onClick={() => openEdit(p)}>
                        Edit
                      </button>
                      <button type="button" className="admin-btn admin-btn--sm admin-btn--ghost" onClick={() => toggleStock(p)}>
                        {p.available ? 'Disable' : 'Enable'}
                      </button>
                      <button type="button" className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => removeProduct(p)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
