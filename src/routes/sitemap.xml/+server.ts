// src/routes/sitemap.xml/+server.ts
import { PUBLIC_SITE_URL } from '$env/static/public';

export const GET = async () => {
  const base = (PUBLIC_SITE_URL || 'https://skyarmenia.com').replace(/\/+$/, '');
  const pages = [
    '',
    '/search',
    '/login',
    '/signup',
    '/offers',
    '/contact',
  ];

  const urls = pages
    .map((path) => `<url><loc>${base + path}</loc></url>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  });
};
