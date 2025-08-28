// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { createServerClient } from '@supabase/ssr';
import { env as PUBLIC } from '$env/dynamic/public';

export const handle: Handle = async ({ event, resolve }) => {
  const url = PUBLIC.PUBLIC_SUPABASE_URL;
  const key = PUBLIC.PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('Faltan PUBLIC_SUPABASE_URL o PUBLIC_SUPABASE_ANON_KEY.');
    throw new Error('Config de Supabase faltante: revisa tu .env');
  }

  const secure = event.url.hostname !== 'localhost' && event.url.hostname !== '127.0.0.1';

  event.locals.supabase = createServerClient(url, key, {
    cookies: {
      get: (k) => event.cookies.get(k),
      set: (k, v, options) =>
        event.cookies.set(k, v, {
          ...options,
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure
        }),
      remove: (k, options) =>
        event.cookies.delete(k, {
          ...options,
          path: '/'
        })
    }
  });

  const {
    data: { session }
  } = await event.locals.supabase.auth.getSession();
  event.locals.session = session;

  return resolve(event);
};
