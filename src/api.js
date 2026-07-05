const base = '';

async function loadProductsFromJSON() {
  try {
    const response = await fetch('/data/products.json');
    const products = await response.json();
    return products.sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
  } catch {
    return [];
  }
}

let cachedProducts = null;

async function getProducts() {
  if (!cachedProducts) {
    cachedProducts = await loadProductsFromJSON();
  }
  return cachedProducts;
}

function getLocalCartItems() {
  try {
    return JSON.parse(localStorage.getItem('gpi_mock_cart_items') || '[]');
  } catch {
    return [];
  }
}

function setLocalCartItems(items) {
  try {
    localStorage.setItem('gpi_mock_cart_items', JSON.stringify(items));
  } catch {
    // Ignore storage limits/private mode.
  }
}

async function toCart(items) {
  const products = await getProducts();
  const enriched = items
    .map((i) => {
      const p = products.find((x) => x.id === i.product_id);
      if (!p) return null;
      return { ...i, product: p, line_total_cents: p.price_cents * i.quantity };
    })
    .filter(Boolean);

  const subtotal = enriched.reduce((sum, i) => sum + i.line_total_cents, 0);
  const count = enriched.reduce((sum, i) => sum + i.quantity, 0);
  return { items: enriched, subtotal_cents: subtotal, item_count: count };
}

function matchesWeight(handle, title, pattern) {
  const text = `${handle} ${title}`.toLowerCase();
  if (pattern === '1kg') return text.includes('1kg') || text.includes('1 kg');
  if (pattern === '200gm') return text.includes('200');
  if (pattern === '100gm') return text.includes('100') && text.includes('salt');
  if (pattern === '500gm') return text.includes('500');
  if (pattern === '50gm') return text.includes('50');
  return false;
}

function isSaltProduct(p) {
  const text = `${p.handle} ${p.title}`.toLowerCase();
  return (
    (text.includes('salt') || text.includes('puiro') || text.includes('iodine')) &&
    !text.includes('masala')
  );
}

function isSpiceProduct(p) {
  return p.handle.includes('masala');
}

function isCleaningProduct(p) {
  return p.handle.includes('detergent');
}

function filterProducts(products, handle) {
  const sorted = [...products].sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
  if (handle === 'all') return sorted;
  if (handle === 'salt-products') return sorted.filter(isSaltProduct);
  if (handle === 'spices-products') return sorted.filter(isSpiceProduct);
  if (handle === 'cleaning-products') return sorted.filter(isCleaningProduct);
  if (handle === 'salt-1kg') {
    return sorted.filter((p) => isSaltProduct(p) && matchesWeight(p.handle, p.title, '1kg'));
  }
  if (handle === 'salt-200gm') {
    return sorted.filter((p) => isSaltProduct(p) && matchesWeight(p.handle, p.title, '200gm'));
  }
  if (handle === 'salt-100gm') {
    return sorted.filter((p) => isSaltProduct(p) && matchesWeight(p.handle, p.title, '100gm'));
  }
  if (handle === 'salt-500gm') {
    return sorted.filter((p) => isSaltProduct(p) && matchesWeight(p.handle, p.title, '500gm'));
  }
  if (handle === 'spices-100gm') {
    return sorted.filter((p) => p.handle.includes('masala') && matchesWeight(p.handle, p.title, '100gm'));
  }
  if (handle === 'spices-50gm') {
    return sorted.filter((p) => p.handle.includes('masala') && matchesWeight(p.handle, p.title, '50gm'));
  }
  if (handle === 'cleaning-1kg') {
    return sorted.filter((p) => p.handle.includes('detergent') && matchesWeight(p.handle, p.title, '1kg'));
  }
  if (handle === 'cleaning-500gm') {
    return sorted.filter((p) => p.handle.includes('detergent') && matchesWeight(p.handle, p.title, '500gm'));
  }
  return [];
}

