// src/routes/login/+page.server.ts
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createServerClient } from '@supabase/ssr';
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY
} from '$env/static/public';

function makeSupabaseServerClient(cookies: import('@sveltejs/kit').Cookies) {
  return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookies.get(name);
      },
      set(name: string, value: string, options?: import('@supabase/ssr').CookieOptions) {
        cookies.set(name, value, { ...options, path: '/' });
      },
      remove(name: string, options?: import('@supabase/ssr').CookieOptions) {
        cookies.delete(name, { ...options, path: '/' });
      }
    }
  });
}

export const actions: Actions = {
  login: async ({ request, cookies }) => {
    const form = await request.formData();
    const email = String(form.get('email') ?? '').trim().toLowerCase();
    const password = String(form.get('password') ?? '');

    if (!email || !password) {
      return fail(400, {
        error: 'Por favor, introduce tu email y contraseña.',
        values: { email }
      });
    }

    const supabase = makeSupabaseServerClient(cookies);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        const msg = (error.message || '').toLowerCase();
        // Mensajes más amables
        if (/invalid login credentials|invalid email or password|credentials/i.test(msg)) {
          return fail(400, {
            error: 'Email o contraseña incorrectos.',
            values: { email }
          });
        }
        if (/email not confirmed|confirm your email|not verified/i.test(msg)) {
          return fail(400, {
            error: 'Tu email no está verificado. Revisa tu bandeja y confirma tu cuenta.',
            values: { email }
          });
        }
        return fail(400, {
          error: error.message || 'No se pudo iniciar sesión.',
          values: { email }
        });
      }

      // Si hay sesión, adelante
      if (data?.session) {
        throw redirect(303, '/');
      }

      // Caso raro: sin error y sin sesión
      return fail(400, {
        error: 'No se pudo iniciar sesión. Inténtalo de nuevo.',
        values: { email }
      });
    } catch (e: any) {
      console.error('login action error:', e);
      return fail(500, {
        error: 'Error inesperado al iniciar sesión.',
        values: { email }
      });
    }
  }
};
