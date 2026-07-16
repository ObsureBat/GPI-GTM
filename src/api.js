/** Storefront API — Cloudflare Worker (D1 + R2 CDN only). No local JSON/mock fallback. */
async function json(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || res.statusText);
  }
  return res.json();
}

export const api = {
  getConfig: () => json('/api/store-config'),
  getProducts: (params = '') => json(`/api/products${params}`),
  getProduct: (handle) => json('/api/products/' + encodeURIComponent(handle)),
  getCollections: () => json('/api/collections'),
  getCollection: (handle) => json('/api/collections/' + encodeURIComponent(handle)),
  getCart: () => json('/api/cart'),
  addToCart: (product_id, quantity = 1) =>
    json('/api/cart/add', { method: 'POST', body: JSON.stringify({ product_id, quantity }) }),
  updateCart: (product_id, quantity) =>
    json('/api/cart/update', { method: 'POST', body: JSON.stringify({ product_id, quantity }) }),
  search: (q) => json('/api/search?q=' + encodeURIComponent(q)),
  checkout: (payload) =>
    json('/api/checkout', { method: 'POST', body: JSON.stringify(payload) }),
  getReviews: (handle) => json('/api/products/' + encodeURIComponent(handle) + '/reviews'),
  submitReview: (handle, payload) =>
    json('/api/products/' + encodeURIComponent(handle) + '/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
