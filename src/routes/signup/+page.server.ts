// src/routes/signup/+page.server.ts
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createServerClient } from '@supabase/ssr';
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
  PUBLIC_SITE_URL
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
  signup: async ({ request, cookies }) => {
    const form = await request.formData();
    const name = String(form.get('name') ?? '').trim();
    const email = String(form.get('email') ?? '').trim().toLowerCase();
    const password = String(form.get('password') ?? '');
    // const accept = form.get('accept'); // ⚠️ puede no llegar si el checkbox no está dentro del <form>

    // Validación mínima
    if (!name || !email || !password) {
      return fail(400, {
        error: 'Por favor, completa todos los campos.',
        values: { name, email }
      });
    }

    // ⚠️ Desactivado: el checkbox no está llegando en FormData en tu maquetado actual
    // if (!accept) {
    //   return fail(400, {
    //     error: 'Debes aceptar las Condiciones y la Política de privacidad.',
    //     values: { name, email }
    //   });
    // }

    if (password.length < 6) {
      return fail(400, {
        error: 'La contraseña debe tener al menos 6 caracteres.',
        values: { name, email }
      });
    }

    const supabase = makeSupabaseServerClient(cookies);

    // Redirect de verificación (fallback al host actual)
    const url = new URL(request.url);
    const derivedOrigin = `${url.protocol}//${url.host}`;
    const origin = (typeof PUBLIC_SITE_URL === 'string' && PUBLIC_SITE_URL) || derivedOrigin;
    const emailRedirectTo = `${origin}/auth/callback`;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo
        }
      });

      // Caso especial (Supabase): éxito sin user ni session → tratar como duplicado
      if (!error && !data?.user && !data?.session) {
        return fail(400, {
          error:
            'Este email ya está registrado. Inicia sesión o usa “¿Olvidaste tu contraseña?” para recuperarla.',
          values: { name, email }
        });
      }

      if (error) {
        const msg = (error.message || '').toLowerCase();
        const code = Number(error.status) || 0;

        if (/redirect/.test(msg) && (/not allowed|for security/.test(msg) || code === 400)) {
          return fail(400, {
            error:
              'El enlace de redirección no está permitido en Supabase. Añade la URL en Auth → Redirect URLs (p. ej. http://localhost:5173/auth/callback y tu dominio público).',
            values: { name, email }
          });
        }

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

      // Éxito: si verificación está desactivada, puede haber sesión directa
      if (data?.session) {
        throw redirect(303, '/');
      }

      // Éxito con verificación por email
      return { sent: true, values: { name, email } };
    } catch (e: any) {
      console.error('signup action error:', e);
      return fail(500, {
        error: 'Error inesperado al crear la cuenta.',
        values: { name, email }
      });
    }
  }
};
