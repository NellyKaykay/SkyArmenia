// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const handle: Handle = async ({ event, resolve }) => {
  const url = PUBLIC_SUPABASE_URL;
  const key = PUBLIC_SUPABASE_ANON_KEY;

  // En local => cookies no "secure"
  const secure = event.url.hostname !== 'localhost' && event.url.hostname !== '127.0.0.1';

  if (url && key) {
    const supabase = createServerClient(url, key, {
      cookies: {
        get: (k) => event.cookies.get(k),
        set: (k, v, options) =>
          event.cookies.set(k, v, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure,
            ...options
          }),
        remove: (k, options) =>
          event.cookies.delete(k, {
            path: '/',
            ...options
          })
      }
    });

    event.locals.supabase = supabase;
    event.locals.getSession = async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    };

    // (Opcional) cachear la sesión aquí si quieres
    const { data: { session } } = await supabase.auth.getSession();
    event.locals.session = session;
  } else {
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
    event.locals.getSession = async () => null;
    event.locals.session = null;
  }

  // Importante: evita serializar headers sensibles (Set-Cookie)
  const response = await resolve(event, {
    filterSerializedResponseHeaders: (name) => name === 'content-type'
  });

  return response;
};
