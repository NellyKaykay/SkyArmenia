// src/routes/api/auth/check-email/+server.ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const GET: RequestHandler = async ({ url, cookies, fetch }) => {
  const email = String(url.searchParams.get('email') ?? '').trim().toLowerCase();

  if (!email || !email.includes('@')) {
    return json({ ok: false, error: 'invalid_email', exists: false }, { status: 400 });
  }

  const supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (key) => cookies.get(key),
      set: (key, value, options) => cookies.set(key, value, { ...options, path: '/' }),
      remove: (key, options) => cookies.delete(key, { ...options, path: '/' })
    },
    fetch
  });

  // Llamamos a la función SQL creada en Supabase: email_exists(p_email text)
  const { data, error } = await supabase.rpc('email_exists', { p_email: email });

  if (error) {
    return json({ ok: false, error: error.message, exists: false }, { status: 500 });
  }

  return json({ ok: true, exists: !!data });
};
