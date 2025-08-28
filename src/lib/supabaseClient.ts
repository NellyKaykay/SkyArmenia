// src/lib/supabaseClient.ts
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

let client: SupabaseClient | null = null;

/** Cliente de Supabase para el navegador (singleton) */
export function supabaseBrowser(): SupabaseClient {
  if (!client) {
    client = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
  }
  return client;
}

export type { Session, User } from '@supabase/supabase-js';
