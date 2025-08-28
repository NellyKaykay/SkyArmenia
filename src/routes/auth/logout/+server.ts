// src/routes/auth/logout/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals }) => {
  await locals.supabase.auth.signOut();
  throw redirect(303, '/auth/login');
};

export const GET: RequestHandler = async (ev) => {
  return POST(ev);
};
