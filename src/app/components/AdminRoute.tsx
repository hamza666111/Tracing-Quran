import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabaseClient } from "@/lib/supabase/client";
import { isAdminSession } from "@/lib/supabase/roles";

export function AdminRoute({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const { data } = await supabaseClient.auth.getSession();
        const isAdmin = await isAdminSession(data.session);

        if (active) {
          setAuthorized(isAdmin);
          setChecking(false);
        }
      } catch (_err) {
        if (active) {
          setAuthorized(false);
          setChecking(false);
        }
      }
    };

    load();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      try {
        const isAdmin = await isAdminSession(session);
        setAuthorized(isAdmin);
        setChecking(false);
      } catch (_err) {
        setAuthorized(false);
        setChecking(false);
      }
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
