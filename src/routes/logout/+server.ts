// src/routes/logout/+server.ts
import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals }) => {
  await locals.supabase.auth.signOut();
  throw redirect(303, '/');
};

// (Opcional) soporta GET /logout por si alguien navega directo
export const GET: RequestHandler = async ({ locals }) => {
  await locals.supabase.auth.signOut();
  throw redirect(303, '/');
};
