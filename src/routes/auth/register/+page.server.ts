// src/routes/auth/register/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.session) throw redirect(303, '/');
  return {};
};

export const actions: Actions = {
  default: async ({ request, locals, url }) => {
    const form = await request.formData();
    const email = String(form.get('email') ?? '').trim().toLowerCase();
    const password = String(form.get('password') ?? '');
    const confirm  = String(form.get('confirm') ?? '');

    if (!email || !password || !confirm) {
      return fail(400, { error: 'Completa todos los campos.', values: { email } });
    }
    if (password.length < 6) {
      return fail(400, { error: 'La contraseña debe tener al menos 6 caracteres.', values: { email } });
    }
    if (password !== confirm) {
      return fail(400, { error: 'Las contraseñas no coinciden.', values: { email } });
    }

    const { data, error } = await locals.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${url.origin}/auth/callback`
      }
    });

    if (error) {
      return fail(400, { error: error.message, values: { email } });
    }

    // Si el proyecto requiere verificación por email, no habrá sesión inmediata
    if (data.user && !data.session) {
      throw redirect(303, '/auth/login?verify=1');
    }

    // Si no requiere verificación, sesión creada → a home
    throw redirect(303, '/');
  }
};
