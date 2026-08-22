const DEFAULT_DOMAIN = 'https://www.gpipvtltd.com';

function getOrigin(request) {
  const url = new URL(request.url);
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return url.origin;
  }
  return DEFAULT_DOMAIN;
}

export function handleRobots(request) {
  const origin = getOrigin(request);
  
  const content = `User-agent: *
Allow: /
Allow: /products/
Allow: /collections/
Disallow: /admin/
Disallow: /api/

Sitemap: ${origin}/sitemap.xml
`;

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
