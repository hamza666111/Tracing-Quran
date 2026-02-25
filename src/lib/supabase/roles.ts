import { Session } from '@supabase/supabase-js';
import { supabaseClient } from './client';

// Resolve admin privilege using JWT metadata first, then fall back to the users table.
export async function isAdminSession(session: Session | null): Promise<boolean> {
  const appRole = session?.user?.app_metadata?.role;
  if (appRole === 'admin') return true;

  const userId = session?.user?.id;
  if (!userId) return false;

  const { data, error } = await supabaseClient
    .from('users')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    return false;
  }

  return data?.role === 'admin';
}