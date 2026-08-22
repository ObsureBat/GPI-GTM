import { handleAuth } from './routes/auth.js';
import { handleAdmin } from './routes/admin.js';
import { handleStore } from './routes/store.js';
import { json } from './auth/middleware.js';
import { handleSeoPage } from './seo/seoHandler.js';
import { handleSitemap } from './seo/sitemap.js';
import { handleRobots } from './seo/robots.js';
import { handleMerchantFeed } from './seo/merchantFeed.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Credentials': 'true',
};

function withCors(response, request) {
  const origin = request.headers.get('Origin');
  const headers = new Headers(response.headers);
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Credentials', 'true');
  } else {
    for (const [k, v] of Object.entries(CORS_HEADERS)) headers.set(k, v);
  }
  return new Response(response.body, { status: response.status, headers });
}

async function handleApi(request, env) {
  const url = new URL(request.url);
  const { pathname } = url;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (pathname === '/api/health') {
    return json({
      ok: true,
      environment: 'cloudflare-worker',
      dataSource: 'd1+r2',
      cdn: env.CDN_URL || null,
    });
  }

  let response = await handleAuth(request, env, pathname);
  if (response) return withCors(response, request);

  if (pathname.startsWith('/api/admin')) {
    response = await handleAdmin(request, env, pathname);
    if (response) return withCors(response, request);
  }

  response = await handleStore(request, env, pathname);
  if (response) return withCors(response, request);

  return withCors(json({ error: 'Not found' }, 404), request);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === '/sitemap.xml') {
      try {
        return await handleSitemap(request, env);
      } catch (err) {
        console.error('[sitemap]', err);
        return new Response('Error generating sitemap', { status: 500 });
      }
    }

    if (
      pathname === '/feed/google-shopping.xml' ||
      pathname === '/feeds/google-shopping.xml' ||
      pathname === '/google-shopping.xml'
    ) {
      try {
        return await handleMerchantFeed(request, env);
      } catch (err) {
        console.error('[merchantFeed]', err);
        return new Response('Error generating merchant feed', { status: 500 });
      }
    }

    if (pathname === '/robots.txt') {
      return handleRobots(request);
    }

    if (pathname.startsWith('/api/')) {
      try {
        return await handleApi(request, env);
      } catch (err) {
        console.error('[worker]', err);
        return json({ error: 'Internal Server Error', message: err.message }, 500);
      }
    }

    if (pathname.startsWith('/products/') || pathname.startsWith('/collections/')) {
      try {
        const seoResponse = await handleSeoPage(request, env, pathname);
        if (seoResponse) return seoResponse;
      } catch (err) {
        console.error('[seo]', err);
      }
    }

    return env.ASSETS.fetch(request);
  },
};

