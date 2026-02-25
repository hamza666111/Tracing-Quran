import { supabaseClient } from "@/lib/supabase/client";

export async function checkAdminSession() {
  const { data } = await supabaseClient.auth.getSession();
  const session = data.session;
  const userId = session?.user?.id;

  if (!userId) {
    return { session, isAdmin: false };
  }

  const { data: profile } = await supabaseClient
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  const isAdmin = profile?.role === 'admin' || session?.user?.app_metadata?.role === 'admin';
  return { session, isAdmin };
}
