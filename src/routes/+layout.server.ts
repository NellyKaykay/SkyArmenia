// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const load: LayoutServerLoad = async ({ cookies, fetch }) => {
  const supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (key) => cookies.get(key),
      set: (key, value, options) => {
        cookies.set(key, value, { ...options, path: '/' });
      },
      remove: (key, options) => {
        cookies.delete(key, { ...options, path: '/' });
      }
    }
  });

  // ✅ Usuario autenticado verificado contra el servidor de Auth
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  
  const session = !!user;

  return {
    user,       // objeto user seguro (o null)
    session     // booleano: true/false para tu {#if session} del Header
  };
};
