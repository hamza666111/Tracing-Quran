import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabaseClient } from "@/lib/supabase/client";

export function AdminRoute({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;

    const check = async () => {
      const { data } = await supabaseClient.auth.getSession();
      const session = data.session;
      const isAdmin = session?.user?.app_metadata?.role === "admin";
      if (active) {
        setAuthorized(Boolean(isAdmin));
        setChecking(false);
      }
    };

    check();

    const { data: authListener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      const isAdmin = session?.user?.app_metadata?.role === "admin";
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
