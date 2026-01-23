import { redirect } from '@sveltejs/kit';

export const GET = async ({ url }) => {
  // Redirige www a sin www (SEO canonical)
  if (url.hostname === 'www.skyarmenia.com') {
    throw redirect(308, `https://skyarmenia.com${url.pathname}${url.search}`);
  }
  // Si no es www, no hace nada
  return new Response(null, { status: 204 });
};
