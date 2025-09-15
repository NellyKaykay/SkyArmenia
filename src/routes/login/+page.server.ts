// src/routes/login/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { dev } from '$app/environment';

function makeClient(cookies: any, fetch: typeof globalThis.fetch) {
  return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (name) => cookies.get(name),
      set: (name, value, options) => {
        cookies.set(name, value, {
          ...options,
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure: !dev
        });
      },
      remove: (name, options) => {
        cookies.delete(name, { ...options, path: '/' });
      }
    },
    fetch
  });
}

export const load: PageServerLoad = async ({ cookies, fetch, url }) => {
  const supabase = makeClient(cookies, fetch);
  const { data: { session } } = await supabase.auth.getSession();

  // Si ya está logueada, no pintes el login
  if (session) {
    const to = url.searchParams.get('redirect') ?? '/';
    throw redirect(303, to);
  }

  // Valores iniciales para tu UI (si los usas)
  return {
    view: 'choice' as const,
    values: { email: '', name: '' }
  };
};

export const actions: Actions = {
  // POST /login?action=login  → envía magic link
  login: async ({ request, cookies, fetch, url }) => {
    const data = await request.formData();
    const email = String(data.get('email') ?? '').trim();

    if (!email) {
      return fail(400, {
        view: 'login',
        error: 'Introduce tu email para recibir el enlace.',
        values: { email }
      });
    }

    const supabase = makeClient(cookies, fetch);

    // Redirección de retorno del correo → /auth/callback?redirect=<destino>
    const redirectTo =
      url.searchParams.get('redirect') ??
      '/'; // permitirá volver a donde estaba si lo pasas en la URL del login

    const emailRedirectTo = new URL('/auth/callback', url.origin);
    emailRedirectTo.searchParams.set('redirect', redirectTo);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: emailRedirectTo.toString()
      }
    });

    if (error) {
      return fail(400, {
        view: 'login',
        error: error.message || 'No se pudo enviar el enlace.',
        values: { email }
      });
    }

    // Mensaje para tu UI: "Revisa tu correo"
    return {
      ok: true,
      view: 'login',
      message: 'Te hemos enviado un enlace de acceso. Revisa tu correo.',
      values: { email }
    };
  },

  // POST /login?action=signup  → también envía magic link (Supabase creará la cuenta al verificar)
  signup: async ({ request, cookies, fetch, url }) => {
    const data = await request.formData();
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();

    if (!name || !email) {
      return fail(400, {
        view: 'signup',
        error: 'Introduce nombre y email.',
        values: { name, email }
      });
    }

    const supabase = makeClient(cookies, fetch);

    const redirectTo =
      url.searchParams.get('redirect') ??
      '/';
    const emailRedirectTo = new URL('/auth/callback', url.origin);
    emailRedirectTo.searchParams.set('redirect', redirectTo);

    // Para magic link en “signup”, usamos signInWithOtp y guardamos el nombre como metadata después del login si quieres.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: emailRedirectTo.toString(),
        data: { name } // quedará asociado cuando se confirme
      }
    });

    if (error) {
      return fail(400, {
        view: 'signup',
        error: error.message || 'No se pudo enviar el enlace de registro.',
        values: { name, email }
      });
    }

    return {
      ok: true,
      view: 'login',
      message: 'Te enviamos un enlace para confirmar tu email. Luego podrás iniciar sesión.',
      values: { email }
    };
  }
};
