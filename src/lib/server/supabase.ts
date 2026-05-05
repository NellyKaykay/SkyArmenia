// src/lib/server/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

// Anonymous client for general use
export const supabase = createClient(
  env.PUBLIC_SUPABASE_URL!,
  env.PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

// Service role client for admin operations (server-side only)
export const supabaseAdmin = createClient(
  env.PUBLIC_SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
