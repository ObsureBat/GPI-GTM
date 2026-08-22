import { requireRole, json, parseBody } from '../auth/middleware.js';
import { mediaUrl, slugify } from '../utils.js';

function withProductMedia(row, env) {
  if (!row) return row;
  return { ...row, image_url: mediaUrl(row.image_url, env) };
}

export async function handleAdmin(request, env, pathname) {
  const auth = await requireRole(request, env, 'admin');
  if (auth.error) return auth.error;

  const method = request.method;
  const url = new URL(request.url);

  if (pathname === '/api/admin/stats' && method === 'GET') {
    const orders = await env.DB.prepare('SELECT status, total_cents FROM orders').all();
    const orderRows = orders.results || [];
    const pending = orderRows.filter((o) => o.status === 'pending').length;
    const completed = orderRows.filter((o) =>
      ['paid', 'shipped', 'delivered'].includes(o.status)
    ).length;
    const revenue = orderRows
      .filter((o) => ['paid', 'shipped', 'delivered'].includes(o.status))
      .reduce((s, o) => s + o.total_cents, 0);
    const sold = await env.DB.prepare(
      'SELECT COALESCE(SUM(quantity), 0) AS n FROM order_items'
    ).first();
    const productCount = await env.DB.prepare('SELECT COUNT(*) AS c FROM products').first();
    const lowStockResult = await env.DB.prepare(
      `SELECT id, handle, title, stock_qty, available, image_url, brand
       FROM products
       WHERE stock_qty <= 10 OR available = 0
       ORDER BY stock_qty ASC, title
       LIMIT 12`
    ).all();
    let visitors = 0;
    try {
      const stat = await env.DB.prepare(
        "SELECT value FROM site_stats WHERE key = 'visitors'"
      ).first();
      visitors = stat?.value || 0;
    } catch {
      visitors = 0;
    }

    return json({
      total_sales_cents: revenue,
      visitors,
      order_count: orderRows.length,
      products_sold: sold?.n || 0,
      product_count: productCount?.c || 0,
      pending_orders: pending,
      completed_orders: completed,
      revenue_cents: revenue,
      low_stock: (lowStockResult.results || []).map((r) => withProductMedia(r, env)),
    });
  }

  if (pathname === '/api/admin/products' && method === 'GET') {
    const rows = await env.DB.prepare(
      `SELECT id, handle, title, description, price_cents, compare_at_cents,
              image_url, brand, available, sort_order, stock_qty, category_id
       FROM products ORDER BY sort_order ASC, title`
    ).all();
    return json(rows.results || []);
  }

async function getUniqueHandle(env, rawHandleOrTitle, excludeId = null) {
  let base = slugify(rawHandleOrTitle);
  if (!base) base = 'product';
  let candidate = base;
  let count = 1;
  while (true) {
    const stmt = excludeId
      ? env.DB.prepare('SELECT id FROM products WHERE handle = ? AND id != ?').bind(candidate, excludeId)
      : env.DB.prepare('SELECT id FROM products WHERE handle = ?').bind(candidate);
    const existing = await stmt.first();
    if (!existing) return candidate;
    candidate = `${base}-${count}`;
    count++;
  }
}

  if (pathname === '/api/admin/products' && method === 'POST') {
    const body = await parseBody(request);
    if (!body?.title || body.price_cents == null) {
      return json({ error: 'title and price_cents are required' }, 400);
    }
    const handle = await getUniqueHandle(env, body.handle || body.title);

    try {
      const result = await env.DB.prepare(
        `INSERT INTO products (handle, title, description, price_cents, compare_at_cents,
          image_url, brand, available, sort_order, stock_qty, category_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          handle,
          body.title.trim(),
          body.description || '',
          Number(body.price_cents),
          body.compare_at_cents != null ? Number(body.compare_at_cents) : null,
          body.image_url || null,
          body.brand === 'gtm' ? 'gtm' : 'gpi',
          body.available ? 1 : 0,
          Number(body.sort_order) || 9999,
          Number(body.stock_qty) || 100,
          body.category_id ? Number(body.category_id) : null
        )
        .run();

      const row = await env.DB.prepare('SELECT * FROM products WHERE id = ?')
        .bind(result.meta.last_row_id)
        .first();
      return json(row, 201);
    } catch (e) {
      if (String(e.message).includes('UNIQUE')) {
        return json({ error: 'Product handle already exists' }, 409);
      }
      throw e;
    }
  }

  const productMatch = pathname.match(/^\/api\/admin\/products\/(\d+)$/);
  if (productMatch) {
    const id = Number(productMatch[1]);
    if (method === 'PATCH') {
      const body = await parseBody(request);
      const existing = await env.DB.prepare('SELECT * FROM products WHERE id = ?')
        .bind(id)
        .first();
      if (!existing) return json({ error: 'Not found' }, 404);

      const allowed = [
        'handle',
        'title',
        'description',
        'price_cents',
        'compare_at_cents',
        'image_url',
        'brand',
        'available',
        'sort_order',
        'stock_qty',
        'category_id',
      ];
      const sets = [];
      const values = [];
      for (const key of allowed) {
        if (body[key] !== undefined) {
          sets.push(`${key} = ?`);
          if (key === 'available') values.push(body[key] ? 1 : 0);
          else if (key === 'brand') values.push(body[key] === 'gtm' ? 'gtm' : 'gpi');
          else values.push(body[key]);
        }
      }
      if (!sets.length) return json({ error: 'No fields to update' }, 400);
      values.push(id);
      await env.DB.prepare(`UPDATE products SET ${sets.join(', ')} WHERE id = ?`)
        .bind(...values)
        .run();
      const row = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
      return json(row);
    }
    if (method === 'DELETE') {
      const existing = await env.DB.prepare('SELECT id FROM products WHERE id = ?').bind(id).first();
      if (!existing) return json({ error: 'Not found' }, 404);

      // Clear dependent rows that block deletion (order history is preserved via soft-delete)
      await env.DB.prepare('DELETE FROM cart_items WHERE product_id = ?').bind(id).run();
      await env.DB.prepare('DELETE FROM reviews WHERE product_id = ?').bind(id).run();
      await env.DB.prepare('DELETE FROM wishlist WHERE product_id = ?').bind(id).run();

      const inOrders = await env.DB.prepare(
        'SELECT COUNT(*) AS c FROM order_items WHERE product_id = ?'
      )
        .bind(id)
        .first();

      if (inOrders?.c > 0) {
        // Keep order history intact — hide product from store instead of hard delete
        await env.DB.prepare(
          `UPDATE products SET available = 0, updated_at = datetime('now') WHERE id = ?`
        )
          .bind(id)
          .run();
        return json({
          ok: true,
          archived: true,
          message: 'Product is in past orders, so it was archived (hidden) instead of deleted.',
        });
      }

      await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
      return json({ ok: true });
    }
  }

  if (pathname === '/api/admin/upload' && method === 'POST') {
    const form = await request.formData();
    const file = form.get('image');
    if (!file || typeof file === 'string') {
      return json({ error: 'No image uploaded' }, 400);
    }
    const safe = file.name.replace(/[^a-zA-Z0-9._ -]/g, '_');
    const key = `products/${safe}`;
    await env.R2.put(key, file.stream(), {
      httpMetadata: { contentType: file.type || 'application/octet-stream' },
    });
    return json({ image_url: key, url: mediaUrl(key, env) });
  }

  if (pathname === '/api/admin/orders' && method === 'GET') {
    const status = url.searchParams.get('status');
    let sql = `SELECT id, email, full_name, phone, city, state, total_cents, status, created_at
               FROM orders`;
    const orders = status
      ? await env.DB.prepare(`${sql} WHERE status = ? ORDER BY created_at DESC`)
          .bind(status)
          .all()
      : await env.DB.prepare(`${sql} ORDER BY created_at DESC`).all();
    return json(orders.results || []);
  }

  const orderMatch = pathname.match(/^\/api\/admin\/orders\/(\d+)$/);
  if (orderMatch) {
    const id = Number(orderMatch[1]);
    if (method === 'GET') {
      const order = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first();
      if (!order) return json({ error: 'Not found' }, 404);
      const items = await env.DB.prepare(
        `SELECT oi.*, p.handle
         FROM order_items oi
         LEFT JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = ?`
      )
        .bind(id)
        .all();
      return json({ ...order, items: items.results || [] });
    }
    if (method === 'PATCH') {
      const body = await parseBody(request);
      const allowed = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
      if (!allowed.includes(body?.status)) return json({ error: 'Invalid status' }, 400);
      const result = await env.DB.prepare('UPDATE orders SET status = ? WHERE id = ?')
        .bind(body.status, id)
        .run();
      if (!result.meta.changes) return json({ error: 'Not found' }, 404);
      const order = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first();
      return json(order);
    }
  }

  if (pathname === '/api/admin/categories' && method === 'GET') {
    const rows = await env.DB.prepare(
      `SELECT c.*, COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id
       ORDER BY c.title`
    ).all();
    return json(rows.results || []);
  }

  if (pathname === '/api/admin/categories' && method === 'POST') {
    const body = await parseBody(request);
    if (!body?.title) return json({ error: 'title is required' }, 400);
    const handle = (body.handle || slugify(body.title)).trim();
    try {
      const result = await env.DB.prepare(
        'INSERT INTO categories (handle, title, description) VALUES (?, ?, ?)'
      )
        .bind(handle, body.title.trim(), body.description || '')
        .run();
      const row = await env.DB.prepare('SELECT * FROM categories WHERE id = ?')
        .bind(result.meta.last_row_id)
        .first();
      return json({ ...row, product_count: 0 }, 201);
    } catch (e) {
      if (String(e.message).includes('UNIQUE')) {
        return json({ error: 'Category handle already exists' }, 409);
      }
      throw e;
    }
  }

  const catMatch = pathname.match(/^\/api\/admin\/categories\/(\d+)$/);
  if (catMatch) {
    const id = Number(catMatch[1]);
    if (method === 'PATCH') {
      const body = await parseBody(request);
      const existing = await env.DB.prepare('SELECT * FROM categories WHERE id = ?')
        .bind(id)
        .first();
      if (!existing) return json({ error: 'Not found' }, 404);
      await env.DB.prepare(
        `UPDATE categories SET
          handle = COALESCE(?, handle),
          title = COALESCE(?, title),
          description = COALESCE(?, description)
         WHERE id = ?`
      )
        .bind(body.handle ?? null, body.title ?? null, body.description ?? null, id)
        .run();
      const row = await env.DB.prepare('SELECT * FROM categories WHERE id = ?').bind(id).first();
      const count = await env.DB.prepare(
        'SELECT COUNT(*) AS c FROM products WHERE category_id = ?'
      )
        .bind(id)
        .first();
      return json({ ...row, product_count: count?.c || 0 });
    }
    if (method === 'DELETE') {
      const row = await env.DB.prepare('SELECT handle FROM categories WHERE id = ?')
        .bind(id)
        .first();
      if (!row) return json({ error: 'Not found' }, 404);
      if (row.handle === 'all') {
        return json({ error: 'Cannot delete the "all" category' }, 400);
      }
      await env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
      return json({ ok: true });
    }
  }

  return null;
}
