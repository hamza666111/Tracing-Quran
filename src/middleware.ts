import { supabaseClient } from "@/lib/supabase/client";

export async function checkAdminSession() {
  const { data } = await supabaseClient.auth.getSession();
  const session = data.session;
  const role = session?.user?.app_metadata?.role;
  const isAdmin = role === 'admin';
  return { session, isAdmin };
}
