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
