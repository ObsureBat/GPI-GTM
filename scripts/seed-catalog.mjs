/**
 * Seed categories + products into Cloudflare D1 from public/data/products.json.
 * Images are stored as R2 object keys (resolved via CDN_URL at runtime).
 *
 * Usage:
 *   node scripts/seed-catalog.mjs              # remote
 *   node scripts/seed-catalog.mjs --local      # local D1 only
 *   node scripts/seed-catalog.mjs --both
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const require = createRequire(import.meta.url);

const WRANGLER = join(ROOT, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const NODE = process.execPath;

const CATEGORIES = [
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

function imageKey(url) {
  if (!url) return null;
  const s = String(url).trim();
  if (s.startsWith('http://') || s.startsWith('https://')) {
    try {
      const u = new URL(s);
      return decodeURIComponent(u.pathname.replace(/^\//, ''));
    } catch {
      return s.replace(/^\//, '');
    }
  }
  return s.replace(/^\//, '');
}

function sqlEscape(v) {
  if (v == null) return 'NULL';
  if (typeof v === 'number') return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
}

function d1Execute(flag, command) {
  return execFileSync(
    NODE,
    [WRANGLER, 'd1', 'execute', 'gpi-store', flag, '--command', command, '--json'],
    { cwd: ROOT, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
  );
}

function primaryCategoryHandle(product) {
  const handle = (product.handle || '').toLowerCase();
  const title = (product.title || '').toLowerCase();
  const text = `${handle} ${title}`;
  if (handle.includes('detergent') || title.includes('detergent')) return 'cleaning-products';
  if (handle.includes('masala') || title.includes('masala') || title.includes('powder') && handle.includes('masala')) {
    return 'spices-products';
  }
  if (
    text.includes('salt') ||
    handle.includes('puiro') ||
    handle.includes('iodine')
  ) {
    return 'salt-products';
  }
  if (handle.includes('masala')) return 'spices-products';
  return 'all';
}

async function seed(target) {
  const flag = target === 'remote' ? '--remote' : '--local';
  console.log(`\nSeeding D1 (${target})…`);

  const productsPath = join(ROOT, 'scripts', 'data', 'products.json');
  if (!existsSync(productsPath)) throw new Error('Missing scripts/data/products.json');
  const products = JSON.parse(readFileSync(productsPath, 'utf8'));

  // Clear catalog rows (keep users/orders)
  d1Execute(flag, 'DELETE FROM cart_items');
  d1Execute(flag, 'DELETE FROM cart_sessions');
  d1Execute(flag, 'DELETE FROM products');
  d1Execute(flag, 'DELETE FROM categories');

  for (const c of CATEGORIES) {
    d1Execute(
      flag,
      `INSERT INTO categories (handle, title, description, sort_order) VALUES (${sqlEscape(c.handle)}, ${sqlEscape(c.title)}, ${sqlEscape(c.description)}, ${CATEGORIES.indexOf(c)})`
    );
  }

  const catJson = d1Execute(flag, 'SELECT id, handle FROM categories');
  const catRows = JSON.parse(catJson)?.[0]?.results || [];
  const catByHandle = Object.fromEntries(catRows.map((r) => [r.handle, r.id]));

  for (const p of products) {
    const brand = p.brand === 'gtm' ? 'gtm' : 'gpi';
    const key = imageKey(p.image_url);
    const catHandle = primaryCategoryHandle(p);
    const categoryId = catByHandle[catHandle] || catByHandle.all || null;
    const available = p.available == null ? 1 : p.available ? 1 : 0;

    d1Execute(
      flag,
      `INSERT INTO products (handle, title, description, price_cents, compare_at_cents, image_url, brand, category_id, available, sort_order, stock_qty)
       VALUES (
         ${sqlEscape(p.handle)},
         ${sqlEscape(p.title)},
         ${sqlEscape(p.description || '')},
         ${Number(p.price_cents) || 0},
         ${p.compare_at_cents == null ? 'NULL' : Number(p.compare_at_cents)},
         ${sqlEscape(key)},
         ${sqlEscape(brand)},
         ${categoryId == null ? 'NULL' : Number(categoryId)},
         ${available},
         ${Number(p.sort_order) || 9999},
         ${Number(p.stock_qty) || 100}
       )`
    );
  }

  const count = JSON.parse(d1Execute(flag, 'SELECT COUNT(*) AS c FROM products'))?.[0]?.results?.[0]?.c;
  console.log(`Seeded ${count} products + ${CATEGORIES.length} categories (${target}).`);
}

const both = process.argv.includes('--both');
const localOnly = process.argv.includes('--local');

if (both) {
  await seed('local');
  await seed('remote');
} else if (localOnly) {
  await seed('local');
} else {
  await seed('remote');
}
