import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

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

export const load: PageServerLoad = async ({ cookies, fetch }) => {
  const supabase = makeSupabaseServerClient(cookies, fetch);

  // ✅ Más seguro que getSession()
  const { data: { user } } = await supabase.auth.getUser();

  if (user) throw redirect(303, '/');
  return {};
};

export const actions: Actions = {
  login: async ({ request, cookies, fetch }) => {
    const form = await request.formData();
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');

    if (!email || !password) {
      return fail(400, { error: 'Introduce email y contraseña.', values: { email } });
    }

    const supabase = makeSupabaseServerClient(cookies, fetch);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return fail(400, {
        error:
          error.message === 'Invalid login credentials'
            ? 'Credenciales inválidas. Revisa tu email y contraseña.'
            : error.message,
        values: { email }
      });
    }

    throw redirect(303, '/');
  }
};
