import { supabaseClient } from "@/lib/supabase/client";

export async function checkAdminSession() {
  const { data } = await supabaseClient.auth.getSession();
  const session = data.session;
  const isAdmin = session?.user?.app_metadata?.role === "admin";

  return { session, isAdmin };
}
