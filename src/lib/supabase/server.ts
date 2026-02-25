import { createClient } from '@supabase/supabase-js';

// Prefer Vite-style names; fall back to legacy ones if present (server-side only).
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing Supabase URL (set VITE_SUPABASE_URL) for server client');
}

if (!serviceRoleKey) {
  throw new Error('Missing service role key (SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_SERVICE_ROLE_KEY) for server client');
}

export const supabaseServerClient = () =>
  createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
