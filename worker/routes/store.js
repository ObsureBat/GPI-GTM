import { json, parseBody, getAuthUser } from '../auth/middleware.js';
import { mediaUrl } from '../utils.js';
import { readCookie } from '../auth/cookies.js';

const CART_COOKIE = 'gpi_sid';
const CART_MAX_AGE = 60 * 24 * 60 * 60;

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

function withMedia(row, env) {
  if (!row) return row;
  return { ...row, image_url: mediaUrl(row.image_url, env) };
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
  return (p.handle || '').includes('masala') || (p.title || '').toLowerCase().includes('masala');
}

function isCleaningProduct(p) {
  return (p.handle || '').includes('detergent') || (p.title || '').toLowerCase().includes('detergent');
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
    return sorted.filter((p) => isSpiceProduct(p) && matchesWeight(p.handle, p.title, '100gm'));
  }
  if (handle === 'spices-50gm') {
    return sorted.filter((p) => isSpiceProduct(p) && matchesWeight(p.handle, p.title, '50gm'));
  }
  if (handle === 'cleaning-1kg') {
    return sorted.filter((p) => isCleaningProduct(p) && matchesWeight(p.handle, p.title, '1kg'));
  }
  if (handle === 'cleaning-500gm') {
    return sorted.filter((p) => isCleaningProduct(p) && matchesWeight(p.handle, p.title, '500gm'));
  }
  return [];
}

