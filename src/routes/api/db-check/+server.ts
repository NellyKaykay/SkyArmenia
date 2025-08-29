// src/routes/api/db-check/+server.ts
import type { RequestHandler } from './$types';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
// import { supabase } from '$lib/server/supabase'; // lo usaremos cuando tengamos tablas

export const GET: RequestHandler = async () => {
  const anon = PUBLIC_SUPABASE_ANON_KEY || '';
  const payload = {
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY_present: !!anon,
    PUBLIC_SUPABASE_ANON_KEY_len: anon.length
  };

  return new Response(JSON.stringify(payload), {
    headers: { 'content-type': 'application/json' }
  });
};
