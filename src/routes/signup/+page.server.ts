// src/routes/signup/+page.server.ts
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Opcional: si definiste PUBLIC_SITE_URL en Render/.env, lo usamos para el redirect
import { PUBLIC_SITE_URL } from '$env/static/public';

function makeSupabaseServerClient(cookies: import('@sveltejs/kit').Cookies, fetch: typeof globalThis.fetch) {
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
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');

    // Validaciones mínimas
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

    // Configura redirect si tienes PUBLIC_SITE_URL (recomendado)
    const emailRedirectTo =
      typeof PUBLIC_SITE_URL === 'string' && PUBLIC_SITE_URL
        ? `${PUBLIC_SITE_URL}/auth/callback`
        : undefined;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo
      }
    });

    if (error) {
      return fail(400, {
        error: error.message,
        values: { name, email }
      });
    }

    // Éxito → la página muestra el bloque "sent"
    return { sent: true };
  }
};