function cartCookieHeader(sid, request) {
  const secure = new URL(request.url).protocol === 'https:';
  const parts = [
    `${CART_COOKIE}=${encodeURIComponent(sid)}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${CART_MAX_AGE}`,
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

async function ensureCartSession(request, env) {
  let sid = readCookie(request, CART_COOKIE);
  let setCookie = null;
  if (!sid) {
    sid = crypto.randomUUID();
    setCookie = cartCookieHeader(sid, request);
  }
  await env.DB.prepare('INSERT OR IGNORE INTO cart_sessions (id) VALUES (?)').bind(sid).run();
  return { sid, setCookie };
}

async function loadCart(env, sid) {
  const rows = await env.DB.prepare(
    `SELECT ci.product_id, ci.quantity, p.handle, p.title, p.price_cents, p.image_url, p.brand
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.session_id = ?`
  )
    .bind(sid)
    .all();
  const items = (rows.results || []).map((r) => withMedia(r, env));
  const subtotal = items.reduce((s, r) => s + r.price_cents * r.quantity, 0);
  return {
    items,
    subtotal_cents: subtotal,
    item_count: items.reduce((n, r) => n + r.quantity, 0),
  };
}

function withSetCookie(response, setCookie) {
  if (!setCookie) return response;
  const headers = new Headers(response.headers);
  headers.append('Set-Cookie', setCookie);
  return new Response(response.body, { status: response.status, headers });
}

function buildReviewStats(reviews) {
  const totals = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) totals[r.rating] = (totals[r.rating] || 0) + 1;
  const count = reviews.length;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = count ? sum / count : 0;
  const dist = [5, 4, 3, 2, 1].map((s) => ({ stars: s, count: totals[s] }));
  return { avg, count, dist };
}

function mapReviewRow(row) {
  return {
    id: row.id,
    rating: row.rating,
    title: row.title || '',
    body: row.body || '',
    name: row.user_name || row.reviewer_name || 'Customer',
    created_at: row.created_at,
    date: row.created_at ? row.created_at.slice(0, 10) : '',
  };
}

async function getProductByHandle(env, handle) {
  return env.DB.prepare('SELECT id, handle, title FROM products WHERE handle = ?').bind(handle).first();
}

async function listProductReviews(env, productId) {
  const rows = await env.DB.prepare(
    `SELECT r.id, r.rating, r.title, r.body, r.created_at, r.reviewer_name,
            u.full_name AS user_name
     FROM reviews r
     LEFT JOIN users u ON u.id = r.user_id
     WHERE r.product_id = ?
     ORDER BY r.created_at DESC
     LIMIT 50`
  )
    .bind(productId)
    .all();
  return (rows.results || []).map(mapReviewRow);
}

async function listAvailableProducts(env, brand) {
  let sql = `SELECT id, handle, title, description, price_cents, compare_at_cents, image_url, brand, available, sort_order
             FROM products WHERE available = 1`;
  const binds = [];
  if (brand === 'gtm' || brand === 'gpi') {
    sql += ' AND brand = ?';
    binds.push(brand);
  }
  sql += ' ORDER BY sort_order ASC, title';
  const stmt = env.DB.prepare(sql);
  const rows = binds.length ? await stmt.bind(...binds).all() : await stmt.all();
  return (rows.results || []).map((r) => withMedia(r, env));
}

export async function handleStore(request, env, pathname) {
  const method = request.method;
  const url = new URL(request.url);

  if (pathname === '/api/store-config' && method === 'GET') {
    try {
      await env.DB.prepare(
        `INSERT INTO site_stats (key, value) VALUES ('visitors', 1)
         ON CONFLICT(key) DO UPDATE SET value = value + 1`
      ).run();
    } catch {
      // non-fatal
    }
    return json({
      brandName: 'GPI Industries Pvt. Ltd.',
      brandDescription:
        'GPI Industries Pvt. Ltd. delivers high-quality Himalayan salts, authentic Indian spices, and household essentials crafted with purity, tradition, and trust.',
      announcement: {
        mainText: 'WELCOME TO THE STORE',
        subText: 'GPI INDUSTRIES PVT. LTD.',
      },
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
      cdnUrl: (env.CDN_URL || '').replace(/\/$/, ''),
    });
  }

  if (pathname === '/api/products' && method === 'GET') {
    const brand = url.searchParams.get('brand');
    return json(await listAvailableProducts(env, brand));
  }

  const reviewsMatch = pathname.match(/^\/api\/products\/([^/]+)\/reviews$/);
  if (reviewsMatch) {
    const handle = decodeURIComponent(reviewsMatch[1]);
    const product = await getProductByHandle(env, handle);
    if (!product) return json({ error: 'Product not found' }, 404);

    if (method === 'GET') {
      const reviews = await listProductReviews(env, product.id);
      return json({ reviews, stats: buildReviewStats(reviews) });
    }

    if (method === 'POST') {
      const body = await parseBody(request);
      const title = (body?.title || '').trim();
      const reviewBody = (body?.body || '').trim();
      const rating = Number(body?.rating);

      if (!title || title.length < 3) return json({ error: 'Please add a short title.' }, 400);
      if (!reviewBody || reviewBody.length < 20) {
        return json({ error: 'Please write at least 20 characters.' }, 400);
      }
      if (Number.isNaN(rating) || rating < 1 || rating > 5) {
        return json({ error: 'Rating must be between 1 and 5.' }, 400);
      }

      const auth = await getAuthUser(request, env);
      let userId = null;
      let reviewerName = (body?.name || '').trim();

      if (auth) {
        userId = auth.id;
        const userRow = await env.DB.prepare('SELECT full_name FROM users WHERE id = ?')
          .bind(auth.id)
          .first();
        reviewerName = userRow?.full_name || reviewerName;
      }

      if (!reviewerName || reviewerName.length < 2) {
        return json({ error: 'Please enter your name.' }, 400);
      }

      const result = await env.DB.prepare(
        `INSERT INTO reviews (product_id, user_id, rating, title, body, reviewer_name)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
        .bind(product.id, userId, rating, title, reviewBody, userId ? null : reviewerName)
        .run();

      const row = await env.DB.prepare(
        `SELECT r.id, r.rating, r.title, r.body, r.created_at, r.reviewer_name,
                u.full_name AS user_name
         FROM reviews r
         LEFT JOIN users u ON u.id = r.user_id
         WHERE r.id = ?`
      )
        .bind(result.meta.last_row_id)
        .first();

      return json(mapReviewRow(row), 201);
    }
  }

  if (pathname.startsWith('/api/products/') && method === 'GET') {
    const handle = decodeURIComponent(pathname.replace('/api/products/', ''));
    const row = await env.DB.prepare(
      `SELECT id, handle, title, description, price_cents, compare_at_cents, image_url, brand, available, sort_order, category_id
       FROM products WHERE handle = ?`
    )
      .bind(handle)
      .first();
    if (!row) return json({ error: 'Not found' }, 404);
    return json(withMedia(row, env));
  }

  if (pathname === '/api/collections' && method === 'GET') {
    const products = await listAvailableProducts(env);
    return json(
      COLLECTION_DEFS.map((c) => ({
        ...c,
        products: filterProducts(products, c.handle),
      }))
    );
  }

  if (pathname.startsWith('/api/collections/') && method === 'GET') {
    const handle = decodeURIComponent(pathname.replace('/api/collections/', ''));
    const def = COLLECTION_DEFS.find((c) => c.handle === handle);
    if (!def) return json({ error: 'Collection not found' }, 404);
    const products = await listAvailableProducts(env);
    return json({ ...def, products: filterProducts(products, handle) });
  }

  if (pathname === '/api/search' && method === 'GET') {
    const q = (url.searchParams.get('q') || '').trim();
    if (!q) return json([]);
    const like = `%${q.replace(/%/g, '')}%`;
    const rows = await env.DB.prepare(
      `SELECT id, handle, title, price_cents, image_url, brand
       FROM products
       WHERE available = 1 AND (title LIKE ? OR handle LIKE ? OR description LIKE ?)
       ORDER BY title
       LIMIT 24`
    )
      .bind(like, like, like)
      .all();
    return json((rows.results || []).map((r) => withMedia(r, env)));
  }

  if (pathname === '/api/cart' && method === 'GET') {
    const { sid, setCookie } = await ensureCartSession(request, env);
    return withSetCookie(json(await loadCart(env, sid)), setCookie);
  }

  if (pathname === '/api/cart/add' && method === 'POST') {
    const body = await parseBody(request);
    const pid = Number(body?.product_id);
    const qty = Math.max(1, Math.min(99, Number(body?.quantity) || 1));
    if (!pid) return json({ error: 'product_id required' }, 400);

    const p = await env.DB.prepare('SELECT id FROM products WHERE id = ? AND available = 1')
      .bind(pid)
      .first();
    if (!p) return json({ error: 'Product not found' }, 404);

    const { sid, setCookie } = await ensureCartSession(request, env);
    const existing = await env.DB.prepare(
      'SELECT quantity FROM cart_items WHERE session_id = ? AND product_id = ?'
    )
      .bind(sid, pid)
      .first();
    if (existing) {
      await env.DB.prepare(
        'UPDATE cart_items SET quantity = ? WHERE session_id = ? AND product_id = ?'
      )
        .bind(Math.min(99, existing.quantity + qty), sid, pid)
        .run();
    } else {
      await env.DB.prepare(
        'INSERT INTO cart_items (session_id, product_id, quantity) VALUES (?, ?, ?)'
      )
        .bind(sid, pid, qty)
        .run();
    }
    return withSetCookie(json({ ok: true }), setCookie);
  }

  if (pathname === '/api/cart/update' && method === 'POST') {
    const body = await parseBody(request);
    const pid = Number(body?.product_id);
    const qty = Number(body?.quantity);
    if (!pid || qty < 0) return json({ error: 'Invalid payload' }, 400);

    const { sid, setCookie } = await ensureCartSession(request, env);
    if (qty === 0) {
      await env.DB.prepare('DELETE FROM cart_items WHERE session_id = ? AND product_id = ?')
        .bind(sid, pid)
        .run();
    } else {
      await env.DB.prepare(
        'UPDATE cart_items SET quantity = ? WHERE session_id = ? AND product_id = ?'
      )
        .bind(Math.min(99, qty), sid, pid)
        .run();
    }
    return withSetCookie(json({ ok: true }), setCookie);
  }

  if (pathname === '/api/cart/clear' && method === 'POST') {
    const sid = readCookie(request, CART_COOKIE);
    if (sid) {
      await env.DB.prepare('DELETE FROM cart_items WHERE session_id = ?').bind(sid).run();
    }
    return json({ ok: true });
  }

  if (pathname === '/api/checkout' && method === 'POST') {
    const sid = readCookie(request, CART_COOKIE);
    if (!sid) return json({ error: 'Cart empty' }, 400);

    const body = await parseBody(request);
    const {
      email,
      full_name,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country = 'India',
    } = body || {};

    if (!email || !full_name || !address_line1 || !city || !postal_code) {
      return json({ error: 'Missing required fields' }, 400);
    }

    const items = await env.DB.prepare(
      `SELECT ci.product_id, ci.quantity, p.title, p.price_cents
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.session_id = ?`
    )
      .bind(sid)
      .all();

    const cartItems = items.results || [];
    if (!cartItems.length) return json({ error: 'Cart empty' }, 400);

    const total = cartItems.reduce((s, r) => s + r.price_cents * r.quantity, 0);

    const orderResult = await env.DB.prepare(
      `INSERT INTO orders (
         email, full_name, phone, address_line1, address_line2, city, state, postal_code, country,
         subtotal_cents, discount_cents, total_cents, status
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'pending')`
    )
      .bind(
        email,
        full_name,
        phone || null,
        address_line1,
        address_line2 || null,
        city,
        state || null,
        postal_code,
        country,
        total,
        total
      )
      .run();

    const orderId = orderResult.meta.last_row_id;
    for (const it of cartItems) {
      await env.DB.prepare(
        `INSERT INTO order_items (order_id, product_id, quantity, price_cents, title_snapshot)
         VALUES (?, ?, ?, ?, ?)`
      )
        .bind(orderId, it.product_id, it.quantity, it.price_cents, it.title)
        .run();
    }
    await env.DB.prepare('DELETE FROM cart_items WHERE session_id = ?').bind(sid).run();
    return json({ order_id: orderId, total_cents: total });
  }

  return null;
}
