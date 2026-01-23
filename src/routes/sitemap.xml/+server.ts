import { json } from '@sveltejs/kit';

const BASE_URL = 'https://skyarmenia.com';

const pages = [
  '/',
  '/search',
  '/login',
  '/about',
  '/contact'
  // Agrega aquí más rutas importantes si existen
];

export const GET = async () => {
  const lastmod = new Date().toISOString().split('T')[0];
  const urls = pages.map((path) => `    <url>\n      <loc>${BASE_URL}${path}</loc>\n      <lastmod>${lastmod}</lastmod>\n      <changefreq>weekly</changefreq>\n      <priority>${path === '/' ? '1.0' : '0.7'}</priority>\n    </url>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
};
