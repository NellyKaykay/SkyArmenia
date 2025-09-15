// src/routes/auth/callback/+server.ts
import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

function makeClient(cookies: any, fetch: typeof globalThis.fetch) {
  return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (name) => cookies.get(name),
      set: (name, value, options) => {
        cookies.set(name, value, {
          ...options,
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure: true
        });
      },
      remove: (name, options) => {
        cookies.delete(name, { ...options, path: '/' });
      }
    },
    fetch
  });
}

export const GET: RequestHandler = async ({ url, cookies, fetch }) => {
  const code = url.searchParams.get('code');
  if (!code) throw redirect(303, '/login?error=missing_code');

  const supabase = makeClient(cookies, fetch);

  // Intercambia el code por sesión y deja cookies SSR automáticamente
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw redirect(303, `/login?error=${encodeURIComponent(error.message ?? 'exchange_failed')}`);

  // Soporta ?redirect=/ruta
  const to = url.searchParams.get('redirect') ?? '/';
  throw redirect(303, to);
};
