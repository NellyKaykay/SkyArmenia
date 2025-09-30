// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  // 1) Mira si hay sesión (lee cookies y NO contacta con Supabase todavía)
  const session = await locals.getSession();

  // 2) Si no hay sesión, devolvemos null sin errores
  if (!session) {
    return {
      user: null,
      session: false
    };
  }

  // 3) Con sesión, ahora sí consulta autenticada a Supabase
  const { data, error } = await locals.supabase.auth.getUser();

  // Si falla por cualquier motivo, tratamos como no logueado (sin spamear logs)
  const user = error ? null : data.user;

  const safeUser = user
    ? {
        id: user.id,
        email: user.email,
        name: (user.user_metadata as any)?.name ?? null
      }
    : null;

  return {
    user: safeUser,
    session: !!user
  };
};
