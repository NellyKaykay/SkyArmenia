// src/routes/login/+page.server.ts
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const actions: Actions = {
  // ÚNICA acción: debe coincidir con action="?/login" en el <form>
  login: async ({ request, locals }) => {
    const form = await request.formData();
    const email = String(form.get('email') ?? '').trim().toLowerCase();
    const password = String(form.get('password') ?? '');

    if (!email || !password) {
      return fail(400, { error: 'Por favor, introduce tu email y contraseña.', values: { email } });
    }

    const { data, error } = await locals.supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const msg = (error.message || '').toLowerCase();

      if (/invalid login credentials|invalid email or password|credentials/.test(msg)) {
        return fail(400, { error: 'Email o contraseña incorrectos.', values: { email } });
      }
      if (/email not confirmed|confirm your email|not verified/.test(msg)) {
        return fail(400, { error: 'Tu email no está verificado. Revisa tu bandeja y confirma tu cuenta.', values: { email } });
      }
      if (/rate|too many/.test(msg)) {
        return fail(429, { error: 'Demasiados intentos. Prueba en unos minutos.', values: { email } });
      }

      return fail(400, { error: 'No se pudo iniciar sesión. Inténtalo de nuevo.', values: { email } });
    }

    // Éxito
    if (data?.session) {
      throw redirect(303, '/');
    }

    // Caso raro: sin error y sin sesión
    return fail(400, { error: 'No se pudo iniciar sesión. Inténtalo de nuevo.', values: { email } });
  }
};
