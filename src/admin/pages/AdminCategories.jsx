import { useEffect, useState } from 'react';
import { adminApi } from '../adminApi.js';

const EMPTY = { handle: '', title: '', description: '' };

export function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setCategories(await adminApi.getCategories());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSave(e) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    setError('');
    try {
      const body = {
        handle: form.handle.trim() || undefined,
        title: form.title.trim(),
        description: form.description,
      };
      if (form.id) await adminApi.updateCategory(form.id, body);
      else await adminApi.createCategory(body);
      setForm(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeCategory(c) {
    if (c.handle === 'all') return;
    if (!confirm(`Delete category "${c.title}"?`)) return;
    try {
      await adminApi.deleteCategory(c.id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <h1>Categories</h1>
          <p>Organize products into collections.</p>
        </div>
        <button type="button" className="admin-btn admin-btn--primary" onClick={() => setForm({ ...EMPTY })}>
          + Add category
        </button>
      </header>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}

      {form && (
        <div className="admin-modal-backdrop" onClick={() => setForm(null)}>
          <form className="admin-modal" onSubmit={onSave} onClick={(e) => e.stopPropagation()}>
            <h2>{form.id ? 'Edit category' : 'Add category'}</h2>
            <label className="admin-field">
              <span>Title</span>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </label>
            <label className="admin-field">
              <span>Handle</span>
              <input
                value={form.handle}
                onChange={(e) => setForm({ ...form, handle: e.target.value })}
                placeholder="auto-generated if empty"
              />
            </label>
            <label className="admin-field">
              <span>Description</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <div className="admin-modal__actions">
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setForm(null)}>
                Cancel
              </button>
              <button type="submit" className="admin-btn admin-btn--primary" disabled={busy}>
                {busy ? 'Saving…' : 'Save'}
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
                <th>Title</th>
                <th>Handle</th>
                <th>Products</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.title}</strong>
                    {c.description && <small>{c.description}</small>}
                  </td>
                  <td><code>{c.handle}</code></td>
                  <td>{c.product_count ?? 0}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn--sm"
                        onClick={() =>
                          setForm({
                            id: c.id,
                            handle: c.handle,
                            title: c.title,
                            description: c.description || '',
                          })
                        }
                      >
                        Edit
                      </button>
                      {c.handle !== 'all' && (
                        <button
                          type="button"
                          className="admin-btn admin-btn--sm admin-btn--danger"
                          onClick={() => removeCategory(c)}
                        >
                          Delete
                        </button>
                      )}
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
