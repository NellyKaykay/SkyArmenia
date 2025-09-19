// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { dev } from '$app/environment';

export const load: LayoutServerLoad = async (event) => {
  const { cookies, fetch, depends } = event;

  // Marca dependencia para que SvelteKit revalide si cambia el estado de auth
  depends('supabase:auth');

  const supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (name) => cookies.get(name),
      set: (name, value, options) => {
        cookies.set(name, value, {
          ...options,
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure: !dev // ✅ HTTPS en prod; sin bloquear en dev
        });
      },
      remove: (name, options) => {
        cookies.delete(name, { ...options, path: '/' });
      }
  }
  });

  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  if (error) {
    // No rompemos la carga del layout por un fallo de sesión
    return {
      session: null,
      user: null
    };
  }

  return {
    session,
    user: session?.user ?? null
  };
};
