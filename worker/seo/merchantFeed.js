import { mediaUrl } from '../utils.js';

const SITE_NAME = 'GPI Industries Pvt. Ltd.';
const DEFAULT_DOMAIN = 'https://www.gpipvtltd.com';

function getOrigin(request) {
  const url = new URL(request.url);
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return url.origin;
  }
  return DEFAULT_DOMAIN;
}

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getGoogleProductCategory(product) {
  if (product.google_product_category) {
    return product.google_product_category;
  }
  const text = `${product.handle} ${product.title}`.toLowerCase();
  if (text.includes('detergent')) {
    return 'Home & Garden > Household Supplies > Household Cleaning Supplies';
  }
  if (text.includes('salt') || text.includes('puiro') || text.includes('iodine')) {
    return 'Food, Beverages & Tobacco > Food Items > Seasonings & Spices > Salt';
  }
  if (text.includes('masala') || text.includes('spices')) {
    return 'Food, Beverages & Tobacco > Food Items > Seasonings & Spices > Spices & Herbs';
  }
  return 'Food, Beverages & Tobacco > Food Items';
}

function getProductType(product) {
  const brandName = product.brand === 'gtm' ? 'GTM' : 'GPI';
  const text = `${product.handle} ${product.title}`.toLowerCase();
  if (text.includes('detergent')) {
    return `Cleaning Products > Household Care > ${brandName} Detergents`;
  }
  if (text.includes('salt')) {
    return `Salt Products > Himalayan Salts > ${brandName} Salt`;
  }
  if (text.includes('masala') || text.includes('spices')) {
    return `Spices Products > Indian Spices > ${brandName} Masalas`;
  }
  return `All Products > ${brandName}`;
}

export async function handleMerchantFeed(request, env) {
  const origin = getOrigin(request);

  // Fetch active products from Cloudflare D1
  let rows = [];
  try {
    const productsQuery = await env.DB.prepare(
      `SELECT id, handle, title, description, price_cents, compare_at_cents, image_url, brand, available, stock_qty, gtin, mpn, google_product_category
       FROM products WHERE available = 1 ORDER BY sort_order ASC, id DESC`
    ).all();
    rows = productsQuery.results || [];
  } catch (err) {
    // Fallback if migration 0005 has not been applied yet
    const fallbackQuery = await env.DB.prepare(
      `SELECT id, handle, title, description, price_cents, compare_at_cents, image_url, brand, available, stock_qty
       FROM products WHERE available = 1 ORDER BY sort_order ASC, id DESC`
    ).all();
    rows = fallbackQuery.results || [];
  }

  const itemsXml = rows
    .map((p) => {
      const productUrl = `${origin}/products/${p.handle}`;
      const imageUrl = mediaUrl(p.image_url, env);
      const priceFormatted = `${(p.price_cents / 100).toFixed(2)} INR`;
      const brandName = p.brand === 'gtm' ? 'GTM' : 'GPI';
      const inStock = p.available === 1 && (p.stock_qty == null || p.stock_qty > 0);
      const availability = inStock ? 'in_stock' : 'out_of_stock';
      
      const hasGtinOrMpn = Boolean(p.gtin || p.mpn);
      const categoryPath = getGoogleProductCategory(p);
      const productType = getProductType(p);

      const description = p.description || `${p.title} from ${brandName}. Authentic premium quality product by ${SITE_NAME}.`;

      return `    <item>
      <g:id>${escapeXml(String(p.id))}</g:id>
      <g:title>${escapeXml(p.title)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${priceFormatted}</g:price>
      ${p.compare_at_cents ? `<g:sale_price>${(p.compare_at_cents / 100).toFixed(2)} INR</g:sale_price>` : ''}
      <g:brand>${escapeXml(brandName)}</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>${hasGtinOrMpn ? 'yes' : 'no'}</g:identifier_exists>
      ${p.gtin ? `<g:gtin>${escapeXml(p.gtin)}</g:gtin>` : ''}
      ${p.mpn ? `<g:mpn>${escapeXml(p.mpn)}</g:mpn>` : ''}
      <g:google_product_category>${escapeXml(categoryPath)}</g:google_product_category>
      <g:product_type>${escapeXml(productType)}</g:product_type>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard Shipping</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(SITE_NAME)} Product Feed</title>
    <link>${origin}</link>
    <description>Official Google Merchant Center Product Feed for ${escapeXml(SITE_NAME)}.</description>
${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