const COLLECTION_DEFS = [
  { handle: 'all', title: 'All Products', description: 'Browse every GPI and GTM product.' },
  { handle: 'salt-products', title: 'Salt Products', description: 'Himalayan, pink, black, and specialty salts.' },
  { handle: 'salt-1kg', title: 'Salt — 1kg', description: '1kg salt packs.' },
  { handle: 'salt-200gm', title: 'Salt — 200gm', description: '200gm salt packs.' },
  { handle: 'salt-100gm', title: 'Salt — 100gm', description: '100gm salt packs.' },
  { handle: 'salt-500gm', title: 'Salt — 500gm', description: '500gm salt packs.' },
  { handle: 'spices-products', title: 'Spices Products', description: 'Authentic Indian masalas and spices.' },
  { handle: 'spices-100gm', title: 'Spices — 100gm', description: '100gm spice and masala packs.' },
  { handle: 'spices-50gm', title: 'Spices — 50gm', description: '50gm spice and masala packs.' },
  { handle: 'cleaning-products', title: 'Cleaning Products', description: 'GPI detergent powders for home care.' },
  { handle: 'cleaning-1kg', title: 'Cleaning — 1kg', description: '1kg detergent packs.' },
  { handle: 'cleaning-500gm', title: 'Cleaning — 500gm', description: '500gm detergent packs.' },
];

async function mockResponse(path, options = {}) {
  const url = new URL(path, 'https://local.mock');
  const pathname = url.pathname;
  const method = (options.method || 'GET').toUpperCase();

  if (pathname === '/api/store-config') {
    return {
      brandName: 'GPI Industries Pvt. Ltd.',
      brandDescription:
        'GPI Industries Pvt. Ltd. delivers high-quality Himalayan salts, authentic Indian spices, and household essentials.',
      announcement: { mainText: 'WELCOME TO THE STORE', subText: 'GPI INDUSTRIES PVT. LTD.' },
      contact: {
        phone: '+91 7078750755',
        email: 'viveekmd@gpipvtltd.com',
        location: 'Delhi Saharanpur Road, Baraut, Distt. Baghpat, Uttar Pradesh - 250611',
      },
      social: {
        facebook: 'https://facebook.com/gpiindustries',
        instagram: 'https://instagram.com/gpiindustries',
        youtube: 'https://youtube.com/@gpiindustries',
      },
      currency: 'INR',
      currencySymbol: '₹',
    };
  }

  const products = await getProducts();

  if (pathname === '/api/products') return products;
  if (pathname.startsWith('/api/products/')) {
    const handle = decodeURIComponent(pathname.replace('/api/products/', ''));
    const row = products.find((p) => p.handle === handle);
    if (!row) throw new Error('Product not found');
    return row;
  }

  if (pathname === '/api/collections') {
    return COLLECTION_DEFS.map((c) => ({
      ...c,
      products: filterProducts(products, c.handle),
    }));
  }
  if (pathname.startsWith('/api/collections/')) {
    const handle = decodeURIComponent(pathname.replace('/api/collections/', ''));
    const def = COLLECTION_DEFS.find((c) => c.handle === handle);
    if (!def) throw new Error('Collection not found');
    return { ...def, products: filterProducts(products, handle) };
  }

  if (pathname === '/api/cart' && method === 'GET') {
    return toCart(getLocalCartItems());
  }
  if (pathname === '/api/cart/add' && method === 'POST') {
    const body = JSON.parse(options.body || '{}');
    const items = getLocalCartItems();
    const existing = items.find((i) => i.product_id === Number(body.product_id));
    if (existing) existing.quantity += Math.max(1, Number(body.quantity || 1));
    else items.push({ product_id: Number(body.product_id), quantity: Math.max(1, Number(body.quantity || 1)) });
    setLocalCartItems(items);
    return toCart(items);
  }
  if (pathname === '/api/cart/update' && method === 'POST') {
    const body = JSON.parse(options.body || '{}');
    const productId = Number(body.product_id);
    const quantity = Math.max(0, Number(body.quantity || 0));
    let items = getLocalCartItems();
    items =
      quantity > 0
        ? items.map((i) => (i.product_id === productId ? { ...i, quantity } : i))
        : items.filter((i) => i.product_id !== productId);
    setLocalCartItems(items);
    return toCart(items);
  }

  if (pathname === '/api/search') {
    const q = (url.searchParams.get('q') || '').trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => (p.title + ' ' + p.description).toLowerCase().includes(q));
  }

  if (pathname === '/api/checkout' && method === 'POST') {
    return { ok: true, order_id: 'MOCK-' + Date.now() };
  }

  throw new Error('Mock API route not found: ' + pathname);
}

async function json(path, options = {}) {
  try {
    const res = await fetch(`${base}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || res.statusText);
    }
    return await res.json();
  } catch {
    return mockResponse(path, options);
  }
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
};
