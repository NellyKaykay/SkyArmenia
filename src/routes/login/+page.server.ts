import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const actions: Actions = {
  // POST /login?action=login
  login: async ({ request }) => {
    const data = await request.formData();
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '');

    if (!email || !password) {
      return fail(400, { view: 'login', error: 'Falta email o contraseña', values: { email } });
    }

    // TODO: integrar Supabase signIn aquí
    // Simulación: OK → redirige al home
    throw redirect(303, '/');
  },

  // POST /login?action=signup
  signup: async ({ request }) => {
    const data = await request.formData();
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '');
    const confirm = String(data.get('confirm') ?? '');

    if (!name || !email || !password || !confirm) {
      return fail(400, { view: 'signup', error: 'Completa todos los campos', values: { name, email } });
    }
    if (password !== confirm) {
      return fail(400, { view: 'signup', error: 'Las contraseñas no coinciden', values: { name, email } });
    }

    // TODO: integrar Supabase signUp aquí
    // Simulación: OK → vuelve a /login con flag
    throw redirect(303, '/login?created=1');
  }
};
