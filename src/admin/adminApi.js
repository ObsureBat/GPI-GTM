const base = '';

async function adminFetch(path, options = {}) {
  const res = await fetch(`${base}/api/admin${path}`, {
    credentials: 'include',
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    ...options,
    body:
      options.body instanceof FormData || options.body == null
        ? options.body
        : JSON.stringify(options.body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText || 'Request failed');
  return data;
}

export const adminApi = {
  getStats: () => adminFetch('/stats'),
  getProducts: () => adminFetch('/products'),
  createProduct: (body) => adminFetch('/products', { method: 'POST', body }),
  updateProduct: (id, body) => adminFetch(`/products/${id}`, { method: 'PATCH', body }),
  deleteProduct: (id) => adminFetch(`/products/${id}`, { method: 'DELETE', body: {} }),
  uploadImage: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return adminFetch('/upload', { method: 'POST', body: fd });
  },
  getOrders: (status) =>
    adminFetch(status ? `/orders?status=${encodeURIComponent(status)}` : '/orders'),
  getOrder: (id) => adminFetch(`/orders/${id}`),
  updateOrderStatus: (id, status) =>
    adminFetch(`/orders/${id}`, { method: 'PATCH', body: { status } }),
  getCategories: () => adminFetch('/categories'),
  createCategory: (body) => adminFetch('/categories', { method: 'POST', body }),
  updateCategory: (id, body) => adminFetch(`/categories/${id}`, { method: 'PATCH', body }),
  deleteCategory: (id) => adminFetch(`/categories/${id}`, { method: 'DELETE', body: {} }),
};
