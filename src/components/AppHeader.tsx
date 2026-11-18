import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { useAuthUser } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/Wordmark";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { SHOP_HOME, isShop } from "@/lib/roles";

const navLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-1.5 transition-colors ${
    isActive
      ? "bg-white/80 font-medium text-foreground"
      : "text-muted-foreground hover:text-foreground"
  }`;

/** Signed-in header. Role-dependent bits come from `profiles.role`, never auth metadata. */
export function AppHeader() {
  const user = useAuthUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile(user.id);
  const shop = isShop(profile?.role);
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  async function becomeShop() {
    setError(null);
    setUpgrading(true);
    // RLS (profiles_update_own) scopes this to the caller's own row; the DB guard only allows customer|shop.
    const { error } = await supabase.from("profiles").update({ role: "shop" }).eq("id", user.id);
    setUpgrading(false);
    if (error) return setError(error.message);
    await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    navigate(SHOP_HOME);
  }

  return (
    <header className="border-b border-white/70 bg-white/40 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4 md:px-8">
        <Wordmark />
        {shop && (
          <nav className="flex items-center gap-1 text-sm" aria-label="Shop">
            <NavLink to="/shop" end className={navLink}>
              Shop setup
            </NavLink>
            <NavLink to="/shop/bookings" className={navLink}>
              Services &amp; slots
            </NavLink>
          </nav>
        )}
        <div className="flex min-w-0 items-center gap-3 text-sm">
          <span className="hidden truncate sm:inline">Hi {user.email}</span>
          {shop && (
            <span className="rounded-full bg-balloon-pink px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
              shop
            </span>
          )}
          {profile && !shop && (
            <Button variant="pill" size="sm" onClick={becomeShop} disabled={upgrading}>
              {upgrading ? "Please wait…" : "開店 / Become a shop"}
            </Button>
          )}
          <Button variant="pillOutline" size="sm" onClick={signOut}>
            Sign Out
          </Button>
        </div>
        {error && <p className="w-full text-right text-sm text-destructive">{error}</p>}
      </div>
    </header>
  );
}
