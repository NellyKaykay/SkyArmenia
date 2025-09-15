// src/routes/logout/+server.ts
import { redirect, type RequestHandler } from '@sveltejs/kit';
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

const handler: RequestHandler = async ({ cookies, fetch, url }) => {
  const supabase = makeClient(cookies, fetch);
  await supabase.auth.signOut();

  // Permite ?redirect=/ruta
  const to = url.searchParams.get('redirect') ?? '/';
  throw redirect(303, to);
};

export const GET = handler;
export const POST = handler;
