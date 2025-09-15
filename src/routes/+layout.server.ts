// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { dev } from '$app/environment';

export const load: LayoutServerLoad = async (event) => {
  const { cookies, fetch } = event;

  const supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (name) => cookies.get(name),
      set: (name, value, options) => {
        cookies.set(name, value, {
          ...options,
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure: !dev // ✅ HTTPS en prod, sin bloquear cookies en local
        });
      },
      remove: (name, options) => {
        cookies.delete(name, { ...options, path: '/' });
      }
    },
    fetch
  });

  const { data: { session } } = await supabase.auth.getSession();

  return {
    session,
    user: session?.user ?? null
  };
};
