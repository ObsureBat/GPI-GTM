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

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPriceINR(cents) {
  if (cents == null) return '';
  const rupees = cents / 100;
  return `₹${rupees.toLocaleString('en-IN')}`;
}

export function generateProductJsonLd(product, env, origin) {
  const imageUrl = mediaUrl(product.image_url, env);
  const priceRupees = (product.price_cents / 100).toFixed(2);
  const brandName = product.brand === 'gtm' ? 'GTM' : 'GPI';
  const productUrl = `${origin}/products/${product.handle}`;
  const isAvailable = product.available === 1 && (product.stock_qty == null || product.stock_qty > 0);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || `${product.title} from ${brandName}. High-quality product by ${SITE_NAME}.`,
    image: imageUrl ? [imageUrl] : [],
    sku: `SKU-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: brandName,
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'INR',
      price: priceRupees,
      availability: isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
  };

  return JSON.stringify(schema, null, 2);
}

export function injectProductSeo(htmlTemplate, product, env, origin) {
  const canonicalUrl = `${origin}/products/${product.handle}`;
  const imageUrl = mediaUrl(product.image_url, env);
  const brandName = product.brand === 'gtm' ? 'GTM' : 'GPI';
  const priceFormatted = formatPriceINR(product.price_cents);
  
  const seoTitle = `${product.title} – ${priceFormatted} | Details & Buy Online | ${SITE_NAME}`;
  const rawDesc = product.description 
    ? `${product.description} Buy ${product.title} online for ${priceFormatted} from ${SITE_NAME}. Best quality ${brandName} product.`
    : `Buy ${product.title} online for ${priceFormatted} from ${SITE_NAME}. Premium ${brandName} quality product with fast delivery across India.`;
  const seoDescription = rawDesc.replace(/\s+/g, ' ').trim().slice(0, 160);

  const jsonLd = generateProductJsonLd(product, env, origin);

  const metaTags = `
    <title>${escapeHtml(seoTitle)}</title>
    <meta name="description" content="${escapeHtml(seoDescription)}" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="og:product" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:title" content="${escapeHtml(seoTitle)}" />
    <meta property="og:description" content="${escapeHtml(seoDescription)}" />
    <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
    ${imageUrl ? `<meta property="og:image" content="${escapeHtml(imageUrl)}" />` : ''}
    <meta property="product:price:amount" content="${(product.price_cents / 100).toFixed(2)}" />
    <meta property="product:price:currency" content="INR" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(seoTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(seoDescription)}" />
    ${imageUrl ? `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />` : ''}

    <!-- Structured Data JSON-LD -->
    <script type="application/ld+json">
${jsonLd}
    </script>
  `;

  // Crawlable HTML snippet for search engine bots inside <div id="root">
  const initialBodyHtml = `
    <div class="product-seo-prerender" style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
      <nav aria-label="Breadcrumb" style="margin-bottom: 1rem; font-size: 0.9rem;">
        <a href="/">Home</a> &gt; <a href="/collections/all">Products</a> &gt; <span>${escapeHtml(product.title)}</span>
      </nav>
      <article>
        <span style="display:inline-block; padding: 0.25rem 0.5rem; background: #eee; font-weight: bold; margin-bottom: 0.5rem;">
          Brand: ${escapeHtml(brandName)}
        </span>
        <h1 style="font-size: 2rem; margin: 0.5rem 0;">${escapeHtml(product.title)}</h1>
        <p style="font-size: 1.5rem; font-weight: bold; color: #b81c24;">${escapeHtml(priceFormatted)}</p>
        ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(product.title)}" style="max-width: 400px; height: auto; margin: 1rem 0;" />` : ''}
        <div style="margin-top: 1rem; line-height: 1.6;">
          <h2>Product Description</h2>
          <p>${escapeHtml(product.description || '')}</p>
        </div>
      </article>
    </div>
  `;

  // Replace default title and inject SEO head tags before </head>
  let html = htmlTemplate.replace(/<title>.*?<\/title>/i, '');
  html = html.replace('</head>', `${metaTags}\n</head>`);
  
  // Inject crawlable fallback inside <div id="root"></div>
  html = html.replace('<div id="root"></div>', `<div id="root">${initialBodyHtml}</div>`);

  return html;
}

export function injectCollectionSeo(htmlTemplate, collectionDef, products, env, origin) {
  const canonicalUrl = `${origin}/collections/${collectionDef.handle}`;
  const seoTitle = `${collectionDef.title} – Buy Online | ${SITE_NAME}`;
  const seoDescription = `${collectionDef.description || `Browse our complete range of ${collectionDef.title}.`} Order authentic products online from ${SITE_NAME}.`;

  const metaTags = `
    <title>${escapeHtml(seoTitle)}</title>
    <meta name="description" content="${escapeHtml(seoDescription)}" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />

    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:title" content="${escapeHtml(seoTitle)}" />
    <meta property="og:description" content="${escapeHtml(seoDescription)}" />
    <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />

    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeHtml(seoTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(seoDescription)}" />
  `;

  const productListItems = (products || [])
    .map(
      (p) => `
      <li style="margin-bottom: 1rem;">
        <a href="/products/${escapeHtml(p.handle)}">
          <strong>${escapeHtml(p.title)}</strong> - ${formatPriceINR(p.price_cents)}
        </a>
      </li>`
    )
    .join('');

  const initialBodyHtml = `
    <div style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
      <nav aria-label="Breadcrumb">
        <a href="/">Home</a> &gt; <span>${escapeHtml(collectionDef.title)}</span>
      </nav>
      <h1>${escapeHtml(collectionDef.title)}</h1>
      <p>${escapeHtml(collectionDef.description || '')}</p>
      <h2>Products in this collection</h2>
      <ul style="list-style: none; padding: 0;">
        ${productListItems}
      </ul>
    </div>
  `;

  let html = htmlTemplate.replace(/<title>.*?<\/title>/i, '');
  html = html.replace('</head>', `${metaTags}\n</head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${initialBodyHtml}</div>`);

  return html;
}

export function generate404Html(htmlTemplate, origin, pathname) {
  const seoTitle = `Page Not Found (404) | ${SITE_NAME}`;
  const metaTags = `
    <title>${escapeHtml(seoTitle)}</title>
    <meta name="robots" content="noindex, follow" />
  `;

  const initialBodyHtml = `
    <div style="padding: 4rem 2rem; text-align: center; max-width: 600px; margin: 0 auto;">
      <h1 style="font-size: 3rem; margin-bottom: 1rem; color: #333;">404</h1>
      <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Product or Page Not Found</h2>
      <p style="color: #666; margin-bottom: 2rem;">The page <code>${escapeHtml(pathname)}</code> could not be found or has been removed.</p>
      <a href="/" style="display: inline-block; padding: 0.75rem 1.5rem; background: #000; color: #fff; text-decoration: none; border-radius: 4px;">Return to Homepage</a>
    </div>
  `;

  let html = htmlTemplate.replace(/<title>.*?<\/title>/i, '');
  html = html.replace('</head>', `${metaTags}\n</head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${initialBodyHtml}</div>`);

  return html;
}

export async function handleSeoPage(request, env, pathname) {
  const origin = getOrigin(request);

  // Fetch index.html base shell from static assets
  const assetUrl = new URL('/index.html', request.url);
  const assetReq = new Request(assetUrl.toString(), request);
  const assetRes = await env.ASSETS.fetch(assetReq);
  
  if (!assetRes.ok) {
    return new Response('System Error loading assets', { status: 500 });
  }

  const htmlTemplate = await assetRes.text();

  // 1. Product Page Handler: /products/:handle
  if (pathname.startsWith('/products/')) {
    const handle = decodeURIComponent(pathname.replace('/products/', '')).replace(/\/$/, '');
    if (!handle) {
      return new Response(generate404Html(htmlTemplate, origin, pathname), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const row = await env.DB.prepare(
      `SELECT id, handle, title, description, price_cents, compare_at_cents, image_url, brand, available, sort_order, stock_qty
       FROM products WHERE handle = ?`
    )
      .bind(handle)
      .first();

    if (!row || row.available === 0) {
      return new Response(generate404Html(htmlTemplate, origin, pathname), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const renderedHtml = injectProductSeo(htmlTemplate, row, env, origin);
    return new Response(renderedHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=3600',
      },
    });
  }

  // 2. Collection Page Handler: /collections/:handle
  if (pathname.startsWith('/collections/')) {
    const handle = decodeURIComponent(pathname.replace('/collections/', '')).replace(/\/$/, '');
    
    const productsRow = await env.DB.prepare(
      `SELECT id, handle, title, price_cents, image_url, brand
       FROM products WHERE available = 1 ORDER BY sort_order ASC`
    ).all();

    const products = productsRow.results || [];

    const collectionDef = {
      handle: handle || 'all',
      title: handle ? handle.replace(/-/g, ' ').toUpperCase() : 'All Products',
      description: `Browse products in ${handle || 'our store'}.`,
    };

    const renderedHtml = injectCollectionSeo(htmlTemplate, collectionDef, products, env, origin);
    return new Response(renderedHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=3600',
      },
    });
  }

  return null;
}
