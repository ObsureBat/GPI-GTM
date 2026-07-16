/** Cloudflare R2 public CDN (gpi-assets bucket). */
const DEFAULT_CDN = 'https://pub-9f2bb156112a4aadb011103c8f05ad76.r2.dev';
const CDN_BASE = (import.meta.env.VITE_CDN_URL || DEFAULT_CDN).replace(/\/$/, '');

/** Normalize legacy /products/… paths to R2 keys (products/…). */
export function normalizeMediaKey(path) {
  if (!path) return '';
  const trimmed = String(path).trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return trimmed.replace(/^\//, '');
}

/** Public URL for R2 object keys (products/…, banners/…, categories/…). */
export function mediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const key = normalizeMediaKey(path);
  if (CDN_BASE) {
    return `${CDN_BASE}/${key.split('/').map(encodeURIComponent).join('/')}`;
  }

  return key.startsWith('banners/') || key.startsWith('categories/') || key.startsWith('products/')
    ? `${CDN_BASE}/${key.split('/').map(encodeURIComponent).join('/')}`
    : path.startsWith('/')
      ? path
      : `${CDN_BASE}/${encodeURIComponent(key)}`;
}

export function formatInr(cents) {
  const n = (cents || 0) / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

/** Masala and detergent products show "Coming soon" instead of a price. */
export function isComingSoonProduct(product) {
  if (!product) return false;
  const handle = (product.handle || '').toLowerCase();
  const title = (product.title || '').toLowerCase();
  return (
    handle.includes('masala') ||
    handle.includes('detergent') ||
    title.includes('masala') ||
    title.includes('detergent')
  );
}

export function formatProductPrice(product, cents = product?.price_cents) {
  if (isComingSoonProduct(product)) return 'Coming soon';
  return formatInr(cents);
}

/** Visual size tier from pack weight (1kg larger, 100–200gm smaller). */
export function getProductSizeClass(product) {
  const text = `${product?.handle || ''} ${product?.title || ''}`.toLowerCase();
  if (text.includes('1kg') || text.includes('1 kg')) return 'product-card--size-lg';
  if (text.includes('500')) return 'product-card--size-md';
  if (text.includes('200') || text.includes('100') || text.includes('50')) return 'product-card--size-sm';
  return 'product-card--size-md';
}
