// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const handle: Handle = async ({ event, resolve }) => {
  // En local no marcamos secure para que la cookie se guarde
  const secure = event.url.hostname !== 'localhost' && event.url.hostname !== '127.0.0.1';

  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (key) => event.cookies.get(key),
      set: (key, value, options) =>
        event.cookies.set(key, value, {
          ...options,
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure
        }),
      remove: (key, options) =>
        event.cookies.delete(key, {
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
