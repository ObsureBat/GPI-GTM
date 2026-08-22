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

export async function handleSitemap(request, env) {
  const origin = getOrigin(request);
  const now = new Date().toISOString().split('T')[0];

  // 1. Fetch active products from D1
  const productsQuery = await env.DB.prepare(
    `SELECT handle, updated_at FROM products WHERE available = 1 ORDER BY sort_order ASC, id DESC`
  ).all();
  const products = productsQuery.results || [];

  // 2. Fetch categories from D1
  const categoriesQuery = await env.DB.prepare(
    `SELECT handle FROM categories ORDER BY sort_order ASC`
  ).all();
  const categories = categoriesQuery.results || [];

  // Static core routes
  const staticUrls = [
    { loc: `${origin}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${origin}/collections/all`, priority: '0.9', changefreq: 'daily' },
  ];

  // Collection URLs
  const collectionUrls = categories.map((cat) => ({
    loc: `${origin}/collections/${escapeXml(cat.handle)}`,
    priority: '0.8',
    changefreq: 'weekly',
  }));

  // Product URLs
  const productUrls = products.map((prod) => {
    let lastmod = now;
    if (prod.updated_at) {
      try {
        lastmod = new Date(prod.updated_at).toISOString().split('T')[0];
      } catch {
        lastmod = now;
      }
    }
    return {
      loc: `${origin}/products/${escapeXml(prod.handle)}`,
      lastmod,
      priority: '0.8',
      changefreq: 'weekly',
    };
  });

  const xmlEntries = [
    ...staticUrls.map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    ),
    ...collectionUrls.map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    ),
    ...productUrls.map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    ),
  ].join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
