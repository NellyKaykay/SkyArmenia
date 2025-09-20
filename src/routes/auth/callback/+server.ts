// src/routes/auth/callback/+server.ts
import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
  // Aquí normalmente ya llega la sesión gestionada por Supabase en SSR
  // Redirige a la home o a donde quieras tras el login
  const next = url.searchParams.get('next') ?? '/';
  throw redirect(303, next);
};
