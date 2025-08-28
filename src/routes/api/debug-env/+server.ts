// src/routes/api/debug-env/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { env as PUBLIC } from '$env/dynamic/public';

export const GET: RequestHandler = async () => {
  const url = PUBLIC.PUBLIC_SUPABASE_URL ?? null;
  const key = PUBLIC.PUBLIC_SUPABASE_ANON_KEY ?? null;
  return new Response(
    JSON.stringify({
      PUBLIC_SUPABASE_URL: url,
      PUBLIC_SUPABASE_ANON_KEY_present: key ? true : false,
      PUBLIC_SUPABASE_ANON_KEY_len: key?.length ?? 0
    }),
    { headers: { 'content-type': 'application/json' } }
  );
};
