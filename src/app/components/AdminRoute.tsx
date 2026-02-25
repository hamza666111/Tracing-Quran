import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabaseClient } from "@/lib/supabase/client";

export function AdminRoute({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const { data } = await supabaseClient.auth.getSession();
      const session = data.session;
      const userId = session?.user?.id;

      if (!userId) {
        if (active) {
          setAuthorized(false);
          setChecking(false);
        }
        return;
      }

      const { data: profile } = await supabaseClient
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      const isAdmin = profile?.role === 'admin' || session?.user?.app_metadata?.role === 'admin';

      if (active) {
        setAuthorized(Boolean(isAdmin));
        setChecking(false);
      }
    };

    load();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      const userId = session?.user?.id;
      if (!userId) {
        setAuthorized(false);
        setChecking(false);
        return;
      }

      const { data: profile } = await supabaseClient
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      const isAdmin = profile?.role === 'admin' || session?.user?.app_metadata?.role === 'admin';
      setAuthorized(Boolean(isAdmin));
      setChecking(false);
    });

    return () => {
      active = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#0F3D3E]">
        Checking access...
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
}
