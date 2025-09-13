import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase';
import { dev } from '$app/environment';

export const GET: RequestHandler = async ({ url, cookies }) => {
  const code = url.searchParams.get('code');
  if (!code) {
    // Si Supabase envía otros parámetros, puedes depurarlos aquí.
    throw redirect(302, '/login?error=missing_code');
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession({ code });

  if (error || !data?.session) {
    throw redirect(302, `/login?error=${encodeURIComponent(error?.message ?? 'exchange_failed')}`);
  }

  const { access_token, refresh_token, expires_in } = data.session;

  // Duraciones
  const maxAge = typeof expires_in === 'number' ? expires_in : 60 * 60 * 24 * 7; // fallback 7 días

  // Guarda cookies httpOnly (seguras en prod)
  cookies.set('sb-access-token', access_token, {
    httpOnly: true,
    secure: !dev,
    sameSite: 'lax',
    path: '/',
    maxAge
  });

  cookies.set('sb-refresh-token', refresh_token, {
    httpOnly: true,
    secure: !dev,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30 // refresh válido más tiempo
  });

  // Listo: redirige al inicio (luego podremos redirigir a "volver a donde estaba")
  throw redirect(302, '/');
};
