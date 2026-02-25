import { supabaseClient } from "@/lib/supabase/client";
import { isAdminSession } from "@/lib/supabase/roles";

export async function checkAdminSession() {
  const { data } = await supabaseClient.auth.getSession();
  const session = data.session;
  const isAdmin = await isAdminSession(session);
  return { session, isAdmin };
}
