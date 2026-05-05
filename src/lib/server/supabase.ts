// src/lib/server/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { env as publicEnv } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

// Anonymous client for general use
export const supabase = createClient(
  publicEnv.PUBLIC_SUPABASE_URL!,
  publicEnv.PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

// Service role client for admin operations (server-side only)
export const supabaseAdmin = createClient(
  publicEnv.PUBLIC_SUPABASE_URL!,
  privateEnv.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
