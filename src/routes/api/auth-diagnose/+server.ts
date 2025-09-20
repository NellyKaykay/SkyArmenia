import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SITE_URL } from '$env/static/public';

export const GET: RequestHandler = async ({ request, cookies, fetch, url }) => {
  // Derivar origin real del server (nunca vacío)
  const derivedOrigin = `${url.protocol}//${url.host}`;
  const origin = (typeof PUBLIC_SITE_URL === 'string' && PUBLIC_SITE_URL) || derivedOrigin;
  const emailRedirectTo = `${origin}/auth/callback`;

  // Opcional: si pasas ?email=tu@gmail.com&resend=1 intentará re-enviar confirmación
  const testEmail = url.searchParams.get('email') ?? '';
  const doResend = url.searchParams.get('resend') === '1';

  const supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (key) => cookies.get(key),
      set: (key, value, options) => cookies.set(key, value, { ...options, path: '/' }),
      remove: (key, options) => cookies.delete(key, { ...options, path: '/' })
    },
    fetch
  });

  let resendResult: any = null;
  if (doResend && testEmail) {
    // Intenta re-enviar el email de confirmación
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: testEmail,
      options: { emailRedirectTo }
    });
    resendResult = {
      ok: !error,
      error: error ? { status: (error as any).status ?? null, message: error.message } : null,
      data
    };
  }

  return json({
    env: {
      PUBLIC_SUPABASE_URL,
      hasAnonKey: !!PUBLIC_SUPABASE_ANON_KEY,
      PUBLIC_SITE_URL: PUBLIC_SITE_URL || null
    },
    request: {
      url: request.url,
      derivedOrigin,
      originChosen: origin,
      emailRedirectTo
    },
    resendResult
  });
};
