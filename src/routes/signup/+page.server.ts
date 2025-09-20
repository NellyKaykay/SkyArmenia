import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createServerClient } from '@supabase/ssr';
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
  PUBLIC_SITE_URL
} from '$env/static/public';

function makeSupabaseServerClient(
  cookies: import('@sveltejs/kit').Cookies,
  fetch: typeof globalThis.fetch
) {
  return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (key) => cookies.get(key),
      set: (key, value, options) => {
        cookies.set(key, value, { ...options, path: '/' });
      },
      remove: (key, options) => {
        cookies.delete(key, { ...options, path: '/' });
      }
    },
    fetch
  });
}

export const actions: Actions = {
  signup: async ({ request, cookies, fetch }) => {
    const form = await request.formData();
    const name = String(form.get('name') ?? '').trim();
    const email = String(form.get('email') ?? '').trim().toLowerCase();
    const password = String(form.get('password') ?? '');

    // Validación mínima
    if (!name || !email || !password) {
      return fail(400, {
        error: 'Por favor, completa todos los campos.',
        values: { name, email }
      });
    }
    if (password.length < 6) {
      return fail(400, {
        error: 'La contraseña debe tener al menos 6 caracteres.',
        values: { name, email }
      });
    }

    const supabase = makeSupabaseServerClient(cookies, fetch);

    // 1) PRE-CHECK: ¿el email ya existe en auth.users?
    //    (Esta RPC la creamos antes: public.email_exists(p_email text) -> boolean)
    const { data: exists, error: rpcErr } = await supabase.rpc('email_exists', { p_email: email });
    if (rpcErr) {
      // Si algo raro pasa con la RPC, no arriesgamos a crear duplicados.
      return fail(400, {
        error: 'No se pudo verificar el email. Inténtalo de nuevo en un momento.',
        values: { name, email }
      });
    }
    if (exists === true) {
      return fail(400, {
        error:
          'Este email ya está registrado. Inicia sesión o usa “¿Olvidaste tu contraseña?” para recuperarla.',
        values: { name, email }
      });
    }

    // 2) Construir redirect robusto (nunca vacío)
    const url = new URL(request.url);
    const derivedOrigin = `${url.protocol}//${url.host}`;
    const origin =
      (typeof PUBLIC_SITE_URL === 'string' && PUBLIC_SITE_URL) || derivedOrigin;
    const emailRedirectTo = `${origin}/auth/callback`;

    // 3) Intentar el alta
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo
      }
    });

    // 4) Caso especial de Supabase: éxito sin user ni session → tratar como duplicado
    if (!error && !data?.user && !data?.session) {
      return fail(400, {
        error:
          'Este email ya está registrado. Inicia sesión o usa “¿Olvidaste tu contraseña?” para recuperarla.',
        values: { name, email }
      });
    }

    // 5) Errores habituales
    if (error) {
      const msg = (error.message || '').toLowerCase();
      const code = Number(error.status) || 0;

      const alreadyExists =
        code === 400 || code === 409 || code === 422 ||
        /already\s*registered|already\s*exists|user\s*exists|duplicate/i.test(msg);

      if (alreadyExists) {
        return fail(400, {
          error:
            'Este email ya está registrado. Inicia sesión o usa “¿Olvidaste tu contraseña?” para recuperarla.',
          values: { name, email }
        });
      }

      return fail(400, {
        error: error.message || 'No se pudo crear la cuenta.',
        values: { name, email }
      });
    }

    // 6) Éxito
    if (data?.session) {
      throw redirect(303, '/'); // confirmaciones desactivadas
    }

    return { sent: true, values: { name, email } }; // confirmaciones activadas
  }
};
