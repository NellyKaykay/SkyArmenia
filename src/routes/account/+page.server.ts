// src/routes/account/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // Si no hay sesión → redirige a login
  if (!locals.session) {
    throw redirect(303, '/auth/login');
  }

  // Carga del usuario desde Supabase
  const { data: { user }, error } = await locals.supabase.auth.getUser();
  if (error) {
    throw redirect(303, '/auth/login');
  }

  return {
    session: locals.session,
    user
  };
};
