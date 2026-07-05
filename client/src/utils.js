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
