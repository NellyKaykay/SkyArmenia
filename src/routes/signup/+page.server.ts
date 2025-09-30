// src/routes/signup/+page.server.ts
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const actions: Actions = {
  // ÚNICA acción: debe coincidir con action="?/signup" en el <form>
  signup: async ({ request, locals }) => {
    const form = await request.formData();
    const name = String(form.get('name') ?? '').trim();
    const email = String(form.get('email') ?? '').trim().toLowerCase();
    const password = String(form.get('password') ?? '');

    // Validaciones mínimas
    if (!name || name.length < 2) {
      return fail(400, { error: 'Introduce tu nombre (mín. 2 caracteres).', values: { name, email } });
    }
    if (!isValidEmail(email)) {
      return fail(400, { error: 'El email no es válido.', values: { name, email } });
    }
    if (password.length < 6) {
      return fail(400, { error: 'La contraseña debe tener al menos 6 caracteres.', values: { name, email } });
    }

    // Registro sin magic/verify
    const { data, error } = await locals.supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });

    if (error) {
      const msg = (error.message || '').toLowerCase();
      if (/already|exists|duplicate/.test(msg)) {
        return fail(400, { error: 'Este email ya está registrado. Inicia sesión.', values: { name, email } });
      }
      if (/rate|too many/.test(msg)) {
        return fail(429, { error: 'Demasiados intentos. Prueba en unos minutos.', values: { name, email } });
      }
      return fail(400, { error: 'No se pudo crear la cuenta. Inténtalo de nuevo.', values: { name, email } });
    }

    // Con confirmación de email desactivada, llega sesión inmediata
    if (data?.session) {
      throw redirect(303, '/');
    }

    return fail(400, {
      error: 'No se creó la sesión. Desactiva la confirmación de email en Supabase → Auth → Email.',
      values: { name, email }
    });
  }
};
