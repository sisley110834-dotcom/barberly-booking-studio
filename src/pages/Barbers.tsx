import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import { useAuthUser } from "@/components/RequireAuth";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/Wordmark";
import { isBarber } from "@/lib/roles";

export default function BarbersPage() {
  usePageTitle("Your Barberly — Barbers");
  const user = useAuthUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const barber = isBarber(user.user_metadata);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <Wordmark />
          <div className="flex min-w-0 items-center gap-3 text-sm">
            <span className="truncate">Hi {user.email}</span>
            {barber && (
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">barber</span>
            )}
            <Button variant="pillOutline" size="sm" onClick={signOut}>Sign Out</Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-24 text-center md:px-8">
        <div className="animate-fade-up rounded-[2rem] bg-beige px-8 py-16">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Coming soon</p>
          {barber ? (
            <>
              <h1 className="mt-4 text-3xl font-medium md:text-4xl">理髮師後台即將上線 — 下一個里程碑會加上個人檔案、服務項目與排班管理。</h1>
              <p className="mt-4 text-muted-foreground">Your barber dashboard is coming soon — profile, services &amp; schedule arrive in the next milestone.</p>
            </>
          ) : (
            <>
              <h1 className="mt-4 text-3xl font-medium md:text-4xl">附近的理髮師即將上線 — 下一個里程碑會加上瀏覽與預約功能。</h1>
              <p className="mt-4 text-muted-foreground">Barbers near you are coming soon — browse &amp; booking arrive in the next milestone.</p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
