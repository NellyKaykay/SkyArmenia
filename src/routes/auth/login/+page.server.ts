// src/routes/auth/login/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // Si ya hay sesión, redirige (ajusta la ruta destino si quieres)
  if (locals.session) {
    throw redirect(303, '/');
  }
  return {};
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await request.formData();
    const email = String(form.get('email') ?? '').trim().toLowerCase();
    const password = String(form.get('password') ?? '');

    if (!email || !password) {
      return fail(400, {
        error: 'Email y contraseña son obligatorios.',
        values: { email }
      });
    }

    const { error } = await locals.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return fail(400, {
        error: error.message,
        values: { email }
      });
    }

    // OK → redirige a home o a /account
    throw redirect(303, '/');
  }
};
