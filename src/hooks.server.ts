// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { createServerClient } from '@supabase/ssr';
import { env as PUBLIC } from '$env/dynamic/public';

export const handle: Handle = async ({ event, resolve }) => {
  const url = PUBLIC.PUBLIC_SUPABASE_URL;
  const key = PUBLIC.PUBLIC_SUPABASE_ANON_KEY;

  const secure = event.url.hostname !== 'localhost' && event.url.hostname !== '127.0.0.1';

  if (url && key) {
    // Config normal con Supabase
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
  } else {
    // Fallback: no tirar 500 si faltan envs (útil para /api/debug-env)
    console.warn('PUBLIC_SUPABASE_URL o PUBLIC_SUPABASE_ANON_KEY faltan. Usando mock para continuar.');
    const mock = {
      auth: {
        async getSession() {
          return { data: { session: null }, error: null } as any;
        },
        async signOut() {
          return { error: null } as any;
        }
      }
    } as any;
    event.locals.supabase = mock;
  }

  const {
    data: { session }
  } = await event.locals.supabase.auth.getSession();
  event.locals.session = session;

  return resolve(event);
};
