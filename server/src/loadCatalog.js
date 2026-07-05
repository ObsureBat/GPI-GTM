import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Strip simple HTML tags for plain-text description. */
export function stripHtml(html) {
  if (!html) return '';
  return String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Map Shopify export row → collection handles (matches theme collections).
 */
export function collectionsForProduct(row) {
  const handle = (row.Handle || '').toLowerCase();
  const title = (row.Title || '').toLowerCase();
  const tags = (row.Tags || '').toLowerCase();

  const out = new Set(['all']);

  const isSalt =
    tags.includes('salt') ||
    handle.includes('puiro') ||
    handle.includes('iodine') ||
    (handle.includes('salt') && !handle.includes('masala'));
  const isSpice = tags.includes('masala') || tags.includes('spices');
  const isDetergent = tags.includes('detergent') || handle.includes('detergent');

  if (isSalt) {
    out.add('salt-products');
    if (title.includes('1kg') || title.includes('1 kg') || handle.includes('1kg')) out.add('salt-1kg');
    if (title.includes('200') || handle.includes('200')) out.add('salt-200gm');
    if ((title.includes('100') || handle.includes('100')) && handle.includes('salt')) out.add('salt-100gm');
    if (title.includes('500') || handle.includes('500')) out.add('salt-500gm');
  }

  if (isSpice) {
    out.add('spices-products');
    if (title.includes('100') || handle.includes('100')) out.add('spices-100gm');
    if (title.includes('50') || handle.includes('50')) out.add('spices-50gm');
  }

  if (isDetergent) {
    out.add('cleaning-products');
    if (title.includes('500') || handle.includes('500')) out.add('cleaning-500gm');
    else out.add('cleaning-1kg');
  }

  return [...out];
}

function normalizeKeys(row) {
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    out[k.replace(/^\ufeff/, '').trim()] = v;
  }
  return out;
}

function rowToProduct(row) {
  row = normalizeKeys(row);
  const priceStr = row['Variant Price'];
  const compareStr = row['Variant Compare At Price'] ?? '';
  const price = parseFloat(String(priceStr || '0').replace(/,/g, ''));
  const compareAt = parseFloat(String(compareStr || '').replace(/,/g, ''));

  const vendor = (row.Vendor || '').trim();
  const status = String(row.Status || 'active').toLowerCase();
  if (status && status !== 'active') return null;
  const brand = vendor.toLowerCase() === 'gtm' ? 'gtm' : 'gpi';

  const imageUrl = (row['Image Src'] || '').trim();
  const body = stripHtml(row['Body (HTML)'] || row.Title || '');
  const sortOrder = parseInt(String(row['Sort Order'] || '9999'), 10);

  return {
    handle: (row.Handle || '').trim(),
    title: (row.Title || '').trim(),
    description: body || row.Title || '',
    price_cents: Math.max(0, Math.round(price * 100)),
    compare_at_cents:
      compareStr && String(compareStr).trim() !== '' && !Number.isNaN(compareAt) && compareAt > price
        ? Math.round(compareAt * 100)
        : null,
    brand,
    image_url: imageUrl || null,
    sort_order: Number.isNaN(sortOrder) ? 9999 : sortOrder,
    collections: collectionsForProduct(row),
  };
}

/**
 * Load catalog from Shopify products export CSV.
 * @param {string} [csvPath] - defaults to repo-root products_export_1.csv next to GPI workspace
 */
export function loadCatalogFromCsv(csvPath) {
  const candidates = [
    csvPath,
    process.env.PRODUCTS_CSV,
    path.join(__dirname, '../data/products_export_1.csv'),
    path.join(__dirname, '../../data/products_export_1.csv'),
    path.join(__dirname, '../../../products_export_1.csv'),
  ].filter(Boolean);

  let resolved = candidates.find((p) => fs.existsSync(p));
  if (!resolved) {
    console.warn('Catalog CSV not found. Tried:', candidates.join(', '));
    return [];
  }

  const raw = fs.readFileSync(resolved, 'utf8');
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    trim: true,
  });

  const products = [];
  for (const row of records) {
    const r = Object.fromEntries(
      Object.entries(row).map(([k, v]) => [k.replace(/^\ufeff/, '').trim(), v])
    );
    if (!r.Handle) continue;
    const p = rowToProduct(r);
    if (!p || !p.handle || !p.title) continue;
    if (!p.image_url) {
      console.warn('Skipping product without image:', p.handle);
      continue;
    }
    products.push(p);
  }

  return products;
}
