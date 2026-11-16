import { useEffect, useState } from "react";
import { Navigate, Outlet, useOutletContext } from "react-router-dom";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

type AuthState = { status: "loading" } | { status: "out" } | { status: "in"; user: User };

/** Client-only gate: renders child routes for a signed-in user, otherwise redirects to /login. */
export function RequireAuth() {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setState(data.user ? { status: "in", user: data.user } : { status: "out" });
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "SIGNED_OUT") setState({ status: "out" });
      else if (session?.user && (event === "SIGNED_IN" || event === "USER_UPDATED"))
        setState({ status: "in", user: session.user });
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (state.status === "loading") return <div className="min-h-screen bg-background" />;
  if (state.status === "out") return <Navigate to="/login" replace />;
  return <Outlet context={state.user} />;
}

export function useAuthUser(): User {
  return useOutletContext<User>();
}
